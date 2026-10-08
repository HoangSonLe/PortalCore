import type { AppRoute } from './types';
import type { ReactNode } from 'react';

import { Flex, Spin } from 'antd';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router';

import { usePortal } from '../core/context';
import { useAuth, usePermission, useT } from '../core/hooks';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ForbiddenPage, NotFoundPage } from '../pages/ErrorPages';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { LoginPage } from '../pages/LoginPage';
import { safeRedirectPath } from '../utils/url';
import { useVisibleRoutes } from './useVisibleRoutes';
import { findFirstPath } from './utils';

export const FullPageLoading = () => {
  const t = useT();

  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
      <Spin size="large" tip={t('app.loading')}>
        <div style={{ width: 120, height: 60 }} />
      </Spin>
    </Flex>
  );
};

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { status, enabled } = useAuth();
  const location = useLocation();

  if (!enabled) return children;
  if (status === 'checking') return <FullPageLoading />;

  if (status === 'anonymous') {
    const redirect = `${location.pathname}${location.search}`;
    const query = redirect === '/' ? '' : `?redirect=${encodeURIComponent(redirect)}`;

    return <Navigate to={`/auth/login${query}`} replace />;
  }

  return children;
};

const RequireGuest = ({ children }: { children: ReactNode }) => {
  const { status } = useAuth();
  const [searchParams] = useSearchParams();

  if (status === 'checking') return <FullPageLoading />;
  if (status === 'authenticated') return <Navigate to={safeRedirectPath(searchParams.get('redirect'))} replace />;

  return children;
};

/** Trang chủ `/` -> chuyển tới trang đầu tiên user được phép vào. */
const HomeRedirect = () => {
  const visibleRoutes = useVisibleRoutes();
  const { pages } = usePortal();
  const firstPath = findFirstPath(visibleRoutes);

  return firstPath && firstPath !== '/' ? <Navigate to={firstPath} replace /> : (pages.notFound ?? <NotFoundPage />);
};

const useRenderRoutes = () => {
  const can = usePermission();
  const { pages } = usePortal();
  const forbidden = pages.forbidden ?? <ForbiddenPage />;

  const render = (routes: AppRoute[], parentPath = '/'): ReactNode[] =>
    routes.map((route, index) => {
      const allowed = can(route.permission, route.permissionMode);
      const element = allowed ? route.element : forbidden;
      const key = `${route.path ?? 'index'}-${index}`;

      if (route.index) return <Route key={key} index element={element} />;

      const children = route.children ?? [];
      const hasIndexChild = children.some(child => child.index);
      const fullPath = parentPath === '/' ? `/${route.path}` : `${parentPath}/${route.path}`;
      const firstChildPath = !hasIndexChild && !route.element ? findFirstPath(children, fullPath) : undefined;

      return (
        <Route key={key} path={route.path} element={element}>
          {firstChildPath && <Route index element={<Navigate to={firstChildPath} replace />} />}
          {render(children, fullPath)}
        </Route>
      );
    });

  return render;
};

const AppRoutes = () => {
  const { routes, authAdapter, pages } = usePortal();
  const renderRoutes = useRenderRoutes();
  const hasRootIndex = routes.some(route => route.index);

  return (
    <Routes>
      {authAdapter && (
        <Route
          path="/auth"
          element={
            <RequireGuest>
              <AuthLayout />
            </RequireGuest>
          }
        >
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={pages.login ?? <LoginPage />} />
          {authAdapter.forgotPassword && (
            <Route path="forgot-password" element={pages.forgotPassword ?? <ForgotPasswordPage />} />
          )}
          <Route path="*" element={<Navigate to="login" replace />} />
        </Route>
      )}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {!hasRootIndex && <Route index element={<HomeRedirect />} />}
        {renderRoutes(routes)}
        <Route path="403" element={pages.forbidden ?? <ForbiddenPage />} />
        <Route path="*" element={pages.notFound ?? <NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export const PortalRouter = () => {
  const { basePath } = usePortal();

  return (
    <BrowserRouter basename={basePath}>
      <AppRoutes />
    </BrowserRouter>
  );
};

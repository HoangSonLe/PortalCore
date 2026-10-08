import { jsx, jsxs } from "react/jsx-runtime";
import { Flex, Spin } from "antd";
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation } from "react-router";
import { usePortal } from "../core/context.js";
import { ErrorBoundary } from "../core/ErrorBoundary.js";
import { useT, usePermission, useAuth } from "../core/hooks.js";
import { AppLayout } from "../layouts/AppLayout.js";
import { AuthLayout } from "../layouts/AuthLayout.js";
import { ForbiddenPage, NotFoundPage } from "../pages/ErrorPages.js";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage.js";
import { LoginPage } from "../pages/LoginPage.js";
import { safeRedirectPath } from "../utils/url.js";
import { useVisibleRoutes } from "./useVisibleRoutes.js";
import { findFirstPath } from "./utils.js";
const FullPageLoading = () => {
  const t = useT();
  return /* @__PURE__ */ jsx(Flex, { align: "center", justify: "center", style: { minHeight: "100vh" }, children: /* @__PURE__ */ jsx(Spin, { size: "large", tip: t("app.loading"), children: /* @__PURE__ */ jsx("div", { style: { width: 120, height: 60 } }) }) });
};
const RequireAuth = ({ children }) => {
  const { status, enabled } = useAuth();
  const location = useLocation();
  if (!enabled) return children;
  if (status === "checking") return /* @__PURE__ */ jsx(FullPageLoading, {});
  if (status === "anonymous") {
    const redirect = `${location.pathname}${location.search}`;
    const query = redirect === "/" ? "" : `?redirect=${encodeURIComponent(redirect)}`;
    return /* @__PURE__ */ jsx(Navigate, { to: `/auth/login${query}`, replace: true });
  }
  return children;
};
const RequireGuest = ({ children }) => {
  const { status } = useAuth();
  const [searchParams] = useSearchParams();
  if (status === "checking") return /* @__PURE__ */ jsx(FullPageLoading, {});
  if (status === "authenticated") return /* @__PURE__ */ jsx(Navigate, { to: safeRedirectPath(searchParams.get("redirect")), replace: true });
  return children;
};
const HomeRedirect = () => {
  const visibleRoutes = useVisibleRoutes();
  const { pages } = usePortal();
  const firstPath = findFirstPath(visibleRoutes);
  return firstPath && firstPath !== "/" ? /* @__PURE__ */ jsx(Navigate, { to: firstPath, replace: true }) : pages.notFound ?? /* @__PURE__ */ jsx(NotFoundPage, {});
};
const useRenderRoutes = () => {
  const can = usePermission();
  const { pages } = usePortal();
  const forbidden = pages.forbidden ?? /* @__PURE__ */ jsx(ForbiddenPage, {});
  const render = (routes, parentPath = "/") => routes.map((route, index) => {
    const allowed = can(route.permission, route.permissionMode);
    const element = allowed ? route.element : forbidden;
    const key = `${route.path ?? "index"}-${index}`;
    if (route.index) return /* @__PURE__ */ jsx(Route, { index: true, element }, key);
    const children = route.children ?? [];
    const hasIndexChild = children.some((child) => child.index);
    const fullPath = parentPath === "/" ? `/${route.path}` : `${parentPath}/${route.path}`;
    const firstChildPath = !hasIndexChild && !route.element ? findFirstPath(children, fullPath) : void 0;
    return /* @__PURE__ */ jsxs(Route, { path: route.path, element, children: [
      firstChildPath && /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(Navigate, { to: firstChildPath, replace: true }) }),
      render(children, fullPath)
    ] }, key);
  });
  return render;
};
const AppRoutes = () => {
  const { routes, authAdapter, pages } = usePortal();
  const renderRoutes = useRenderRoutes();
  const hasRootIndex = routes.some((route) => route.index);
  return /* @__PURE__ */ jsxs(Routes, { children: [
    authAdapter && /* @__PURE__ */ jsxs(
      Route,
      {
        path: "/auth",
        element: /* @__PURE__ */ jsx(RequireGuest, { children: /* @__PURE__ */ jsx(AuthLayout, {}) }),
        children: [
          /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(Navigate, { to: "login", replace: true }) }),
          /* @__PURE__ */ jsx(Route, { path: "login", element: pages.login ?? /* @__PURE__ */ jsx(LoginPage, {}) }),
          authAdapter.forgotPassword && /* @__PURE__ */ jsx(Route, { path: "forgot-password", element: pages.forgotPassword ?? /* @__PURE__ */ jsx(ForgotPasswordPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(Navigate, { to: "login", replace: true }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Route,
      {
        element: /* @__PURE__ */ jsx(RequireAuth, { children: /* @__PURE__ */ jsx(AppLayout, {}) }),
        children: [
          !hasRootIndex && /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(HomeRedirect, {}) }),
          renderRoutes(routes),
          /* @__PURE__ */ jsx(Route, { path: "403", element: pages.forbidden ?? /* @__PURE__ */ jsx(ForbiddenPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "*", element: pages.notFound ?? /* @__PURE__ */ jsx(NotFoundPage, {}) })
        ]
      }
    )
  ] });
};
const PortalRouter = () => {
  const { basePath, onError } = usePortal();
  return /* @__PURE__ */ jsx(ErrorBoundary, { onError, children: /* @__PURE__ */ jsx(BrowserRouter, { basename: basePath, children: /* @__PURE__ */ jsx(AppRoutes, {}) }) });
};
export {
  FullPageLoading,
  PortalRouter
};
//# sourceMappingURL=PortalRouter.js.map

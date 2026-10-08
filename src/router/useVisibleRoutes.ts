import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { usePortal } from '../core/context';
import { usePermission } from '../core/hooks';
import { filterRoutes, flattenRoutes, matchFlatRoute } from './utils';

/** Các route user được phép thấy (dùng cho menu). */
export const useVisibleRoutes = () => {
  const { routes } = usePortal();
  const can = usePermission();

  return useMemo(() => filterRoutes(routes, route => can(route.permission, route.permissionMode)), [routes, can]);
};

/**
 * Route khớp URL hiện tại, kèm chuỗi route cha (breadcrumb).
 * Dùng được trong mọi trang con của layout: `const current = useCurrentRoute(); current?.route.title`.
 */
export const useCurrentRoute = () => {
  const { routes } = usePortal();
  const { pathname } = useLocation();
  const flatRoutes = useMemo(() => flattenRoutes(routes), [routes]);

  return useMemo(() => matchFlatRoute(flatRoutes, pathname), [flatRoutes, pathname]);
};

import type { AppRoute, FlatRoute } from './types';

import { matchPath } from 'react-router';

import { joinPath } from '../utils/url';

export type CanAccessRoute = (route: AppRoute) => boolean;

const resolvePath = (parentPath: string, route: AppRoute) =>
  route.index ? parentPath : joinPath(parentPath, route.path);

/**
 * Giữ lại các route được phép. Route nhóm (không có element) mà không còn con nào thì bỏ luôn,
 * để menu không còn nhóm rỗng.
 */
export const filterRoutes = (routes: AppRoute[], canAccess: CanAccessRoute): AppRoute[] =>
  routes.flatMap(route => {
    if (!canAccess(route)) return [];

    if (!route.children) return [route];

    const children = filterRoutes(route.children, canAccess);

    if (!route.element && children.length === 0) return [];

    return [{ ...route, children }];
  });

/** Trang đầu tiên có thể vào được (bỏ qua trang ẩn và path động `:id`) — dùng cho redirect trang chủ. */
export const findFirstPath = (routes: AppRoute[], parentPath = '/'): string | undefined => {
  for (const route of routes) {
    if (route.hideInMenu || route.path?.includes(':')) continue;

    const fullPath = resolvePath(parentPath, route);

    if (route.children?.length) {
      const childPath = findFirstPath(route.children, fullPath);

      if (childPath) return childPath;
    }

    if (route.element) return fullPath;
  }

  return undefined;
};

export const flattenRoutes = (
  routes: AppRoute[],
  parentPath = '/',
  parentChain: FlatRoute['chain'] = [],
): FlatRoute[] =>
  routes.flatMap(route => {
    const fullPath = resolvePath(parentPath, route);
    const chain = [...parentChain, { fullPath, route }];
    const self: FlatRoute = { fullPath, route, chain };

    return [self, ...flattenRoutes(route.children ?? [], fullPath, chain)];
  });

/** Route khớp với pathname hiện tại (ưu tiên route sâu nhất). */
export const matchFlatRoute = (flatRoutes: FlatRoute[], pathname: string): FlatRoute | undefined => {
  let best: FlatRoute | undefined;

  for (const flat of flatRoutes) {
    if (!matchPath({ path: flat.fullPath, end: true }, pathname)) continue;

    if (!best || flat.chain.length > best.chain.length) best = flat;
  }

  return best;
};

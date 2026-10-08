import { matchPath } from "react-router";
import { joinPath } from "../utils/url.js";
const resolvePath = (parentPath, route) => route.index ? parentPath : joinPath(parentPath, route.path);
const filterRoutes = (routes, canAccess) => routes.flatMap((route) => {
  if (!canAccess(route)) return [];
  if (!route.children) return [route];
  const children = filterRoutes(route.children, canAccess);
  if (!route.element && children.length === 0) return [];
  return [{ ...route, children }];
});
const findFirstPath = (routes, parentPath = "/") => {
  for (const route of routes) {
    if (route.hideInMenu || route.path?.includes(":")) continue;
    const fullPath = resolvePath(parentPath, route);
    if (route.children?.length) {
      const childPath = findFirstPath(route.children, fullPath);
      if (childPath) return childPath;
    }
    if (route.element) return fullPath;
  }
  return void 0;
};
const flattenRoutes = (routes, parentPath = "/", parentChain = []) => routes.flatMap((route) => {
  const fullPath = resolvePath(parentPath, route);
  const chain = [...parentChain, { fullPath, route }];
  const self = { fullPath, route, chain };
  return [self, ...flattenRoutes(route.children ?? [], fullPath, chain)];
});
const matchFlatRoute = (flatRoutes, pathname) => {
  let best;
  for (const flat of flatRoutes) {
    if (!matchPath({ path: flat.fullPath, end: true }, pathname)) continue;
    if (!best || flat.chain.length > best.chain.length) best = flat;
  }
  return best;
};
export {
  filterRoutes,
  findFirstPath,
  flattenRoutes,
  matchFlatRoute
};
//# sourceMappingURL=utils.js.map

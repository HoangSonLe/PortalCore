import { useMemo } from "react";
import { useLocation } from "react-router";
import { usePortal } from "../core/context.js";
import { usePermission } from "../core/hooks.js";
import { flattenRoutes, matchFlatRoute, filterRoutes } from "./utils.js";
const useVisibleRoutes = () => {
  const { routes } = usePortal();
  const can = usePermission();
  return useMemo(() => filterRoutes(routes, (route) => can(route.permission, route.permissionMode)), [routes, can]);
};
const useCurrentRoute = () => {
  const { routes } = usePortal();
  const { pathname } = useLocation();
  const flatRoutes = useMemo(() => flattenRoutes(routes), [routes]);
  return useMemo(() => matchFlatRoute(flatRoutes, pathname), [flatRoutes, pathname]);
};
export {
  useCurrentRoute,
  useVisibleRoutes
};
//# sourceMappingURL=useVisibleRoutes.js.map

import { jsx } from "react/jsx-runtime";
import { usePermission } from "../core/hooks.js";
import { ForbiddenPage } from "../pages/ErrorPages.js";
const Can = ({ permission, mode, fallback = null, children }) => {
  const can = usePermission();
  return can(permission, mode) ? children : fallback;
};
const withPermission = (Component, permission, options = {}) => (props) => /* @__PURE__ */ jsx(Can, { permission, mode: options.mode, fallback: options.fallback ?? /* @__PURE__ */ jsx(ForbiddenPage, {}), children: /* @__PURE__ */ jsx(Component, { ...props }) });
export {
  Can,
  withPermission
};
//# sourceMappingURL=Can.js.map

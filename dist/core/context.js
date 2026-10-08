import { useContext, createContext } from "react";
const PortalContext = createContext(null);
const usePortal = () => {
  const value = useContext(PortalContext);
  if (!value) throw new Error("[portal-core] Thiếu <PortalProvider> ở gốc ứng dụng.");
  return value;
};
export {
  PortalContext,
  usePortal
};
//# sourceMappingURL=context.js.map

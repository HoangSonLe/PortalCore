import { useCallback } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { hasPermission } from "../permission/permission.js";
import { usePortal } from "./context.js";
const useT = () => usePortal().t;
const useHttp = () => usePortal().http;
const useEnv = () => usePortal().env;
const useAppInfo = () => usePortal().app;
const usePermission = () => {
  const { authStore, authAdapter } = usePortal();
  const permissions = useStore(authStore, (state) => state.permissions);
  return useCallback(
    (required, mode) => !authAdapter || hasPermission(permissions, required, mode),
    [authAdapter, permissions]
  );
};
const useAuth = () => {
  const { authStore, authService, authAdapter } = usePortal();
  const state = useStore(
    authStore,
    useShallow((s) => ({ status: s.status, user: s.user, permissions: s.permissions, tokens: s.tokens }))
  );
  const can = usePermission();
  return {
    ...state,
    isAuthenticated: state.status === "authenticated",
    enabled: !!authAdapter,
    canForgotPassword: !!authAdapter?.forgotPassword,
    can,
    login: authService?.login ?? (async () => void 0),
    logout: authService?.logout ?? (async () => void 0),
    reloadSession: authService?.reloadSession ?? (async () => void 0),
    forgotPassword: authAdapter?.forgotPassword
  };
};
const useAppSettings = () => {
  const { appStore, locales } = usePortal();
  return {
    ...useStore(
      appStore,
      useShallow((s) => s)
    ),
    locales
  };
};
export {
  useAppInfo,
  useAppSettings,
  useAuth,
  useEnv,
  useHttp,
  usePermission,
  useT
};
//# sourceMappingURL=hooks.js.map

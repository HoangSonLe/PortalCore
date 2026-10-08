import type { PermissionMode, PermissionRequirement } from '../permission/permission';

import { useCallback } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { hasPermission } from '../permission/permission';
import { usePortal } from './context';

export const useT = () => usePortal().t;

export const useHttp = () => usePortal().http;

export const useEnv = <T extends Record<string, string | undefined> = Record<string, string | undefined>>() =>
  usePortal().env as T;

export const useAppInfo = () => usePortal().app;

/** Kiểm tra quyền. Khi app không bật auth thì luôn trả true. */
export const usePermission = () => {
  const { authStore, authAdapter } = usePortal();
  const permissions = useStore(authStore, state => state.permissions);

  return useCallback(
    (required: PermissionRequirement, mode?: PermissionMode) =>
      !authAdapter || hasPermission(permissions, required, mode),
    [authAdapter, permissions],
  );
};

export const useAuth = () => {
  const { authStore, authService, authAdapter } = usePortal();
  const state = useStore(
    authStore,
    useShallow(s => ({ status: s.status, user: s.user, permissions: s.permissions, tokens: s.tokens })),
  );
  const can = usePermission();

  return {
    ...state,
    isAuthenticated: state.status === 'authenticated',
    enabled: !!authAdapter,
    canForgotPassword: !!authAdapter?.forgotPassword,
    can,
    login: authService?.login ?? (async () => undefined),
    logout: authService?.logout ?? (async () => undefined),
    reloadSession: authService?.reloadSession ?? (async () => undefined),
    forgotPassword: authAdapter?.forgotPassword,
  };
};

export const useAppSettings = () => {
  const { appStore, locales } = usePortal();

  return {
    ...useStore(
      appStore,
      useShallow(s => s),
    ),
    locales,
  };
};

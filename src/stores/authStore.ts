import type { AuthSession, AuthStatus, AuthTokens, AuthUser } from '../auth/types';
import type { StateStorage } from 'zustand/middleware';

import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AuthState {
  status: AuthStatus;
  tokens?: AuthTokens;
  user?: AuthUser;
  permissions: string[];
  setTokens: (tokens: AuthTokens) => void;
  setSession: (session: AuthSession) => void;
  clear: () => void;
}

export type AuthStore = ReturnType<typeof createAuthStore>;

/**
 * Store auth cho 1 app. Chỉ `tokens` được lưu xuống storage; user/permissions luôn lấy lại từ server
 * khi mở app để quyền không bị cũ.
 */
export const createAuthStore = (storageKey: string, storage: StateStorage) => {
  const store = createStore<AuthState>()(
    persist(
      set => ({
        status: 'anonymous',
        tokens: undefined,
        user: undefined,
        permissions: [],
        setTokens: tokens => set({ tokens }),
        setSession: ({ user, permissions }) => set({ user, permissions, status: 'authenticated' }),
        clear: () => set({ tokens: undefined, user: undefined, permissions: [], status: 'anonymous' }),
      }),
      {
        name: `${storageKey}:auth`,
        storage: createJSONStorage(() => storage),
        partialize: state => ({ tokens: state.tokens }),
      },
    ),
  );

  // localStorage/sessionStorage hydrate đồng bộ -> biết ngay có token hay không.
  if (store.getState().tokens?.accessToken) {
    store.setState({ status: 'checking' });
  }

  return store;
};

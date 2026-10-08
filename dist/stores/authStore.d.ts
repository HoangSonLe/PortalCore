import { AuthSession, AuthStatus, AuthTokens, AuthUser } from '../auth/types';
import { StateStorage } from 'zustand/middleware';
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
export declare const createAuthStore: (storageKey: string, storage: StateStorage) => Omit<import('zustand').StoreApi<AuthState>, "setState" | "persist"> & {
    setState(partial: AuthState | Partial<AuthState> | ((state: AuthState) => AuthState | Partial<AuthState>), replace?: false | undefined): unknown;
    setState(state: AuthState | ((state: AuthState) => AuthState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<AuthState, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<AuthState, unknown, unknown>>;
    };
};

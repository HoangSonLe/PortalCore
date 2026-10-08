import { Locale } from '../i18n/messages';
import { StateStorage } from 'zustand/middleware';
export type ThemeMode = 'light' | 'dark';
export interface AppState {
    themeMode: ThemeMode;
    locale: Locale;
    siderCollapsed: boolean;
    setThemeMode: (mode: ThemeMode) => void;
    toggleThemeMode: () => void;
    setLocale: (locale: Locale) => void;
    setSiderCollapsed: (collapsed: boolean) => void;
}
export type AppStore = ReturnType<typeof createAppStore>;
/** Tuỳ chọn giao diện của người dùng (theme, ngôn ngữ, thu gọn menu) — lưu theo từng app. */
export declare const createAppStore: (storageKey: string, storage: StateStorage, defaults: {
    themeMode: ThemeMode;
    locale: Locale;
}) => Omit<import('zustand').StoreApi<AppState>, "setState" | "persist"> & {
    setState(partial: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>), replace?: false | undefined): unknown;
    setState(state: AppState | ((state: AppState) => AppState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<AppState, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AppState) => void) => () => void;
        onFinishHydration: (fn: (state: AppState) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<AppState, unknown, unknown>>;
    };
};

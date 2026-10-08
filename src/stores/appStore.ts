import type { Locale } from '../i18n/messages';
import type { StateStorage } from 'zustand/middleware';

import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
export const createAppStore = (
  storageKey: string,
  storage: StateStorage,
  defaults: { themeMode: ThemeMode; locale: Locale },
) =>
  createStore<AppState>()(
    persist(
      (set, get) => ({
        themeMode: defaults.themeMode,
        locale: defaults.locale,
        siderCollapsed: false,
        setThemeMode: themeMode => set({ themeMode }),
        toggleThemeMode: () => set({ themeMode: get().themeMode === 'dark' ? 'light' : 'dark' }),
        setLocale: locale => set({ locale }),
        setSiderCollapsed: siderCollapsed => set({ siderCollapsed }),
      }),
      {
        name: `${storageKey}:app`,
        storage: createJSONStorage(() => storage),
        partialize: ({ themeMode, locale, siderCollapsed }) => ({ themeMode, locale, siderCollapsed }),
      },
    ),
  );

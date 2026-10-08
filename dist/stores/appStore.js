import { createStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
const createAppStore = (storageKey, storage, defaults) => createStore()(
  persist(
    (set, get) => ({
      themeMode: defaults.themeMode,
      locale: defaults.locale,
      siderCollapsed: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      toggleThemeMode: () => set({ themeMode: get().themeMode === "dark" ? "light" : "dark" }),
      setLocale: (locale) => set({ locale }),
      setSiderCollapsed: (siderCollapsed) => set({ siderCollapsed })
    }),
    {
      name: `${storageKey}:app`,
      storage: createJSONStorage(() => storage),
      partialize: ({ themeMode, locale, siderCollapsed }) => ({ themeMode, locale, siderCollapsed })
    }
  )
);
export {
  createAppStore
};
//# sourceMappingURL=appStore.js.map

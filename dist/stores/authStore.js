import { createStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
const createAuthStore = (storageKey, storage) => {
  const store = createStore()(
    persist(
      (set) => ({
        status: "anonymous",
        tokens: void 0,
        user: void 0,
        permissions: [],
        setTokens: (tokens) => set({ tokens }),
        setSession: ({ user, permissions }) => set({ user, permissions, status: "authenticated" }),
        clear: () => set({ tokens: void 0, user: void 0, permissions: [], status: "anonymous" })
      }),
      {
        name: `${storageKey}:auth`,
        storage: createJSONStorage(() => storage),
        partialize: (state) => ({ tokens: state.tokens })
      }
    )
  );
  if (store.getState().tokens?.accessToken) {
    store.setState({ status: "checking" });
  }
  return store;
};
export {
  createAuthStore
};
//# sourceMappingURL=authStore.js.map

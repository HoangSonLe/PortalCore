const createAuthService = (adapter, store) => {
  const reloadSession = async () => {
    try {
      store.getState().setSession(await adapter.getSession());
    } catch (error) {
      store.getState().clear();
      throw error;
    }
  };
  const refresh = async () => {
    const current = store.getState().tokens;
    if (!adapter.refresh || !current?.refreshToken) return null;
    try {
      const tokens = await adapter.refresh(current.refreshToken);
      store.getState().setTokens({ ...tokens, refreshToken: tokens.refreshToken ?? current.refreshToken });
      return tokens.accessToken;
    } catch {
      return null;
    }
  };
  return {
    login: async (credentials) => {
      store.getState().setTokens(await adapter.login(credentials));
      await reloadSession();
    },
    logout: async () => {
      const tokens = store.getState().tokens;
      try {
        await adapter.logout?.(tokens);
      } catch {
      } finally {
        store.getState().clear();
      }
    },
    reloadSession,
    refresh
  };
};
const bindHttpAuth = (http, store, service, adapter) => {
  http.setAuthHandlers({
    getAccessToken: () => store.getState().tokens?.accessToken,
    refreshAccessToken: adapter.refresh ? service.refresh : void 0,
    onUnauthorized: () => store.getState().clear()
  });
  return () => http.setAuthHandlers(void 0);
};
export {
  bindHttpAuth,
  createAuthService
};
//# sourceMappingURL=service.js.map

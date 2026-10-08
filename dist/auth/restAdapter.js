const unwrap = (response) => {
  if (!response || typeof response !== "object") return response;
  if ("data" in response) return response.data;
  if ("value" in response) return response.value;
  return response;
};
const defaultMapTokens = (response) => {
  const source = response?.accessToken || response?.access_token ? response : unwrap(response);
  const accessToken = source?.accessToken ?? source?.access_token;
  if (!accessToken) throw new Error("Login response does not contain an access token");
  return {
    accessToken,
    refreshToken: source?.refreshToken ?? source?.refresh_token,
    expiresAt: source?.expiresAt
  };
};
const defaultMapSession = (response) => {
  const source = response?.user ? response : unwrap(response);
  return {
    user: source?.user ?? source,
    permissions: Array.isArray(source?.permissions) ? source.permissions : []
  };
};
const createRestAuthAdapter = (http, options = {}) => {
  const endpoints = {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    session: "/auth/me",
    ...options.endpoints
  };
  const mapTokens = options.mapTokens ?? defaultMapTokens;
  const mapSession = options.mapSession ?? defaultMapSession;
  const refreshBody = options.refreshBody ?? ((refreshToken) => ({ refreshToken }));
  const adapter = {
    login: async (credentials) => mapTokens(
      await http.post(endpoints.login, credentials, { skipAuth: true, skipRefresh: true, notify: { error: false } })
    ),
    getSession: async () => mapSession(await http.get(endpoints.session, { notify: { error: false } })),
    refresh: async (refreshToken) => mapTokens(
      await http.post(endpoints.refresh, refreshBody(refreshToken), {
        skipAuth: true,
        skipRefresh: true,
        notify: { error: false }
      })
    ),
    logout: async () => {
      await http.post(endpoints.logout, void 0, { skipRefresh: true, notify: { error: false } });
    }
  };
  if (endpoints.forgotPassword) {
    const url = endpoints.forgotPassword;
    adapter.forgotPassword = async (email) => {
      await http.post(url, { email }, { skipAuth: true, notify: { error: false } });
    };
  }
  return adapter;
};
export {
  createRestAuthAdapter,
  defaultMapSession,
  defaultMapTokens
};
//# sourceMappingURL=restAdapter.js.map

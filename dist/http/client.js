import axios from "axios";
import { buildPath } from "../utils/url.js";
import { defaultGetErrorMessage, toHttpError } from "./errors.js";
const createHttpClient = (options = {}) => {
  const { getHeaders, getErrorMessage = defaultGetErrorMessage, ...axiosConfig } = options;
  const instance = axios.create({
    baseURL: "/api",
    headers: { Accept: "application/json" },
    ...axiosConfig
  });
  let authHandlers;
  let notifier;
  let refreshPromise = null;
  const refreshOnce = () => {
    const refresh = authHandlers?.refreshAccessToken;
    if (!refresh) return Promise.resolve(null);
    if (!refreshPromise) {
      refreshPromise = refresh().catch(() => null).finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise;
  };
  const toAxiosConfig = (method, url, requestOptions = {}) => {
    const {
      pathVars,
      params,
      body,
      notify: _notify,
      skipAuth,
      skipRefresh: _skipRefresh,
      headers,
      ...rest
    } = requestOptions;
    const finalHeaders = {};
    for (const [key, value] of Object.entries(getHeaders?.() ?? {})) {
      if (value !== void 0 && value !== null && value !== "") finalHeaders[key] = String(value);
    }
    const token = skipAuth ? void 0 : authHandlers?.getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
    return {
      ...rest,
      method,
      url: buildPath(url, pathVars),
      params,
      data: body,
      headers: { ...finalHeaders, ...headers }
    };
  };
  const send = async (method, url, requestOptions = {}) => {
    const { notify, skipAuth, skipRefresh } = requestOptions;
    let unauthorizedHandled = false;
    try {
      let response;
      const usedToken = skipAuth ? void 0 : authHandlers?.getAccessToken();
      try {
        response = await instance.request(toAxiosConfig(method, url, requestOptions));
      } catch (error) {
        const status = axios.isAxiosError(error) ? error.response?.status : void 0;
        const canRefresh = status === 401 && !skipAuth && !skipRefresh && !!authHandlers?.refreshAccessToken;
        if (!canRefresh) throw error;
        const latestToken = authHandlers?.getAccessToken();
        const newToken = latestToken && latestToken !== usedToken ? latestToken : await refreshOnce();
        if (!newToken) {
          unauthorizedHandled = true;
          authHandlers?.onUnauthorized?.();
          throw error;
        }
        response = await instance.request(toAxiosConfig(method, url, requestOptions));
      }
      if (notify?.success) notifier?.success(notify.success);
      return response;
    } catch (error) {
      const httpError = await toHttpError(error, getErrorMessage);
      const isSessionExpired = httpError.status === 401 && !skipAuth;
      if (isSessionExpired && !unauthorizedHandled) authHandlers?.onUnauthorized?.();
      if (notify?.error !== false && !isSessionExpired) {
        notifier?.error(typeof notify?.error === "string" ? notify.error : httpError.serverMessage, httpError);
      }
      throw httpError;
    }
  };
  const request = async (method, url, requestOptions) => (await send(method, url, requestOptions)).data;
  return {
    axios: instance,
    request,
    raw: send,
    get: (url, requestOptions) => request("get", url, requestOptions),
    delete: (url, requestOptions) => request("delete", url, requestOptions),
    post: (url, body, requestOptions) => request("post", url, { ...requestOptions, body }),
    put: (url, body, requestOptions) => request("put", url, { ...requestOptions, body }),
    patch: (url, body, requestOptions) => request("patch", url, { ...requestOptions, body }),
    setAuthHandlers: (handlers) => {
      authHandlers = handlers;
    },
    setNotifier: (value) => {
      notifier = value;
    }
  };
};
export {
  createHttpClient
};
//# sourceMappingURL=client.js.map

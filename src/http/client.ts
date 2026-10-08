import type { AuthHandlers, HttpClient, HttpClientOptions, HttpMethod, Notifier, RequestOptions } from './types';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import axios from 'axios';

import { buildPath } from '../utils/url';
import { defaultGetErrorMessage, toHttpError } from './errors';

/**
 * Tạo HTTP client bọc axios.
 *
 * Khác với bản cũ ở các core công ty:
 * - Không cài interceptor trong React effect -> không phải gắn/gỡ lại mỗi khi token đổi.
 * - Refresh token "single-flight": N request cùng bị 401 chỉ gọi refresh đúng 1 lần,
 *   rồi mỗi request được gửi lại đúng 1 lần (không reject oan, không gửi trùng).
 * - Không phụ thuộc định dạng response backend: trả về `response.data` nguyên vẹn.
 */
export const createHttpClient = (options: HttpClientOptions = {}): HttpClient => {
  const { getHeaders, getErrorMessage = defaultGetErrorMessage, ...axiosConfig } = options;

  const instance = axios.create({
    baseURL: '/api',
    headers: { Accept: 'application/json' },
    ...axiosConfig,
  });

  let authHandlers: AuthHandlers | undefined;
  let notifier: Notifier | undefined;
  let refreshPromise: Promise<string | null> | null = null;

  const refreshOnce = (): Promise<string | null> => {
    const refresh = authHandlers?.refreshAccessToken;

    if (!refresh) return Promise.resolve(null);

    if (!refreshPromise) {
      refreshPromise = refresh()
        .catch(() => null)
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  };

  const toAxiosConfig = (method: HttpMethod, url: string, requestOptions: RequestOptions = {}): AxiosRequestConfig => {
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
    const finalHeaders: Record<string, string> = {};

    for (const [key, value] of Object.entries(getHeaders?.() ?? {})) {
      if (value !== undefined && value !== null && value !== '') finalHeaders[key] = String(value);
    }

    const token = skipAuth ? undefined : authHandlers?.getAccessToken();

    if (token) finalHeaders.Authorization = `Bearer ${token}`;

    return {
      ...rest,
      method,
      url: buildPath(url, pathVars),
      params,
      data: body,
      headers: { ...finalHeaders, ...(headers as Record<string, string> | undefined) },
    };
  };

  const send = async <T>(method: HttpMethod, url: string, requestOptions: RequestOptions = {}) => {
    const { notify, skipAuth, skipRefresh } = requestOptions;
    let unauthorizedHandled = false;

    try {
      let response: AxiosResponse<T>;
      const usedToken = skipAuth ? undefined : authHandlers?.getAccessToken();

      try {
        response = await instance.request<T>(toAxiosConfig(method, url, requestOptions));
      } catch (error) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        const canRefresh = status === 401 && !skipAuth && !skipRefresh && !!authHandlers?.refreshAccessToken;

        if (!canRefresh) throw error;

        // Request gửi bằng token cũ nhưng 401 về muộn, sau khi request khác đã refresh xong
        // -> dùng luôn token mới, không refresh thêm lần nữa.
        const latestToken = authHandlers?.getAccessToken();
        const newToken = latestToken && latestToken !== usedToken ? latestToken : await refreshOnce();

        if (!newToken) {
          unauthorizedHandled = true;
          authHandlers?.onUnauthorized?.();
          throw error;
        }

        // Gửi lại đúng 1 lần, với token mới (toAxiosConfig đọc lại getAccessToken).
        response = await instance.request<T>(toAxiosConfig(method, url, requestOptions));
      }

      if (notify?.success) notifier?.success(notify.success);

      return response;
    } catch (error) {
      const httpError = await toHttpError(error, getErrorMessage);
      // 401 trên request có gắn token = phiên hết hạn (đã thử refresh mà không được) -> báo ra ngoài, không toast lỗi.
      // 401 trên request skipAuth (vd sai mật khẩu khi login) là lỗi nghiệp vụ bình thường -> vẫn toast.
      const isSessionExpired = httpError.status === 401 && !skipAuth;

      if (isSessionExpired && !unauthorizedHandled) authHandlers?.onUnauthorized?.();

      if (notify?.error !== false && !isSessionExpired) {
        notifier?.error(typeof notify?.error === 'string' ? notify.error : httpError.serverMessage, httpError);
      }

      throw httpError;
    }
  };

  const request = async <T>(method: HttpMethod, url: string, requestOptions?: RequestOptions): Promise<T> =>
    (await send<T>(method, url, requestOptions)).data;

  return {
    axios: instance,
    request,
    raw: send,
    get: <T, Q>(url: string, requestOptions?: RequestOptions<never, Q>) =>
      request<T>('get', url, requestOptions as RequestOptions),
    delete: <T>(url: string, requestOptions?: RequestOptions) => request<T>('delete', url, requestOptions),
    post: <T, B>(url: string, body?: B, requestOptions?: RequestOptions<B>) =>
      request<T>('post', url, { ...requestOptions, body } as RequestOptions),
    put: <T, B>(url: string, body?: B, requestOptions?: RequestOptions<B>) =>
      request<T>('put', url, { ...requestOptions, body } as RequestOptions),
    patch: <T, B>(url: string, body?: B, requestOptions?: RequestOptions<B>) =>
      request<T>('patch', url, { ...requestOptions, body } as RequestOptions),
    setAuthHandlers: handlers => {
      authHandlers = handlers;
    },
    setNotifier: value => {
      notifier = value;
    },
  };
};

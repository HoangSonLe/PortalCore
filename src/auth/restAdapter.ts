import type { HttpClient } from '../http/types';
import type { AuthAdapter, AuthSession, AuthTokens } from './types';

export interface RestAuthAdapterOptions {
  endpoints?: {
    login?: string;
    refresh?: string;
    logout?: string;
    session?: string;
    /** Không khai báo = tắt tính năng quên mật khẩu. */
    forgotPassword?: string;
  };
  /** Map response login/refresh sang AuthTokens. Mặc định đọc `accessToken`/`access_token` (cả khi bọc trong `data`/`value`). */
  mapTokens?: (response: any) => AuthTokens;
  /** Map response session sang AuthSession. Mặc định `{ user: res.user ?? res, permissions: res.permissions ?? [] }`. */
  mapSession?: (response: any) => AuthSession;
  /** Body gửi khi refresh. Mặc định `{ refreshToken }`. */
  refreshBody?: (refreshToken: string) => unknown;
}

/** Bóc lớp bọc phổ biến: `{ data: ... }` hoặc `{ value: ... }` (ValueResponse của .NET). */
const unwrap = (response: any) => {
  if (!response || typeof response !== 'object') return response;
  if ('data' in response) return response.data;
  if ('value' in response) return response.value;

  return response;
};

export const defaultMapTokens = (response: any): AuthTokens => {
  const source = response?.accessToken || response?.access_token ? response : unwrap(response);
  const accessToken = source?.accessToken ?? source?.access_token;

  if (!accessToken) throw new Error('Login response does not contain an access token');

  return {
    accessToken,
    refreshToken: source?.refreshToken ?? source?.refresh_token,
    expiresAt: source?.expiresAt,
  };
};

export const defaultMapSession = (response: any): AuthSession => {
  const source = response?.user ? response : unwrap(response);

  return {
    user: source?.user ?? source,
    permissions: Array.isArray(source?.permissions) ? source.permissions : [],
  };
};

/** AuthAdapter cho backend REST dùng Bearer token. */
export const createRestAuthAdapter = (http: HttpClient, options: RestAuthAdapterOptions = {}): AuthAdapter => {
  const endpoints = {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    session: '/auth/me',
    ...options.endpoints,
  };
  const mapTokens = options.mapTokens ?? defaultMapTokens;
  const mapSession = options.mapSession ?? defaultMapSession;
  const refreshBody = options.refreshBody ?? ((refreshToken: string) => ({ refreshToken }));

  const adapter: AuthAdapter = {
    login: async credentials =>
      mapTokens(
        await http.post(endpoints.login, credentials, { skipAuth: true, skipRefresh: true, notify: { error: false } }),
      ),
    getSession: async () => mapSession(await http.get(endpoints.session, { notify: { error: false } })),
    refresh: async refreshToken =>
      mapTokens(
        await http.post(endpoints.refresh, refreshBody(refreshToken), {
          skipAuth: true,
          skipRefresh: true,
          notify: { error: false },
        }),
      ),
    logout: async () => {
      await http.post(endpoints.logout, undefined, { skipRefresh: true, notify: { error: false } });
    },
  };

  if (endpoints.forgotPassword) {
    const url = endpoints.forgotPassword;

    adapter.forgotPassword = async email => {
      await http.post(url, { email }, { skipAuth: true, notify: { error: false } });
    };
  }

  return adapter;
};

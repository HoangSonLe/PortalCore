import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { PathVars } from '../utils/url';

export interface NotifyOptions {
  /** Hiện thông báo thành công với nội dung này. */
  success?: string;
  /** `false`: không hiện lỗi; string: thay nội dung lỗi mặc định. */
  error?: boolean | string;
}

export interface RequestOptions<TBody = unknown, TQuery = Record<string, unknown>>
  extends Omit<AxiosRequestConfig, 'url' | 'data' | 'params' | 'method'> {
  /** Thay `:name` trong url. */
  pathVars?: PathVars;
  /** Query string. */
  params?: TQuery;
  /** Request body. */
  body?: TBody;
  notify?: NotifyOptions;
  /** Không gắn header Authorization. */
  skipAuth?: boolean;
  /** Không tự refresh token khi gặp 401 (dùng cho chính API login/refresh). */
  skipRefresh?: boolean;
}

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface Notifier {
  success: (message: string) => void;
  /** `message` undefined nghĩa là backend không trả message -> notifier tự dùng câu mặc định (đã dịch). */
  error: (message: string | undefined, error: import('./errors').HttpError) => void;
}

export interface AuthHandlers {
  /** Access token hiện tại (đọc mới nhất mỗi request). */
  getAccessToken: () => string | undefined;
  /**
   * Lấy access token mới. Trả về `null` nếu không refresh được.
   * HttpClient đảm bảo chỉ gọi 1 lần dù nhiều request cùng bị 401.
   */
  refreshAccessToken?: () => Promise<string | null>;
  /** Gọi khi refresh thất bại / không thể refresh -> thường là logout. */
  onUnauthorized?: () => void;
}

export interface HttpClientOptions extends Omit<AxiosRequestConfig, 'url' | 'method' | 'data'> {
  /** Header bổ sung cho mọi request (vd `X-Tenant-Id`). Gọi lại mỗi request. */
  getHeaders?: () => Record<string, string | number | undefined>;
  /** Lấy message lỗi từ response body. Mặc định đọc `message` / `error` / `title`. */
  getErrorMessage?: (data: unknown) => string | undefined;
}

export interface HttpClient {
  readonly axios: import('axios').AxiosInstance;
  request: <TResponse = unknown>(method: HttpMethod, url: string, options?: RequestOptions) => Promise<TResponse>;
  get: <TResponse = unknown, TQuery = Record<string, unknown>>(
    url: string,
    options?: RequestOptions<never, TQuery>,
  ) => Promise<TResponse>;
  post: <TResponse = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ) => Promise<TResponse>;
  put: <TResponse = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ) => Promise<TResponse>;
  patch: <TResponse = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ) => Promise<TResponse>;
  delete: <TResponse = unknown>(url: string, options?: RequestOptions) => Promise<TResponse>;
  /** Trả về nguyên AxiosResponse (cần header, status, blob...). */
  raw: <TResponse = unknown>(method: HttpMethod, url: string, options?: RequestOptions) => Promise<AxiosResponse<TResponse>>;
  setAuthHandlers: (handlers: AuthHandlers | undefined) => void;
  setNotifier: (notifier: Notifier | undefined) => void;
}

/** Kết quả phân trang chuẩn mà DataTable dùng. Map từ response backend của bạn sang dạng này. */
export interface PageResult<T> {
  data: T[];
  total: number;
}

import { HttpClient, HttpClientOptions } from './types';
/**
 * Tạo HTTP client bọc axios.
 *
 * Khác với bản cũ ở các core công ty:
 * - Không cài interceptor trong React effect -> không phải gắn/gỡ lại mỗi khi token đổi.
 * - Refresh token "single-flight": N request cùng bị 401 chỉ gọi refresh đúng 1 lần,
 *   rồi mỗi request được gửi lại đúng 1 lần (không reject oan, không gửi trùng).
 * - Không phụ thuộc định dạng response backend: trả về `response.data` nguyên vẹn.
 */
export declare const createHttpClient: (options?: HttpClientOptions) => HttpClient;

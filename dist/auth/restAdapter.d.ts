import { HttpClient } from '../http/types';
import { AuthAdapter, AuthSession, AuthTokens } from './types';
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
export declare const defaultMapTokens: (response: any) => AuthTokens;
export declare const defaultMapSession: (response: any) => AuthSession;
/** AuthAdapter cho backend REST dùng Bearer token. */
export declare const createRestAuthAdapter: (http: HttpClient, options?: RestAuthAdapterOptions) => AuthAdapter;

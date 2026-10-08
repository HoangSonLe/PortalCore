export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    /** Epoch ms, nếu backend có trả. Chỉ để tham khảo, core không tự refresh theo giờ. */
    expiresAt?: number;
}
export interface AuthUser {
    id: string | number;
    name: string;
    username?: string;
    email?: string;
    avatar?: string;
    [key: string]: unknown;
}
export interface AuthSession {
    user: AuthUser;
    /** Mã quyền phẳng, vd `['user.view', 'user.create']`. `'*'` = toàn quyền. */
    permissions: string[];
}
export interface LoginCredentials {
    username: string;
    password: string;
    [key: string]: unknown;
}
/**
 * Cầu nối giữa core và backend của bạn. Core không biết endpoint hay format response nào cả —
 * mọi thứ đi qua adapter. Dùng `createRestAuthAdapter` cho backend REST thông thường,
 * hoặc tự viết (Supabase, Firebase, OAuth redirect...).
 */
export interface AuthAdapter {
    login: (credentials: LoginCredentials) => Promise<AuthTokens>;
    /** Lấy thông tin user + quyền bằng access token hiện tại. */
    getSession: () => Promise<AuthSession>;
    /** Không khai báo = không hỗ trợ refresh (401 sẽ logout luôn). */
    refresh?: (refreshToken: string) => Promise<AuthTokens>;
    logout?: (tokens: AuthTokens | undefined) => Promise<void>;
    /** Khai báo thì trang login hiện link "Quên mật khẩu". */
    forgotPassword?: (email: string) => Promise<void>;
}
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

import { HttpClient } from '../http/types';
import { AuthStore } from '../stores/authStore';
import { AuthAdapter, LoginCredentials } from './types';
export interface AuthService {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    /** Tải lại user + quyền (vd sau khi đổi role). */
    reloadSession: () => Promise<void>;
    /** Trả access token mới, hoặc null nếu không refresh được. */
    refresh: () => Promise<string | null>;
}
/** Ghép adapter + store. Hàm thuần, không side effect (an toàn với StrictMode). */
export declare const createAuthService: (adapter: AuthAdapter, store: AuthStore) => AuthService;
/** Cho http client biết lấy token ở đâu, refresh thế nào, hết phiên thì làm gì. */
export declare const bindHttpAuth: (http: HttpClient, store: AuthStore, service: AuthService, adapter: AuthAdapter) => () => void;

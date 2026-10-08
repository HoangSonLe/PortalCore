import { PermissionMode, PermissionRequirement } from '../permission/permission';
export declare const useT: () => import('..').Translate;
export declare const useHttp: () => import('..').HttpClient;
export declare const useEnv: <T extends Record<string, string | undefined> = Record<string, string | undefined>>() => T;
export declare const useAppInfo: () => import('./context').AppInfo;
/** Kiểm tra quyền. Khi app không bật auth thì luôn trả true. */
export declare const usePermission: () => (required: PermissionRequirement, mode?: PermissionMode) => boolean;
export declare const useAuth: () => {
    isAuthenticated: boolean;
    enabled: boolean;
    canForgotPassword: boolean;
    can: (required: PermissionRequirement, mode?: PermissionMode) => boolean;
    login: (credentials: import('..').LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    reloadSession: () => Promise<void>;
    forgotPassword: ((email: string) => Promise<void>) | undefined;
    status: import('..').AuthStatus;
    user: import('..').AuthUser | undefined;
    permissions: string[];
    tokens: import('..').AuthTokens | undefined;
};
export declare const useAppSettings: () => {
    locales: import('..').Locale[];
    themeMode: import('..').ThemeMode;
    locale: import('..').Locale;
    siderCollapsed: boolean;
    setThemeMode: (mode: import('..').ThemeMode) => void;
    toggleThemeMode: () => void;
    setLocale: (locale: import('..').Locale) => void;
    setSiderCollapsed: (collapsed: boolean) => void;
};

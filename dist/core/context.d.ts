import { AuthService } from '../auth/service';
import { AuthAdapter } from '../auth/types';
import { HttpClient } from '../http/types';
import { Locale, Translate } from '../i18n/messages';
import { AppRoute } from '../router/types';
import { AppStore } from '../stores/appStore';
import { AuthStore } from '../stores/authStore';
import { ErrorInfo, ReactNode } from 'react';
export interface AppInfo {
    /** Mã app, dùng làm namespace storage. Mỗi app trên cùng domain nên có code riêng. */
    code: string;
    name: string;
    logo?: ReactNode;
    version?: string;
}
export interface UserMenuItem {
    key: string;
    label: ReactNode;
    icon?: ReactNode;
    onClick?: () => void;
}
export interface LayoutOptions {
    /** Nội dung chèn vào header, bên trái các nút theme/ngôn ngữ (vd chuông thông báo). */
    headerExtra?: ReactNode;
    /** Mục thêm vào menu tài khoản (trên nút Đăng xuất). */
    userMenuItems?: UserMenuItem[];
    footer?: ReactNode;
    siderWidth?: number;
    showThemeSwitch?: boolean;
    showLocaleSwitch?: boolean;
}
export interface PageOverrides {
    login?: ReactNode;
    forgotPassword?: ReactNode;
    notFound?: ReactNode;
    forbidden?: ReactNode;
}
export interface PortalContextValue {
    app: AppInfo;
    routes: AppRoute[];
    http: HttpClient;
    /** undefined khi app không bật auth. */
    authAdapter?: AuthAdapter;
    authService?: AuthService;
    authStore: AuthStore;
    appStore: AppStore;
    env: Record<string, string | undefined>;
    locales: Locale[];
    t: Translate;
    layout: LayoutOptions;
    pages: PageOverrides;
    basePath: string;
    /** Namespace storage của app (`portal:<app.code>` hoặc `storageKey` tự đặt). */
    storageKey: string;
    onError?: (error: Error, info: ErrorInfo) => void;
}
export declare const PortalContext: import('react').Context<PortalContextValue | null>;
export declare const usePortal: () => PortalContextValue;

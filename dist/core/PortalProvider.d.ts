import { AuthAdapter } from '../auth/types';
import { HttpClient } from '../http/types';
import { Locale, Messages } from '../i18n/messages';
import { AppRoute } from '../router/types';
import { StorageOption } from '../stores/storage';
import { ThemeOptions } from '../theme/theme';
import { AppInfo, LayoutOptions, PageOverrides } from './context';
import { ConfigProviderProps } from 'antd';
import { ErrorInfo, ReactNode } from 'react';
export interface PortalProviderProps {
    app: AppInfo;
    routes: AppRoute[];
    http: HttpClient;
    /** Bỏ trống = app không cần đăng nhập (mọi route public, mọi quyền = true). */
    auth?: AuthAdapter;
    /** Khi app chạy dưới sub-path, vd `/admin`. */
    basePath?: string;
    storage?: StorageOption;
    /** Namespace key trong storage. Mặc định `portal:<app.code>`. */
    storageKey?: string;
    theme?: ThemeOptions;
    i18n?: {
        defaultLocale?: Locale;
        /** Ngôn ngữ cho phép chọn. Mặc định `['vi', 'en']`. Chỉ 1 ngôn ngữ thì ẩn nút chọn. */
        locales?: Locale[];
        /** Từ điển của app, merge đè lên từ điển có sẵn. */
        messages?: Partial<Record<Locale, Messages>>;
    };
    env?: Record<string, string | undefined>;
    layout?: LayoutOptions;
    pages?: PageOverrides;
    /** Props thêm cho antd ConfigProvider (componentSize, form...). */
    antd?: Omit<ConfigProviderProps, 'theme' | 'locale' | 'children'>;
    /** Render trong provider, ngoài router — cho listener toàn cục (realtime, analytics...). */
    children?: ReactNode;
    /** Nhận lỗi render (đã được ErrorBoundary chặn) để gửi Sentry / log server. */
    onError?: (error: Error, info: ErrorInfo) => void;
}
export declare const PortalProvider: ({ app, routes, http, auth, basePath, storage, storageKey, theme, i18n, env, layout, pages, antd, children, onError, }: PortalProviderProps) => import("react").JSX.Element;

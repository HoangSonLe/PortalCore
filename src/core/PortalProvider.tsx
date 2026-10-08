import type { AuthAdapter, AuthTokens } from '../auth/types';
import type { HttpClient } from '../http/types';
import type { Locale, Messages } from '../i18n/messages';
import type { AppRoute } from '../router/types';
import type { ThemeMode } from '../stores/appStore';
import type { StorageOption } from '../stores/storage';
import type { ThemeOptions } from '../theme/theme';
import type { AppInfo, LayoutOptions, PageOverrides, PortalContextValue } from './context';
import type { ConfigProviderProps } from 'antd';
import type { ErrorInfo, ReactNode } from 'react';

import { App as AntdApp, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import 'dayjs/locale/vi';

import { bindHttpAuth, createAuthService } from '../auth/service';
import { builtinMessages, createTranslator } from '../i18n/messages';
import { PortalRouter } from '../router/PortalRouter';
import { createAppStore } from '../stores/appStore';
import { createAuthStore } from '../stores/authStore';
import { resolveStorage } from '../stores/storage';
import { buildTheme } from '../theme/theme';
import { PortalContext, usePortal } from './context';
import { clearChunkReloadFlag, reloadOnceForNewVersion } from './ErrorBoundary';

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

const antdLocales = { vi: viVN, en: enUS } as const;
const EMPTY_ENV: Record<string, string | undefined> = {};
const EMPTY_LAYOUT: LayoutOptions = {};
const EMPTY_PAGES: PageOverrides = {};

/** Nối HttpClient với notification của antd (đúng theme) và từ điển hiện tại. */
const HttpNotifierBridge = () => {
  const { http, t } = usePortal();
  const { notification } = AntdApp.useApp();

  useEffect(() => {
    http.setNotifier({
      success: message => notification.success({ message: t('http.success'), description: message }),
      error: message =>
        notification.error({ message: t('http.error'), description: message ?? t('http.error.default') }),
    });

    return () => http.setNotifier(undefined);
  }, [http, notification, t]);

  return null;
};

/** Mở app mà còn token -> tải lại user + quyền trước khi vào trang. */
const SessionBootstrap = () => {
  const { authStore, authService } = usePortal();
  const status = useStore(authStore, state => state.status);

  useEffect(() => {
    if (status === 'checking' && authService) {
      authService.reloadSession().catch(() => undefined);
    }
  }, [status, authService]);

  return null;
};

export const PortalProvider = ({
  app,
  routes,
  http,
  auth,
  basePath = '/',
  storage,
  storageKey,
  theme,
  i18n,
  env = EMPTY_ENV,
  layout = EMPTY_LAYOUT,
  pages = EMPTY_PAGES,
  antd,
  children,
  onError,
}: PortalProviderProps) => {
  const locales = i18n?.locales ?? ['vi', 'en'];
  const defaultLocale = i18n?.defaultLocale ?? locales[0] ?? 'vi';

  // Store + service tạo 1 lần cho vòng đời app. Initializer phải thuần vì StrictMode gọi nó 2 lần.
  const [core] = useState(() => {
    const resolvedStorage = resolveStorage(storage);
    const key = storageKey ?? `portal:${app.code}`;
    const authStore = createAuthStore(key, resolvedStorage);
    const appStore = createAppStore(key, resolvedStorage, {
      themeMode: theme?.defaultMode ?? 'light',
      locale: defaultLocale,
    });
    const authService = auth ? createAuthService(auth, authStore) : undefined;

    if (!auth) authStore.setState({ status: 'authenticated', permissions: [] });

    return { authStore, appStore, authService, storageKey: key };
  });

  useEffect(() => {
    const onPreloadError = (event: Event) => {
      if (reloadOnceForNewVersion()) event.preventDefault();
    };
    const timer = setTimeout(clearChunkReloadFlag, 10_000);

    window.addEventListener('vite:preloadError', onPreloadError);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('vite:preloadError', onPreloadError);
    };
  }, []);

  // Đăng nhập / đăng xuất / đổi giao diện ở tab khác -> tab này cập nhật theo (sự kiện `storage` chỉ bắn ở tab khác).
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === `${core.storageKey}:auth`) {
        // Đọc thẳng giá trị mới: token `undefined` bị JSON.stringify bỏ đi, nên `persist.rehydrate()`
        // sẽ gộp `{}` vào state cũ và giữ nguyên token đã đăng xuất.
        let tokens: AuthTokens | undefined;

        try {
          tokens = event.newValue ? (JSON.parse(event.newValue)?.state?.tokens as AuthTokens | undefined) : undefined;
        } catch {
          tokens = undefined;
        }

        const state = core.authStore.getState();

        if (!tokens?.accessToken) {
          if (state.tokens) state.clear();
        } else if (tokens.accessToken !== state.tokens?.accessToken) {
          state.setTokens(tokens);
          // Tab này chưa đăng nhập -> tải user + quyền như lúc mở app.
          if (state.status === 'anonymous') core.authStore.setState({ status: 'checking' });
        }
      } else if (event.key === `${core.storageKey}:app`) {
        void core.appStore.persist.rehydrate();
      }
    };

    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, [core]);

  // Layout effect chạy trước mọi useEffect của component con -> handler sẵn sàng trước request đầu tiên.
  useLayoutEffect(() => {
    if (!auth || !core.authService) return undefined;

    return bindHttpAuth(http, core.authStore, core.authService, auth);
  }, [http, auth, core]);

  const themeMode: ThemeMode = useStore(core.appStore, state => state.themeMode);

  const storedLocale = useStore(core.appStore, state => state.locale);
  const locale = locales.includes(storedLocale) ? storedLocale : defaultLocale;

  const t = useMemo(
    () => createTranslator({ ...builtinMessages[locale], ...i18n?.messages?.[locale] }),
    [locale, i18n?.messages],
  );

  useEffect(() => {
    dayjs.locale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const contextValue = useMemo<PortalContextValue>(
    () => ({
      app,
      routes,
      http,
      authAdapter: auth,
      authService: core.authService,
      authStore: core.authStore,
      appStore: core.appStore,
      env,
      locales,
      t,
      layout,
      pages,
      basePath,
      storageKey: core.storageKey,
      onError,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [app, routes, http, auth, core, env, t, layout, pages, basePath, onError, locales.join(',')],
  );

  const antdTheme = useMemo(() => buildTheme(themeMode, theme), [themeMode, theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
    document.body.style.margin = '0';
    document.body.style.background = antdTheme.token?.colorBgLayout ?? '';
  }, [themeMode, antdTheme]);

  return (
    <PortalContext.Provider value={contextValue}>
      <ConfigProvider {...antd} theme={antdTheme} locale={antdLocales[locale]}>
        <AntdApp>
          <HttpNotifierBridge />
          {auth && <SessionBootstrap />}
          {children}
          <PortalRouter />
        </AntdApp>
      </ConfigProvider>
    </PortalContext.Provider>
  );
};

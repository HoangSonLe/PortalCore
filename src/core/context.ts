import type { AuthService } from '../auth/service';
import type { AuthAdapter } from '../auth/types';
import type { HttpClient } from '../http/types';
import type { Locale, Translate } from '../i18n/messages';
import type { AppRoute } from '../router/types';
import type { AppStore } from '../stores/appStore';
import type { AuthStore } from '../stores/authStore';
import type { ReactNode } from 'react';

import { createContext, useContext } from 'react';

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
}

export const PortalContext = createContext<PortalContextValue | null>(null);

export const usePortal = (): PortalContextValue => {
  const value = useContext(PortalContext);

  if (!value) throw new Error('[portal-core] Thiếu <PortalProvider> ở gốc ứng dụng.');

  return value;
};

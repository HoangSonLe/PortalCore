import type { AuthAdapter } from '../src/auth/types';
import type { PortalContextValue } from '../src/core/context';
import type { ReactElement } from 'react';

import { render } from '@testing-library/react';
import { App as AntdApp } from 'antd';
import { MemoryRouter } from 'react-router';

import { PortalContext } from '../src/core/context';
import { createHttpClient } from '../src/http/client';
import { builtinMessages, createTranslator } from '../src/i18n/messages';
import { createAppStore } from '../src/stores/appStore';
import { createAuthStore } from '../src/stores/authStore';

const memory = () => {
  const map = new Map<string, string>();

  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
};

/**
 * Render component trong context giống PortalProvider (không có router thật / layout),
 * để test component riêng lẻ. `permissions: undefined` = app không bật auth (mọi quyền = true).
 */
export const renderWithPortal = (ui: ReactElement, { permissions }: { permissions?: string[] } = {}) => {
  const storage = memory();
  const authStore = createAuthStore('test', storage);
  const appStore = createAppStore('test', storage, { themeMode: 'light', locale: 'vi' });
  const authAdapter = permissions ? ({} as AuthAdapter) : undefined;

  authStore.setState({ status: 'authenticated', permissions: permissions ?? [] });

  const value: PortalContextValue = {
    app: { code: 'test', name: 'Test' },
    routes: [],
    http: createHttpClient(),
    authAdapter,
    authStore,
    appStore,
    env: {},
    locales: ['vi'],
    t: createTranslator(builtinMessages.vi),
    layout: {},
    pages: {},
    basePath: '/',
    storageKey: 'test',
  };

  return render(
    <PortalContext.Provider value={value}>
      <AntdApp>
        <MemoryRouter>{ui}</MemoryRouter>
      </AntdApp>
    </PortalContext.Provider>,
  );
};

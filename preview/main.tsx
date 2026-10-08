import '@ant-design/v5-patch-for-react-19';

import type { QuickAccount, UserMenuItem } from '@hoangsonle/portal-core';

import { AppstoreFilled, UserOutlined } from '@ant-design/icons';
import { LoginPage, PortalProvider } from '@hoangsonle/portal-core';
import { Tag } from 'antd';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { authAdapter, env, http } from './api';
import { messages } from './messages';
import { routes } from './routes';

const app = {
  code: 'preview',
  name: 'Portal Core',
  version: '0.2.0',
  logo: <AppstoreFilled style={{ fontSize: 24, color: '#1ab394' }} />,
};

const quickAccounts: QuickAccount[] = [
  { label: 'toàn quyền', username: 'admin', password: 'admin' },
  { label: 'xem/thêm/sửa', username: 'editor', password: 'editor' },
  { label: 'chỉ xem', username: 'viewer', password: 'viewer' },
];

const userMenuItems: UserMenuItem[] = [
  { key: 'profile', label: 'Hồ sơ cá nhân', icon: <UserOutlined />, onClick: () => alert('Trang hồ sơ (tự làm)') },
];

const layout = {
  userMenuItems,
  headerExtra: <Tag color="orange">{env.APP_ENV}</Tag>,
};
const pages = { login: <LoginPage quickAccounts={quickAccounts} /> };
const i18n = { defaultLocale: 'vi' as const, messages };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalProvider
      app={app}
      routes={routes}
      http={http}
      auth={authAdapter}
      env={env}
      i18n={i18n}
      layout={layout}
      pages={pages}
    />
  </StrictMode>,
);

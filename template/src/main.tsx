import '@ant-design/v5-patch-for-react-19';

import { AppstoreFilled } from '@ant-design/icons';
import { PortalProvider } from '@hoangsonle/portal-core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { authAdapter, env, http } from './api/http';
import { messages } from './messages';
import { routes } from './routes';

// Khai báo ở module level: không tạo lại mỗi lần render.
const app = {
  code: '__APP_NAME__',
  name: '__APP_TITLE__',
  version: '0.1.0',
  logo: <AppstoreFilled style={{ fontSize: 24, color: '#1ab394' }} />,
};
const i18n = { defaultLocale: 'vi' as const, messages };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalProvider app={app} routes={routes} http={http} auth={authAdapter} env={env} i18n={i18n} />
  </StrictMode>,
);

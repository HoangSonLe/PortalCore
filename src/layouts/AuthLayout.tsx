import { Card, Flex, theme, Typography } from 'antd';
import { useEffect } from 'react';
import { Outlet } from 'react-router';

import { usePortal } from '../core/context';
import { LocaleSwitch, ThemeSwitch } from './HeaderControls';

/** Trang đăng nhập: form giữa màn hình, logo + tên app phía trên. */
export const AuthLayout = () => {
  const { app, layout } = usePortal();
  const { token } = theme.useToken();

  useEffect(() => {
    document.title = app.name;
  }, [app.name]);

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{ minHeight: '100vh', padding: 16, background: token.colorBgLayout, position: 'relative' }}
    >
      <Flex gap={4} style={{ position: 'absolute', top: 12, right: 12 }}>
        {layout.showLocaleSwitch !== false && <LocaleSwitch />}
        {layout.showThemeSwitch !== false && <ThemeSwitch />}
      </Flex>
      <Flex vertical align="center" gap={8} style={{ marginBottom: 24 }}>
        {app.logo}
        <Typography.Title level={3} style={{ margin: 0 }}>
          {app.name}
        </Typography.Title>
      </Flex>
      <Card style={{ width: '100%', maxWidth: 400 }} styles={{ body: { padding: 28 } }}>
        <Outlet />
      </Card>
      {app.version && (
        <Typography.Text type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
          v{app.version}
        </Typography.Text>
      )}
    </Flex>
  );
};

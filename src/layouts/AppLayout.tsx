import type { Translate } from '../i18n/messages';
import type { AppRoute } from '../router/types';
import type { BreadcrumbProps, MenuProps } from 'antd';

import { MenuFoldOutlined, MenuOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Drawer, Flex, Grid, Layout, Menu, Spin, theme } from 'antd';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';

import { usePortal } from '../core/context';
import { useAppSettings, useT } from '../core/hooks';
import { useCurrentRoute, useVisibleRoutes } from '../router/useVisibleRoutes';
import { joinPath } from '../utils/url';
import { LocaleSwitch, ThemeSwitch, UserMenu } from './HeaderControls';

type MenuItem = Required<MenuProps>['items'][number];

const buildMenuItems = (routes: AppRoute[], t: Translate, parentPath = '/'): MenuItem[] =>
  routes.flatMap<MenuItem>(route => {
    if (route.index || route.hideInMenu || !route.title) return [];

    const fullPath = joinPath(parentPath, route.path);
    const children = buildMenuItems(route.children ?? [], t, fullPath);

    if (children.length > 0) {
      return [{ key: fullPath, icon: route.icon, label: t(route.title), children }];
    }

    return [{ key: fullPath, icon: route.icon, label: t(route.title) }];
  });

const collectLeafKeys = (items: MenuItem[]): string[] =>
  items.flatMap(item => {
    if (!item || !('key' in item)) return [];

    return 'children' in item && item.children ? collectLeafKeys(item.children) : [String(item.key)];
  });

/** Logo + tên app trên nền sider tối. */
const SiderBrand = ({ collapsed }: { collapsed: boolean }) => {
  const { app } = usePortal();

  return (
    <Flex
      align="center"
      gap={10}
      style={{
        height: 56,
        paddingInline: collapsed ? 0 : 20,
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {app.logo}
      {!collapsed && (
        <span
          style={{ color: '#fff', fontWeight: 600, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {app.name}
        </span>
      )}
    </Flex>
  );
};

export const AppLayout = () => {
  const t = useT();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { app, layout } = usePortal();
  const { siderCollapsed, setSiderCollapsed } = useAppSettings();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleRoutes = useVisibleRoutes();
  const current = useCurrentRoute();
  const menuItems = useMemo(() => buildMenuItems(visibleRoutes, t), [visibleRoutes, t]);

  const parentKeys = useMemo(() => current?.chain.slice(0, -1).map(item => item.fullPath) ?? [], [current]);
  // Chọn mục menu có path là tiền tố dài nhất của URL: `/system/users/42` (trang ẩn) -> sáng `/system/users`.
  const selectedKey = useMemo(
    () =>
      collectLeafKeys(menuItems)
        .filter(key => pathname === key || pathname.startsWith(`${key}/`))
        .sort((a, b) => b.length - a.length)[0],
    [menuItems, pathname],
  );
  const [openKeys, setOpenKeys] = useState<string[]>(parentKeys);

  useEffect(() => {
    setOpenKeys(prev => Array.from(new Set([...prev, ...parentKeys])));
  }, [parentKeys]);

  const currentTitle = current?.route.title ? t(current.route.title) : undefined;

  useEffect(() => {
    document.title = currentTitle ? `${currentTitle} · ${app.name}` : app.name;
  }, [currentTitle, app.name]);

  const breadcrumbItems: BreadcrumbProps['items'] = (current?.chain ?? [])
    .filter(item => item.route.title)
    .map((item, index, list) => ({
      key: item.fullPath,
      title:
        item.route.element && index < list.length - 1 && !item.fullPath.includes(':') ? (
          <Link to={item.fullPath}>{t(item.route.title)}</Link>
        ) : (
          t(item.route.title)
        ),
    }));

  const menu = (collapsed: boolean, onNavigate?: () => void) => (
    <Menu
      theme="dark"
      mode="inline"
      items={menuItems}
      selectedKeys={selectedKey ? [selectedKey] : []}
      {...(collapsed ? {} : { openKeys, onOpenChange: setOpenKeys })}
      onClick={({ key }) => {
        onNavigate?.();
        navigate(key);
      }}
      style={{ borderInlineEnd: 'none', paddingBlock: 8 }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Layout.Sider
          width={layout.siderWidth ?? 240}
          collapsedWidth={64}
          collapsed={siderCollapsed}
          trigger={null}
          style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
        >
          <SiderBrand collapsed={siderCollapsed} />
          {menu(siderCollapsed)}
        </Layout.Sider>
      )}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={260}
          closable={false}
          styles={{ body: { padding: 0, background: token.Layout?.siderBg } }}
        >
          <SiderBrand collapsed={false} />
          {menu(false, () => setDrawerOpen(false))}
        </Drawer>
      )}
      <Layout>
        <Layout.Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            aria-label={t(siderCollapsed ? 'layout.expand' : 'layout.collapse')}
            icon={isMobile ? <MenuOutlined /> : siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => (isMobile ? setDrawerOpen(true) : setSiderCollapsed(!siderCollapsed))}
          />
          {!isMobile && <Breadcrumb items={breadcrumbItems} />}
          <div style={{ flex: 1 }} />
          <Flex align="center" gap={4}>
            {layout.headerExtra}
            {layout.showLocaleSwitch !== false && <LocaleSwitch />}
            {layout.showThemeSwitch !== false && <ThemeSwitch />}
            <UserMenu compact={isMobile} />
          </Flex>
        </Layout.Header>
        <Layout.Content style={{ padding: isMobile ? 16 : 24 }}>
          <Suspense
            fallback={
              <Flex align="center" justify="center" style={{ minHeight: 240 }}>
                <Spin />
              </Flex>
            }
          >
            <Outlet />
          </Suspense>
        </Layout.Content>
        {layout.footer && (
          <Layout.Footer style={{ textAlign: 'center', color: token.colorTextSecondary }}>{layout.footer}</Layout.Footer>
        )}
      </Layout>
    </Layout>
  );
};

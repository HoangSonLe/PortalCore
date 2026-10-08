import type { AppRoute } from '@hoangsonle/portal-core';

import { AppstoreOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import { lazy } from 'react';

// Lazy load từng trang -> mỗi trang 1 chunk; AppLayout đã bọc Suspense sẵn.
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UserListPage = lazy(() => import('./pages/UserListPage'));
const UserDetailPage = lazy(() => import('./pages/UserDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ComponentsPage = lazy(() => import('./pages/ComponentsPage'));

export const routes: AppRoute[] = [
  {
    path: 'dashboard',
    title: 'menu.dashboard',
    icon: <DashboardOutlined />,
    permission: 'dashboard.view',
    element: <DashboardPage />,
  },
  {
    // Nhóm không có element: tự thành submenu, vào /system sẽ chuyển tới trang con đầu tiên được phép.
    path: 'system',
    title: 'menu.system',
    icon: <SettingOutlined />,
    children: [
      { path: 'users', title: 'menu.users', permission: 'user.view', element: <UserListPage /> },
      {
        path: 'users/:id',
        title: 'menu.userDetail',
        permission: 'user.view',
        hideInMenu: true,
        element: <UserDetailPage />,
      },
      { path: 'settings', title: 'menu.settings', permission: 'setting.manage', element: <SettingsPage /> },
    ],
  },
  { path: 'components', title: 'menu.components', icon: <AppstoreOutlined />, element: <ComponentsPage /> },
];

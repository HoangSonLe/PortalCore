import type { AppRoute } from '@hoangsonle/portal-core';

import { DashboardOutlined, DatabaseOutlined } from '@ant-design/icons';
import { lazy } from 'react';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CategoryListPage = lazy(() => import('./pages/CategoryListPage'));

export const routes: AppRoute[] = [
  { path: 'dashboard', title: 'menu.dashboard', icon: <DashboardOutlined />, element: <DashboardPage /> },
  {
    path: 'catalog',
    title: 'menu.catalog',
    icon: <DatabaseOutlined />,
    children: [{ path: 'categories', title: 'menu.categories', element: <CategoryListPage /> }],
  },
];

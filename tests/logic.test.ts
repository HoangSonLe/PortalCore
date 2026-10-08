import type { AppRoute } from '../src/router/types';

import { describe, expect, it } from 'vitest';

import { defaultMapSession, defaultMapTokens } from '../src/auth/restAdapter';
import { createTranslator } from '../src/i18n/messages';
import { hasPermission } from '../src/permission/permission';
import { filterRoutes, findFirstPath, flattenRoutes, matchFlatRoute } from '../src/router/utils';
import { buildPath, joinPath, safeRedirectPath } from '../src/utils/url';

describe('url utils', () => {
  it('buildPath thay và encode biến, giữ nguyên biến thiếu', () => {
    expect(buildPath('/users/:id/files/:name', { id: 1, name: 'a b' })).toBe('/users/1/files/a%20b');
    expect(buildPath('/users/:id', {})).toBe('/users/:id');
  });

  it('joinPath chuẩn hoá dấu /', () => {
    expect(joinPath('/', 'system', 'users')).toBe('/system/users');
    expect(joinPath('/system/', '/users/')).toBe('/system/users');
    expect(joinPath('/')).toBe('/');
  });

  it('safeRedirectPath chặn open redirect', () => {
    expect(safeRedirectPath('/users?page=2')).toBe('/users?page=2');
    expect(safeRedirectPath('https://evil.com')).toBe('/');
    expect(safeRedirectPath('//evil.com')).toBe('/');
    expect(safeRedirectPath('/\\evil.com')).toBe('/');
    expect(safeRedirectPath(null)).toBe('/');
  });
});

describe('hasPermission', () => {
  const granted = ['user.view', 'user.create'];

  it('không yêu cầu thì cho qua', () => {
    expect(hasPermission([], undefined)).toBe(true);
    expect(hasPermission([], [])).toBe(true);
  });

  it('mode all / any', () => {
    expect(hasPermission(granted, ['user.view', 'user.create'])).toBe(true);
    expect(hasPermission(granted, ['user.view', 'user.delete'])).toBe(false);
    expect(hasPermission(granted, ['user.view', 'user.delete'], 'any')).toBe(true);
  });

  it('* là toàn quyền', () => {
    expect(hasPermission(['*'], 'anything')).toBe(true);
  });
});

describe('router utils', () => {
  const routes: AppRoute[] = [
    { path: 'dashboard', title: 'Dashboard', element: 'D' },
    {
      path: 'system',
      title: 'Hệ thống',
      children: [
        { path: 'users', title: 'Users', element: 'U', permission: 'user.view' },
        { path: 'users/:id', title: 'User detail', element: 'UD', permission: 'user.view', hideInMenu: true },
        { path: 'settings', title: 'Settings', element: 'S', permission: 'setting.manage' },
      ],
    },
    { path: 'admin-only', title: 'Admin', permission: 'admin', children: [{ path: 'x', element: 'X' }] },
  ];
  const can = (granted: string[]) => (route: AppRoute) => hasPermission(granted, route.permission);

  it('lọc route theo quyền và bỏ nhóm rỗng', () => {
    const visible = filterRoutes(routes, can(['user.view']));

    expect(visible.map(r => r.path)).toEqual(['dashboard', 'system']);
    expect(visible[1].children!.map(r => r.path)).toEqual(['users', 'users/:id']);
    expect(filterRoutes(routes, can([])).map(r => r.path)).toEqual(['dashboard']);
  });

  it('findFirstPath bỏ qua trang ẩn và path động', () => {
    expect(findFirstPath(routes)).toBe('/dashboard');
    expect(findFirstPath(routes[1].children!, '/system')).toBe('/system/users');
    expect(findFirstPath([{ path: 'a/:id', element: 'A' }])).toBeUndefined();
  });

  it('match route sâu nhất và dựng chuỗi breadcrumb', () => {
    const flat = flattenRoutes(routes);
    const match = matchFlatRoute(flat, '/system/users/42');

    expect(match?.fullPath).toBe('/system/users/:id');
    expect(match?.chain.map(c => c.route.title)).toEqual(['Hệ thống', 'User detail']);
    expect(matchFlatRoute(flat, '/nope')).toBeUndefined();
  });
});

describe('i18n', () => {
  it('dịch, nội suy và trả nguyên key khi thiếu', () => {
    const t = createTranslator({ hello: 'Xin chào {name}' });

    expect(t('hello', { name: 'Sơn' })).toBe('Xin chào Sơn');
    expect(t('Text thường')).toBe('Text thường');
    expect(t(undefined)).toBe('');
  });
});

describe('rest adapter mappers', () => {
  it('đọc token ở nhiều dạng response', () => {
    expect(defaultMapTokens({ accessToken: 'a', refreshToken: 'r' })).toEqual({
      accessToken: 'a',
      refreshToken: 'r',
      expiresAt: undefined,
    });
    expect(defaultMapTokens({ data: { access_token: 'a' } }).accessToken).toBe('a');
    expect(defaultMapTokens({ value: { accessToken: 'net', refreshToken: 'r' } }).accessToken).toBe('net');
    expect(() => defaultMapTokens({})).toThrow();
  });

  it('đọc session có/không bọc data', () => {
    expect(defaultMapSession({ user: { id: 1, name: 'A' }, permissions: ['x'] })).toEqual({
      user: { id: 1, name: 'A' },
      permissions: ['x'],
    });
    expect(defaultMapSession({ data: { id: 2, name: 'B' } })).toEqual({ user: { id: 2, name: 'B' }, permissions: [] });
  });
});

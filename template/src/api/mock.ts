/**
 * Backend giả để làm UI trước khi có API. Tài khoản: admin / admin.
 * Xoá file này khi đã có backend thật.
 */
import type { Category } from './categoryApi';

import { createMockAdapter, MockError } from '@hoangsonle/portal-core';

let categories: Category[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  code: `DM${String(i + 1).padStart(3, '0')}`,
  name: `Danh mục ${i + 1}`,
  active: i % 4 !== 0,
}));
let nextId = categories.length + 1;

const requireLogin = (token?: string) => {
  if (token !== 'mock-access-token') throw new MockError(401, 'Phiên đăng nhập đã hết hạn');
};

export const mockAdapter = createMockAdapter({
  routes: [
    [
      'post',
      '/auth/login',
      ({ body }) => {
        if (body?.username !== 'admin' || body?.password !== 'admin') {
          throw new MockError(401, 'Sai tên đăng nhập hoặc mật khẩu');
        }

        return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
      },
    ],
    ['post', '/auth/refresh', () => ({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' })],
    ['post', '/auth/logout', () => null],
    [
      'get',
      '/auth/me',
      ({ token }) => {
        requireLogin(token);

        return { user: { id: 1, name: 'Quản trị viên', username: 'admin' }, permissions: ['*'] };
      },
    ],
    [
      'get',
      '/categories',
      ({ token, params }) => {
        requireLogin(token);
        const keyword = String(params.keyword ?? '').toLowerCase();
        const list = categories.filter(
          c => !keyword || c.name.toLowerCase().includes(keyword) || c.code.toLowerCase().includes(keyword),
        );
        const current = Number(params.current ?? 1);
        const pageSize = Number(params.pageSize ?? 10);

        return { data: list.slice((current - 1) * pageSize, current * pageSize), total: list.length };
      },
    ],
    [
      'post',
      '/categories',
      ({ token, body }) => {
        requireLogin(token);

        if (categories.some(c => c.code === body.code)) throw new MockError(400, 'Mã danh mục đã tồn tại');

        const item = { ...body, id: nextId++ } as Category;

        categories = [item, ...categories];

        return item;
      },
    ],
    [
      'put',
      '/categories/:id',
      ({ token, body, pathVars }) => {
        requireLogin(token);
        categories = categories.map(c => (c.id === Number(pathVars.id) ? { ...c, ...body } : c));

        return categories.find(c => c.id === Number(pathVars.id));
      },
    ],
    [
      'delete',
      '/categories/:id',
      ({ token, pathVars }) => {
        requireLogin(token);
        categories = categories.filter(c => c.id !== Number(pathVars.id));

        return null;
      },
    ],
  ],
});

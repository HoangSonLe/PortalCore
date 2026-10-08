import { describe, expect, it } from 'vitest';

import { createMockAdapter, MockError, mockFile } from '../src/dev/mockAdapter';
import { HttpError } from '../src/http/errors';
import { createHttpClient } from '../src/http/client';

describe('createMockAdapter', () => {
  const calls: string[] = [];
  const http = createHttpClient({
    adapter: createMockAdapter({
      delay: 0,
      onRequest: ({ method, url }) => calls.push(`${method} ${url}`),
      routes: [
        ['get', '/users/search', () => 'search'],
        ['get', '/users/:id', ({ pathVars, params }) => ({ id: Number(pathVars.id), tab: params.tab })],
        ['post', '/users', ({ body }) => ({ created: body.name })],
        [
          'delete',
          '/users/:id',
          () => {
            throw new MockError(403, 'Không có quyền');
          },
        ],
        ['get', '/files/report', () => mockFile(new Blob(['a,b']), 'báo cáo.csv')],
        ['get', '/me', ({ token }) => ({ token })],
      ],
    }),
  });

  it('khớp route theo thứ tự, đọc pathVars + params + body', async () => {
    expect(await http.get('/users/search')).toBe('search');
    expect(await http.get('/users/:id', { pathVars: { id: 5 }, params: { tab: 'info' } })).toEqual({
      id: 5,
      tab: 'info',
    });
    expect(await http.post('/users', { name: 'An' })).toEqual({ created: 'An' });
    expect(calls).toContain('get /users/5');
  });

  it('MockError -> HttpError đúng status + message', async () => {
    const error = await http.delete<never>('/users/1', { notify: { error: false } }).catch((e: HttpError) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(403);
    expect(error.serverMessage).toBe('Không có quyền');
  });

  it('route không tồn tại -> 404', async () => {
    const error = await http.get<never>('/khong-co', { notify: { error: false } }).catch((e: HttpError) => e);

    expect(error.status).toBe(404);
  });

  it('mockFile trả Blob kèm Content-Disposition', async () => {
    const response = await http.raw<Blob>('get', '/files/report', { responseType: 'blob' });

    expect(response.data).toBeInstanceOf(Blob);
    expect(response.headers['content-disposition']).toContain(encodeURIComponent('báo cáo.csv'));
  });

  it('đọc token từ header Authorization', async () => {
    http.setAuthHandlers({ getAccessToken: () => 'abc' });

    expect(await http.get('/me')).toEqual({ token: 'abc' });
  });
});

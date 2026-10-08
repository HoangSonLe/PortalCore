import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { createHttpClient } from '../src/http/client';
import { HttpError } from '../src/http/errors';

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };

/** Adapter giả: không gọi mạng, trả response theo handler. */
const fakeAdapter =
  (handler: Handler): AxiosAdapter =>
  async config => {
    await new Promise(resolve => setTimeout(resolve, 5));
    const { status, data } = handler(config);
    const response = { data, status, statusText: String(status), headers: {}, config, request: {} };

    if (status >= 400) {
      throw new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', config, {}, response);
    }

    return response;
  };

const authHeader = (config: InternalAxiosRequestConfig) => config.headers?.Authorization as string | undefined;

describe('createHttpClient', () => {
  it('trả về response.data, thay pathVars và gửi params', async () => {
    const seen: InternalAxiosRequestConfig[] = [];
    const http = createHttpClient({
      adapter: fakeAdapter(config => {
        seen.push(config);

        return { status: 200, data: { ok: true } };
      }),
    });

    const result = await http.get<{ ok: boolean }>('/users/:id', { pathVars: { id: 7 }, params: { tab: 'info' } });

    expect(result).toEqual({ ok: true });
    expect(seen[0].url).toBe('/users/7');
    expect(seen[0].params).toEqual({ tab: 'info' });
  });

  it('gắn Bearer token và header bổ sung', async () => {
    let captured: InternalAxiosRequestConfig | undefined;
    const http = createHttpClient({
      getHeaders: () => ({ 'X-Tenant-Id': 3, 'X-Empty': undefined }),
      adapter: fakeAdapter(config => {
        captured = config;

        return { status: 200, data: null };
      }),
    });

    http.setAuthHandlers({ getAccessToken: () => 'abc' });
    await http.get('/me');

    expect(authHeader(captured!)).toBe('Bearer abc');
    expect(captured!.headers['X-Tenant-Id']).toBe('3');
    expect(captured!.headers['X-Empty']).toBeUndefined();
  });

  it('nhiều request cùng 401: refresh đúng 1 lần, mỗi request gửi lại đúng 1 lần', async () => {
    let token = 'expired';
    const hits: Record<string, number> = {};
    const http = createHttpClient({
      adapter: fakeAdapter(config => {
        hits[config.url!] = (hits[config.url!] ?? 0) + 1;

        return authHeader(config) === 'Bearer fresh'
          ? { status: 200, data: config.url }
          : { status: 401, data: { message: 'expired' } };
      }),
    });
    const refreshAccessToken = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
      token = 'fresh';

      return token;
    });
    const onUnauthorized = vi.fn();

    http.setAuthHandlers({ getAccessToken: () => token, refreshAccessToken, onUnauthorized });

    const results = await Promise.all(['/a', '/b', '/c', '/d', '/e'].map(url => http.post(url, { x: 1 })));

    expect(results).toEqual(['/a', '/b', '/c', '/d', '/e']);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    // 1 lần bị 401 + 1 lần gửi lại = 2. Bản upstream công ty gửi lại 2 lần (=3) với request đầu.
    expect(Object.values(hits)).toEqual([2, 2, 2, 2, 2]);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('401 về muộn sau khi refresh đã xong: dùng token mới, không refresh lần 2', async () => {
    let token = 'expired';
    const http = createHttpClient({
      adapter: async config => {
        // /slow trả lời chậm hơn hẳn thời gian refresh.
        await new Promise(resolve => setTimeout(resolve, config.url === '/slow' ? 80 : 5));
        const ok = authHeader(config) === 'Bearer fresh';
        const response = { data: config.url, status: ok ? 200 : 401, statusText: '', headers: {}, config, request: {} };

        if (!ok) throw new AxiosError('401', 'ERR_BAD_RESPONSE', config, {}, response);

        return response;
      },
    });
    const refreshAccessToken = vi.fn(async () => {
      token = 'fresh';

      return token;
    });

    http.setAuthHandlers({ getAccessToken: () => token, refreshAccessToken });

    const results = await Promise.all([http.get('/fast'), http.get('/slow')]);

    expect(results).toEqual(['/fast', '/slow']);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('refresh thất bại: gọi onUnauthorized 1 lần/request, không toast lỗi 401', async () => {
    const notifier = { success: vi.fn(), error: vi.fn() };
    const onUnauthorized = vi.fn();
    const http = createHttpClient({ adapter: fakeAdapter(() => ({ status: 401 })) });

    http.setNotifier(notifier);
    http.setAuthHandlers({ getAccessToken: () => 'x', refreshAccessToken: async () => null, onUnauthorized });

    await expect(http.get('/a')).rejects.toBeInstanceOf(HttpError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(notifier.error).not.toHaveBeenCalled();
  });

  it('skipAuth + 401 (sai mật khẩu): không refresh, không logout', async () => {
    const refreshAccessToken = vi.fn(async () => 'new');
    const onUnauthorized = vi.fn();
    const http = createHttpClient({
      adapter: fakeAdapter(() => ({ status: 401, data: { message: 'Sai mật khẩu' } })),
    });

    http.setAuthHandlers({ getAccessToken: () => undefined, refreshAccessToken, onUnauthorized });

    const error = await http
      .post<never>('/auth/login', {}, { skipAuth: true, skipRefresh: true })
      .catch((e: HttpError) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect(error.serverMessage).toBe('Sai mật khẩu');
    expect(refreshAccessToken).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('thông báo lỗi theo message server, notify.error=false thì im lặng', async () => {
    const notifier = { success: vi.fn(), error: vi.fn() };
    const http = createHttpClient({
      adapter: fakeAdapter(() => ({ status: 400, data: { message: 'Email đã tồn tại' } })),
    });

    http.setNotifier(notifier);

    await expect(http.post('/users', {})).rejects.toThrow('Email đã tồn tại');
    expect(notifier.error).toHaveBeenCalledWith('Email đã tồn tại', expect.any(HttpError));

    await expect(http.post('/users', {}, { notify: { error: false } })).rejects.toThrow();
    expect(notifier.error).toHaveBeenCalledTimes(1);
  });

  it('notify.success hiện thông báo khi thành công', async () => {
    const notifier = { success: vi.fn(), error: vi.fn() };
    const http = createHttpClient({ adapter: fakeAdapter(() => ({ status: 200, data: 1 })) });

    http.setNotifier(notifier);
    await http.delete('/users/1', { notify: { success: 'Đã xoá' } });

    expect(notifier.success).toHaveBeenCalledWith('Đã xoá');
  });
});

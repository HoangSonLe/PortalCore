import { createHttpClient, createRestAuthAdapter, readRuntimeEnv } from '@hoangsonle/portal-core';

import { mockAdapter } from './mock';

/** Biến môi trường: window.__APP_ENV__ (lúc chạy) đè lên import.meta.env (lúc build). */
export const env = readRuntimeEnv({
  API_URL: import.meta.env.VITE_API_URL as string | undefined,
  USE_MOCK: import.meta.env.VITE_USE_MOCK as string | undefined,
  APP_ENV: import.meta.env.MODE as string | undefined,
});

export const http = createHttpClient({
  baseURL: env.API_URL || '/api',
  timeout: 20_000,
  // Bỏ dòng này (hoặc đặt VITE_USE_MOCK=false) khi đã có backend thật.
  adapter: env.USE_MOCK === 'true' ? mockAdapter : undefined,
});

/** Đổi endpoint / map response cho khớp backend của bạn (xem README của portal-core, mục Auth adapter). */
export const authAdapter = createRestAuthAdapter(http, {
  endpoints: { login: '/auth/login', refresh: '/auth/refresh', logout: '/auth/logout', session: '/auth/me' },
});

/**
 * Tầng API của app — đây là chỗ bạn viết cho dự án thật.
 * Chỉ cần đổi `adapter: mockAdapter` -> bỏ đi, và sửa `baseURL` trỏ backend thật.
 */
import type { PageResult, SelectRequestParams } from '@hoangsonle/portal-core';
import type { Role, User } from './mock/backend';

import { createHttpClient, createRestAuthAdapter, readRuntimeEnv } from '@hoangsonle/portal-core';

import { mockAdapter } from './mock/backend';

export const env = readRuntimeEnv({
  API_URL: import.meta.env.VITE_API_URL as string | undefined,
  APP_ENV: (import.meta.env.MODE as string | undefined) ?? 'development',
});

export const http = createHttpClient({
  baseURL: env.API_URL ?? '/api',
  timeout: 20_000,
  adapter: mockAdapter,
});

export const authAdapter = createRestAuthAdapter(http, {
  endpoints: { forgotPassword: '/auth/forgot-password' },
});

export type UserInput = Pick<User, 'name' | 'username' | 'email' | 'role' | 'status'>;

export interface UserQuery {
  current?: number;
  pageSize?: number;
  keyword?: string;
  role?: Role;
  status?: string;
}

export const userApi = {
  /** Dùng thẳng làm `request` của PortalTable: nhận (params, sort) của ProTable, trả `{ data, total }`. */
  list: async (params: UserQuery = {}, sort: Record<string, 'ascend' | 'descend' | null> = {}): Promise<PageResult<User>> => {
    const [sortField, sortOrder] = Object.entries(sort).find(([, order]) => order) ?? [];
    const res = await http.get<{ items: User[]; totalItems: number }>('/users', {
      params: { ...params, sortField, sortOrder },
    });

    // Backend trả format riêng -> map về { data, total } cho bảng.
    return { data: res.items, total: res.totalItems };
  },
  detail: (id: number | string) => http.get<User>('/users/:id', { pathVars: { id } }),
  search: (keyword: string) => http.get<User[]>('/users/search', { params: { keyword } }),
  create: (input: UserInput) => http.post<User>('/users', input, { notify: { success: 'Đã thêm người dùng' } }),
  update: (id: number, input: UserInput) =>
    http.put<User>('/users/:id', input, { pathVars: { id }, notify: { success: 'Đã cập nhật' } }),
  remove: (id: number) => http.delete('/users/:id', { pathVars: { id }, notify: { success: 'Đã xoá' } }),
};

export const roleApi = {
  list: () => http.get<{ id: Role; name: string }[]>('/roles'),
};

export interface Metric {
  value: number;
  delta: number;
  trend: number[];
}

export interface Activity {
  id: number;
  at: string;
  actor: string;
  type: 'create' | 'update' | 'lock' | 'login';
  text: string;
  target?: string;
}

export const dashboardApi = {
  summary: () =>
    http.get<{
      total: Metric;
      active: Metric;
      pending: Metric;
      locked: Metric;
      roles: { role: Role; count: number }[];
    }>('/dashboard/summary'),
  activity: () => http.get<Activity[]>('/activity'),
};

export interface Unit {
  id: string;
  name: string;
  children: Unit[];
}

export interface Device {
  id: string;
  name: string;
  stock: number;
}

export const catalogApi = {
  units: (options: SelectRequestParams) => http.get<Unit[]>('/units', options),
  provinces: (options: SelectRequestParams) => http.get<{ id: number; name: string }[]>('/provinces', options),
  districts: (options: SelectRequestParams) => http.get<{ id: string; name: string }[]>('/provinces/:id/districts', options),
  devices: () => http.get<Device[]>('/devices'),
};

export const devApi = {
  expireTokens: () => http.post('/dev/expire-tokens', undefined, { skipAuth: true }),
  stats: () =>
    http.get<{ refreshCalls: number; requests: number; userListRequests: number }>('/dev/stats', { skipAuth: true }),
};

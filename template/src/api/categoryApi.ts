import type { PageResult } from '@hoangsonle/portal-core';

import { http } from './http';

export interface Category {
  id: number;
  code: string;
  name: string;
  active: boolean;
}

export type CategoryInput = Omit<Category, 'id'>;

export const categoryApi = {
  /** Dùng thẳng làm `request` của PortalTable. */
  list: (params: { current?: number; pageSize?: number; keyword?: string }) =>
    http.get<PageResult<Category>>('/categories', { params }),
  create: (input: CategoryInput) => http.post<Category>('/categories', input, { notify: { success: 'Đã thêm' } }),
  update: (id: number, input: CategoryInput) =>
    http.put<Category>('/categories/:id', input, { pathVars: { id }, notify: { success: 'Đã cập nhật' } }),
  remove: (id: number) => http.delete('/categories/:id', { pathVars: { id }, notify: { success: 'Đã xoá' } }),
};

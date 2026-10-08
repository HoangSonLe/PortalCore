import type { Locale, Messages } from '@hoangsonle/portal-core';

/** Từ điển riêng của app, merge đè lên từ điển có sẵn trong core. */
export const messages: Partial<Record<Locale, Messages>> = {
  vi: {
    'menu.dashboard': 'Tổng quan',
    'menu.system': 'Hệ thống',
    'menu.users': 'Người dùng',
    'menu.userDetail': 'Chi tiết người dùng',
    'menu.settings': 'Cài đặt',
    'menu.components': 'Component mẫu',
    'status.active': 'Hoạt động',
    'status.pending': 'Chờ duyệt',
    'status.locked': 'Đã khoá',
    'role.admin': 'Quản trị',
    'role.editor': 'Biên tập',
    'role.viewer': 'Chỉ xem',
  },
  en: {
    'menu.dashboard': 'Dashboard',
    'menu.system': 'System',
    'menu.users': 'Users',
    'menu.userDetail': 'User detail',
    'menu.settings': 'Settings',
    'menu.components': 'Components',
    'status.active': 'Active',
    'status.pending': 'Pending',
    'status.locked': 'Locked',
    'role.admin': 'Admin',
    'role.editor': 'Editor',
    'role.viewer': 'Viewer',
  },
};

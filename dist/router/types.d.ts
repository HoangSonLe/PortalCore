import { PermissionMode, PermissionRequirement } from '../permission/permission';
import { ReactNode } from 'react';
export interface AppRoute {
    /** Đoạn path tương đối với route cha (vd `users`, `:id`). Bỏ trống khi `index: true`. */
    path?: string;
    index?: boolean;
    element?: ReactNode;
    /** Tên hiển thị trên menu, breadcrumb, tiêu đề tab. Có thể là i18n key hoặc text thường. */
    title?: string;
    icon?: ReactNode;
    /** Quyền cần có. Thiếu quyền: ẩn khỏi menu, vào thẳng URL thì hiện trang 403. */
    permission?: PermissionRequirement;
    /** `'all'` (mặc định) hoặc `'any'` khi `permission` là mảng. */
    permissionMode?: PermissionMode;
    /** Có route nhưng không hiện trên menu (vd trang chi tiết `users/:id`). */
    hideInMenu?: boolean;
    children?: AppRoute[];
}
export interface FlatRoute {
    fullPath: string;
    route: AppRoute;
    /** Chuỗi route từ gốc tới route này (gồm chính nó) — dùng cho breadcrumb. */
    chain: {
        fullPath: string;
        route: AppRoute;
    }[];
}

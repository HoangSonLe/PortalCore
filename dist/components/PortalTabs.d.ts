import { TabsProps } from 'antd';
export interface PortalTabsProps extends TabsProps {
    /**
     * `path` (mặc định, giống Kit): tab nằm ở đoạn cuối URL — route khai báo `path: 'users/:id/:tabKey?'`.
     * `query`: tab nằm ở query string `?tab=...` — không cần sửa route.
     */
    mode?: 'path' | 'query';
    /** Tên tham số route / query. Mặc định `tabKey` (path) hoặc `tab` (query). */
    paramName?: string;
}
/** Tabs đồng bộ với URL: F5 hay gửi link vẫn mở đúng tab (giống PortalTabs bên Kit cũ). */
export declare const PortalTabs: ({ mode, paramName, onChange, activeKey, items, ...props }: PortalTabsProps) => import("react").JSX.Element;

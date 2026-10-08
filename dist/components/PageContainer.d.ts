import { ReactNode } from 'react';
export interface PageContainerProps {
    /** Mặc định lấy `title` của route hiện tại. */
    title?: ReactNode;
    description?: ReactNode;
    /** Nút hành động góc phải (Thêm mới, Xuất file...). */
    extra?: ReactNode;
    children?: ReactNode;
}
export declare const PageContainer: ({ title, description, extra, children }: PageContainerProps) => import("react").JSX.Element;

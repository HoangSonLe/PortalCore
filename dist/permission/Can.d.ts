import { PermissionMode, PermissionRequirement } from './permission';
import { ComponentType, ReactNode } from 'react';
export interface CanProps {
    permission: PermissionRequirement;
    mode?: PermissionMode;
    /** Hiện khi không có quyền. Mặc định không hiện gì. */
    fallback?: ReactNode;
    children: ReactNode;
}
/** `<Can permission="user.create"><Button>Thêm</Button></Can>` */
export declare const Can: ({ permission, mode, fallback, children }: CanProps) => ReactNode;
/** Bọc cả component/trang theo quyền. Mặc định thiếu quyền thì hiện trang 403. */
export declare const withPermission: <P extends object>(Component: ComponentType<P>, permission: PermissionRequirement, options?: {
    mode?: PermissionMode;
    fallback?: ReactNode;
}) => (props: P) => import("react").JSX.Element;

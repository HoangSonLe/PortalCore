import { PermissionRequirement } from '../permission/permission';
import { ButtonProps, PopconfirmProps, TooltipProps } from 'antd';
import { MouseEvent, ReactNode } from 'react';
/**
 * Nút dựng sẵn: chỉ cần `actionType="add"` là có nhãn + icon (cùng danh sách với PortalButton bên Kit cũ).
 * `filledIcon`: icon dạng đặc hiện khi rê chuột (chỉ những icon antd có cặp Outlined/Filled).
 */
export declare const actionTypeList: {
    add: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    view: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    edit: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    delete: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    save: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    'save-draft': {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    cancel: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    close: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    ok: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    search: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    sync: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    import: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    export: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    upload: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    download: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    lock: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    unlock: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    approve: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    reject: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    submit: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    accept: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    receive: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    process: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    'transfer-process': {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    'cancel-process': {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    assign: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    mobilize: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    respond: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    reply: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    forward: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    notify: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    publish: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    share: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    start: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    complete: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    finish: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    select: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    copy: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    paste: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    location: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    diary: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    history: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    setting: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    print: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
        filledIcon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
    return: {
        label: string;
        icon: import('react').ForwardRefExoticComponent<Omit<import('@ant-design/icons/lib/components/AntdIcon').AntdIconProps, "ref"> & import('react').RefAttributes<HTMLSpanElement>>;
    };
};
export type ActionType = keyof typeof actionTypeList;
export interface PortalButtonProps extends Omit<ButtonProps, 'onClick'> {
    /** Ẩn nút nếu user không có quyền. */
    permissionCode?: PermissionRequirement;
    /** Nút dựng sẵn (nhãn + icon). `children`/`icon` truyền vào sẽ đè lên. */
    actionType?: ActionType;
    /** Chỉ hiện icon, nhãn chuyển thành tooltip. */
    hiddenChildren?: boolean | {
        tooltipProps?: TooltipProps;
    };
    /** Hỏi xác nhận trước khi chạy `onClick` (hoặc `popConfirm.onConfirm`). */
    popConfirm?: PopconfirmProps;
    tooltipProps?: TooltipProps;
    /** Render thêm ngay sau nút (khi nút được hiện). */
    extraElement?: ReactNode;
    /** Icon hiện khi rê chuột (giống Kit). `actionType` đã có sẵn bản đặc cho những icon hỗ trợ. */
    filledIcon?: ReactNode;
    /** Trả về Promise thì nút tự loading tới khi xong. */
    onClick?: (event: MouseEvent<HTMLElement>) => unknown;
}
export declare const PortalButton: ({ permissionCode, actionType, hiddenChildren, popConfirm, tooltipProps, extraElement, hidden, loading, icon, filledIcon, children, danger, onClick, htmlType, onMouseEnter, onMouseLeave, ...buttonProps }: PortalButtonProps) => import("react").JSX.Element | null;

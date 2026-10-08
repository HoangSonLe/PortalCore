import { PortalButtonProps } from './PortalButton';
export interface PortalTableActionButtonProps {
    buttons?: PortalButtonProps[];
}
/** Nhóm nút icon trong cột thao tác của bảng (nhãn hiện ở tooltip). */
export declare const PortalTableActionButton: ({ buttons }: PortalTableActionButtonProps) => import("react").JSX.Element;
export interface MoreButtonGroupProps {
    buttons: PortalButtonProps[];
    /** Nhãn nút. Mặc định "Thêm". */
    label?: string;
}
/** Nút "Thêm ▾" gom các thao tác phụ vào dropdown. Nút có `popConfirm` sẽ hỏi lại bằng modal. */
export declare const MoreButtonGroup: ({ buttons, label }: MoreButtonGroupProps) => import("react").JSX.Element;

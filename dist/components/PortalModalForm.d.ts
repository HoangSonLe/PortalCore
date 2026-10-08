import { ModalFormProps } from '@ant-design/pro-components';
import { ReactNode } from 'react';
export interface PortalModalFormProps<T, V extends Record<string, any>> extends Omit<ModalFormProps<V>, 'onFinish' | 'open' | 'title' | 'onOpenChange'> {
    open: boolean;
    /** Có = đang sửa bản ghi này; không có = thêm mới. */
    record?: T;
    onClose: () => void;
    /** Gọi sau khi lưu thành công (thường là tải lại bảng). */
    onSaved?: () => void;
    /** Mặc định "Thêm mới" / "Chỉnh sửa". */
    title?: ReactNode | {
        create?: ReactNode;
        edit?: (record: T) => ReactNode;
    };
    create?: (values: V) => Promise<unknown>;
    update?: (record: T, values: V) => Promise<unknown>;
    /** Đổi bản ghi sang giá trị form khi sửa. Mặc định dùng nguyên bản ghi. */
    toFormValues?: (record: T) => Partial<V>;
    /** Field làm khoá để reset form khi đổi bản ghi. Mặc định `id`. */
    recordKey?: string;
}
/**
 * ModalForm thêm/sửa dùng chung: lỗi API thì giữ modal (lỗi đã được toast), lưu xong thì đóng + `onSaved`.
 * Dùng cùng `useCrudPage`.
 */
export declare const PortalModalForm: <T extends Record<string, any>, V extends Record<string, any> = Record<string, any>>({ open, record, onClose, onSaved, title, create, update, toFormValues, recordKey, initialValues, modalProps, children, ...props }: PortalModalFormProps<T, V>) => import("react").JSX.Element;

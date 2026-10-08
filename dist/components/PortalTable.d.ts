import { PortalButtonProps } from './PortalButton';
import { ParamsType, ProColumns, ProCoreActionType, ProTableProps } from '@ant-design/pro-components';
import { ReactNode } from 'react';
export interface PortalTableAction<DataType extends Record<string, any>> extends ProColumns<DataType> {
    /** Các nút trên mỗi dòng, hiển thị dạng icon + tooltip. */
    renderButtons?: (entity: DataType, index: number, action: ProCoreActionType | undefined) => PortalButtonProps[];
}
export interface PortalTableSearchItem {
    formItemProps: ProColumns['formItemProps'] & {
        label: ReactNode;
    };
    renderFormItem: ProColumns['renderFormItem'];
    hideInForm?: boolean;
}
export interface PortalTableProps<DataType extends Record<string, any>, Params extends ParamsType = ParamsType, ValueType = 'text'> extends ProTableProps<DataType, Params, ValueType> {
    /** Cột STT đánh số liên tục qua các trang. Mặc định bật; truyền object để chỉnh cột. */
    indexColumn?: ProColumns<DataType> | boolean;
    /** Cột thao tác (bên phải). */
    actionColumn?: PortalTableAction<DataType>;
    /** Ô tìm kiếm không gắn với cột nào. */
    searchFormItems?: PortalTableSearchItem[];
    /**
     * Nhớ cài đặt cột (ẩn/hiện, thứ tự, ghim) vào localStorage. Mặc định bật, khoá theo URL trang.
     * Truyền string để đặt khoá riêng (trang có nhiều bảng), `false` để tắt.
     */
    persistColumns?: boolean | string;
}
/**
 * ProTable cấu hình sẵn (giống PortalTable bên Kit cũ):
 * cột STT, cột thao tác `renderButtons`, ô tìm kiếm riêng, cột mặc định không hiện trong form tìm kiếm.
 * Mọi prop khác của ProTable truyền thẳng được.
 */
export declare const PortalTable: <DataType extends Record<string, any>, Params extends ParamsType = ParamsType, ValueType = "text">({ columns, indexColumn, actionColumn, searchFormItems, request, search, form, pagination, options, scroll, persistColumns, columnsState, ...props }: PortalTableProps<DataType, Params, ValueType>) => import("react").JSX.Element;

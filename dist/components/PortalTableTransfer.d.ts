import { ColProps, FormProps, TableColumnsType, TransferProps } from 'antd';
import { TransferDirection } from 'antd/es/transfer';
import { ReactNode } from 'react';
/** Bộ lọc cho từng bên của bảng chuyển (giống Kit cũ). */
export interface TransferSideFilter<T> {
    formProps?: Omit<FormProps, 'form' | 'onValuesChange'>;
    formItemSpan?: ColProps;
    formItems: {
        name: string;
        label?: ReactNode;
        render: () => ReactNode;
    }[];
    onFilter: (filterParams: Record<string, any>, item: T) => boolean;
}
export type TransferFilter<T> = Record<TransferDirection, TransferSideFilter<T>>;
export interface PortalTableTransferProps<T> extends Omit<TransferProps<any>, 'rowKey' | 'dataSource' | 'targetKeys' | 'onChange' | 'children'> {
    dataSource: T[];
    leftColumns: TableColumnsType<T>;
    rightColumns: TableColumnsType<T>;
    filter?: TransferFilter<T>;
    /** Có thì `value` là mảng object (map theo `valueItems`), không thì là mảng key. */
    valueFormatter?: {
        rowKey?: string;
        valueItems: {
            dataIndex: string;
            name?: string;
        }[];
    };
    value?: any[];
    onChange?: (value: any[]) => void;
    rowKey: string;
}
/** Chuyển bản ghi giữa 2 bảng, vd gán người dùng vào nhóm (giống PortalTableTransfer bên Kit cũ). */
export declare const PortalTableTransfer: <T extends object>({ dataSource, leftColumns, rightColumns, filter, valueFormatter, value, onChange, rowKey, ...props }: PortalTableTransferProps<T>) => import("react").JSX.Element;
export interface PortalTableCountTransferProps<T> extends Omit<PortalTableTransferProps<T>, 'valueFormatter'> {
    valueFormatter: {
        /** Field khoá trong `value`. Mặc định `rowKey`. */
        valueKey?: string;
        valueItems: {
            dataIndex: string;
            name?: string;
        }[];
        count: {
            /** Field số lượng tối đa trong `dataSource`. */
            maxKey: string;
            /** Field số lượng trong `value`. */
            name: string;
            title?: ReactNode;
        };
    };
}
/**
 * Chuyển theo số lượng, vd phân bổ thiết bị: mỗi dòng có tối đa N, chọn chuyển bao nhiêu
 * (giống PortalTableCountTransfer bên Kit cũ).
 */
export declare const PortalTableCountTransfer: <T extends object>({ dataSource, leftColumns, rightColumns, filter, valueFormatter, value, onChange, rowKey, ...props }: PortalTableCountTransferProps<T>) => import("react").JSX.Element;

import { Mapping } from './StatusTag';
import { SelectProps } from 'antd';
export interface PortalEnumSelectProps extends Omit<SelectProps, 'options'> {
    /** Enum TypeScript, object hoặc mảng giá trị. Bỏ trống nếu dùng `mapping`. */
    data?: Record<string, string | number> | (string | number)[];
    /** Nhãn = `t(`${prefixLocale}.${key}`)`; không có bản dịch thì hiện chính key. */
    prefixLocale?: string;
    /** Dùng mapping khai báo bằng `createMapping` thay cho enum. */
    mapping?: Mapping<any>;
    ignoreKeyList?: (string | number)[];
    /** Thêm lựa chọn "Tất cả" ở đầu. */
    hasAllOption?: boolean;
    allOptionValue?: unknown;
    width?: number | string;
    readOnly?: boolean;
}
/** Select từ enum (giống PortalEnumSelect bên Kit cũ), tìm kiếm không phân biệt dấu. */
export declare const PortalEnumSelect: ({ data, prefixLocale, mapping, ignoreKeyList, hasAllOption, allOptionValue, width, readOnly, disabled, allowClear, style, ...props }: PortalEnumSelectProps) => import("react").JSX.Element;

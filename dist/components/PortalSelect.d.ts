import { PathVars } from '../utils/url';
import { SelectProps } from 'antd';
import { ReactNode } from 'react';
export interface SelectOption {
    label: ReactNode;
    value: any;
    [key: string]: unknown;
}
/** Tham số gửi cho `request` — khớp với `http.get(url, options)` của core. */
export interface SelectRequestParams {
    pathVars?: PathVars;
    params?: Record<string, unknown>;
}
export type SelectResponse<T> = T[] | {
    data?: T[];
} | {
    value?: T[];
};
/** Bóc list từ response: `T[]`, `{ data: T[] }` hoặc `{ value: T[] }`. */
export declare const toList: <T>(response: SelectResponse<T> | undefined) => T[];
/** Đủ tham số bắt buộc chưa (vd select Quận cần có `provinceId` mới gọi API). */
export declare const hasRequiredParams: (requestParams: SelectRequestParams | undefined, required: {
    pathVars?: string[];
    params?: string[];
} | undefined) => boolean;
export interface PortalSelectProps<T = any> extends Omit<SelectProps, 'options' | 'loading' | 'onSearch' | 'filterOption' | 'value' | 'onChange'> {
    /** Gọi API lấy danh sách, vd `opts => http.get('/roles', opts)`. */
    request?: (params: SelectRequestParams) => Promise<SelectResponse<T>>;
    requestParams?: SelectRequestParams;
    /** Chỉ gọi API khi các tham số này có giá trị (select phụ thuộc select khác). */
    requiredParamKeys?: {
        pathVars?: string[];
        params?: string[];
    };
    /** Field làm nhãn (hỗ trợ `a.b`), hoặc hàm render. */
    labelKey: string | ((item: T) => ReactNode);
    /** Field làm giá trị. */
    valueKey: string;
    /** Tên tham số gửi từ khoá tìm kiếm. Mặc định `search`. */
    searchKey?: string;
    /** `server` (mặc định): gõ là gọi lại API. `local`: tải 1 lần, lọc tại chỗ (không phân biệt dấu). */
    searchMode?: 'server' | 'local';
    debounceTime?: number;
    /** Trả về object thay vì chỉ value, vd `item => ({ id: item.id, name: item.name })`. */
    customValue?: (item: T) => any;
    /** Field trong object `customValue` dùng làm khoá. Mặc định `valueKey`. */
    customValueKey?: string;
    /** Đặt giá trị ban đầu khi có options lần đầu, vd chọn sẵn phần tử đầu tiên. */
    initValue?: (options: SelectOption[]) => any;
    value?: any;
    onChange?: (value: any) => void;
    onResponse?: (items: T[]) => void;
    ignoreValueList?: unknown[];
    /** Option thêm cố định (vd "Khác"). */
    extraOptions?: SelectOption[];
    customOptions?: (option: SelectOption, item?: T) => SelectOption;
    readOnly?: boolean;
}
/** Select lấy dữ liệu từ API (giống PortalSelect bên Kit cũ). */
export declare const PortalSelect: <T>({ request, requestParams, requiredParamKeys, labelKey, valueKey, searchKey, searchMode, debounceTime, customValue, customValueKey, initValue, value, onChange, onResponse, ignoreValueList, extraOptions, customOptions, readOnly, disabled, allowClear, ...selectProps }: PortalSelectProps<T>) => import("react").JSX.Element;

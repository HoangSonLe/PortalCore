import { DatePickerProps, TimeRangePickerProps } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import { Dayjs } from 'dayjs';
type Picker = DatePickerProps['picker'];
/**
 * Cách lưu giá trị:
 * - `'iso'` (mặc định, giống Kit): chuỗi ISO giờ UTC, vd `2026-10-07T17:00:00.000Z` — hợp với cột timestamp.
 * - chuỗi định dạng dayjs, vd `'YYYY-MM-DD'`: lưu đúng ngày người dùng chọn, không lệch múi giờ —
 *   nên dùng cho ngày sinh, ngày hiệu lực... (cột `date` / `DateOnly` của .NET).
 */
export type DateValueFormat = 'iso' | (string & {});
export declare const parseDateValue: (value: string | null | undefined, valueFormat?: DateValueFormat) => Dayjs | undefined;
export declare const formatDateValue: (date: Dayjs, valueFormat?: DateValueFormat) => string;
/** Định dạng hiển thị kiểu Việt Nam theo loại picker (giống Kit cũ). */
export declare const getDateFormat: (picker: Picker, showTime?: unknown) => "HH:mm:ss" | "MM/YYYY" | "YYYY" | "HH:mm:ss DD/MM/YYYY" | "DD/MM/YYYY" | undefined;
export interface PortalDatePickerProps extends Omit<DatePickerProps, 'value' | 'defaultValue' | 'onChange'> {
    /** Chuỗi theo `valueFormat` (mặc định ISO). */
    value?: string;
    defaultValue?: string;
    /** Trả chuỗi theo `valueFormat`, hoặc `undefined` khi xoá. */
    onChange?: (value?: string) => void;
    /** `'iso'` (mặc định) hoặc định dạng dayjs như `'YYYY-MM-DD'` cho ô chỉ có ngày. */
    valueFormat?: DateValueFormat;
    readOnly?: boolean;
}
/** DatePicker nhận/trả chuỗi ISO — đưa thẳng vào form và API, không phải tự đổi Dayjs. */
export declare const PortalDatePicker: ({ value, defaultValue, onChange, valueFormat, readOnly, disabled, ...props }: PortalDatePickerProps) => import("react").JSX.Element;
/** Mốc chọn nhanh — tính lúc render nên luôn đúng ngày hiện tại (Kit cũ tính 1 lần lúc tải trang). */
export declare const useRangePresets: () => TimeRangePickerProps["presets"];
/** Kéo về đầu/cuối đơn vị: chọn ngày 01 → 05 thành 00:00:00 ngày 01 → 23:59:59.999 ngày 05. */
export declare const normalizeRange: (start: Dayjs, end: Dayjs, picker: Picker, showTime?: unknown) => [Dayjs, Dayjs];
export interface PortalRangePickerProps extends Omit<RangePickerProps, 'value' | 'defaultValue' | 'onChange'> {
    value?: [string, string];
    defaultValue?: [string, string];
    onChange?: (value?: [string, string]) => void;
    /** Dùng bộ chọn nhanh có sẵn (Hôm nay, Tuần này...). Mặc định true. */
    usePortalPresets?: boolean;
    /** `'iso'` (mặc định) hoặc định dạng dayjs như `'YYYY-MM-DD'`. */
    valueFormat?: DateValueFormat;
    readOnly?: boolean;
}
export declare const PortalRangePicker: ({ value, defaultValue, onChange, usePortalPresets, presets, valueFormat, readOnly, disabled, ...props }: PortalRangePickerProps) => import("react").JSX.Element;
export {};

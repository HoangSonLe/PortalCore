import { InputNumberProps } from 'antd';
/** `1234567.89` -> `1,234,567.89` (chỉ nhóm phần nguyên, giữ nguyên phần thập phân). */
export declare const formatThousands: (value: string | number | undefined, separator?: string) => string;
export interface PortalNumberInputProps extends Omit<InputNumberProps<number>, 'formatter' | 'parser'> {
    /** `currency`: hậu tố "VNĐ", bước nhảy 1.000. */
    inputType?: 'currency';
    /** Ký tự ngăn cách hàng nghìn. Mặc định `,` (giống Kit cũ). */
    separator?: string;
    readOnly?: boolean;
}
export declare const PortalNumberInput: ({ inputType, separator, step, readOnly, disabled, style, ...props }: PortalNumberInputProps) => import("react").JSX.Element;

import { InputProps, InputRef } from 'antd';
import { TextAreaProps } from 'antd/es/input';
import { Ref } from 'react';
export type TextType = 'uppercase' | 'lowercase' | 'uppercaseFirstLetter' | 'capitalize';
export declare const transformText: (value: string, textType?: TextType) => string;
export interface PortalInputProps extends Omit<InputProps, 'onChange' | 'value'> {
    value?: string;
    onChange?: (value: string) => void;
    /** Chỉ cho phép nhập khi toàn bộ chuỗi khớp regex, vd `/^[0-9]*$/`. */
    regexRule?: RegExp;
    /** Tự đổi kiểu chữ khi gõ. */
    textType?: TextType;
    /** Báo `onChange` sau khi ngừng gõ (ms). Mặc định 0 = báo ngay. Hợp với ô tìm kiếm. */
    debounceTime?: number;
    readOnly?: boolean;
    ref?: Ref<InputRef>;
}
export declare const PortalInput: ({ value: propValue, onChange, regexRule, textType, debounceTime, readOnly, disabled, onBlur, ...props }: PortalInputProps) => import("react").JSX.Element;
export interface PortalInputTextAreaProps extends Omit<TextAreaProps, 'onChange' | 'value'> {
    value?: string;
    onChange?: (value: string) => void;
    debounceTime?: number;
    readOnly?: boolean;
}
export declare const PortalInputTextArea: ({ value: propValue, onChange, debounceTime, readOnly, disabled, onBlur, ...props }: PortalInputTextAreaProps) => import("react").JSX.Element;

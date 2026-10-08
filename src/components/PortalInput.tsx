import type { InputProps, InputRef } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import type { ChangeEvent, FocusEvent, Ref } from 'react';

import { Input } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { ReadOnlyProvider } from './ReadOnly';

export type TextType = 'uppercase' | 'lowercase' | 'uppercaseFirstLetter' | 'capitalize';

export const transformText = (value: string, textType?: TextType) => {
  switch (textType) {
    case 'uppercase':
      return value.toUpperCase();
    case 'lowercase':
      return value.toLowerCase();
    case 'uppercaseFirstLetter':
      return value.charAt(0).toUpperCase() + value.slice(1);
    case 'capitalize':
      return value.replace(/(^|\s)(\S)/g, (_match, space: string, char: string) => space + char.toUpperCase());
    default:
      return value;
  }
};

/**
 * Giữ giá trị gõ tại chỗ, báo ra ngoài ngay (mặc định) hoặc sau `debounceTime` ms.
 * Có debounce thì khi blur sẽ báo ngay giá trị cuối, để submit form không bị thiếu ký tự.
 */
const useBufferedValue = (
  propValue: string | undefined,
  onChange: ((value: string) => void) | undefined,
  debounceTime: number,
) => {
  const [value, setValue] = useState(propValue ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (pendingRef.current === undefined) setValue(propValue ?? '');
  }, [propValue]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const flush = () => {
    clearTimeout(timerRef.current);

    if (pendingRef.current !== undefined) {
      onChange?.(pendingRef.current);
      pendingRef.current = undefined;
    }
  };

  const update = (next: string) => {
    setValue(next);

    if (!debounceTime) {
      onChange?.(next);

      return;
    }

    pendingRef.current = next;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, debounceTime);
  };

  return { value, update, flush };
};

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

export const PortalInput = ({
  value: propValue,
  onChange,
  regexRule,
  textType,
  debounceTime = 0,
  readOnly = false,
  disabled = false,
  onBlur,
  ...props
}: PortalInputProps) => {
  const { value, update, flush } = useBufferedValue(propValue, onChange, debounceTime);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = transformText(event.target.value, textType);

    if (regexRule && next !== '' && !regexRule.test(next)) return;

    update(next);
  };

  return (
    <ReadOnlyProvider readOnly={readOnly} component="Input">
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          flush();
          onBlur?.(event);
        }}
        disabled={readOnly || disabled}
      />
    </ReadOnlyProvider>
  );
};

export interface PortalInputTextAreaProps extends Omit<TextAreaProps, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  debounceTime?: number;
  readOnly?: boolean;
}

export const PortalInputTextArea = ({
  value: propValue,
  onChange,
  debounceTime = 0,
  readOnly = false,
  disabled = false,
  onBlur,
  ...props
}: PortalInputTextAreaProps) => {
  const { value, update, flush } = useBufferedValue(propValue, onChange, debounceTime);

  return (
    <ReadOnlyProvider readOnly={readOnly} component="Input">
      <Input.TextArea
        autoSize={{ minRows: 3, maxRows: 8 }}
        {...props}
        value={value}
        onChange={event => update(event.target.value)}
        onBlur={event => {
          flush();
          onBlur?.(event);
        }}
        disabled={readOnly || disabled}
      />
    </ReadOnlyProvider>
  );
};

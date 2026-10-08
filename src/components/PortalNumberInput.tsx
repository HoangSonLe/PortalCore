import type { InputNumberProps } from 'antd';

import { InputNumber } from 'antd';

import { ReadOnlyProvider } from './ReadOnly';

/** `1234567.89` -> `1,234,567.89` (chỉ nhóm phần nguyên, giữ nguyên phần thập phân). */
export const formatThousands = (value: string | number | undefined, separator = ',') => {
  if (value === undefined || value === null || value === '') return '';

  const [integer, decimal] = String(value).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return decimal !== undefined ? `${grouped}.${decimal}` : grouped;
};

export interface PortalNumberInputProps extends Omit<InputNumberProps<number>, 'formatter' | 'parser'> {
  /** `currency`: hậu tố "VNĐ", bước nhảy 1.000. */
  inputType?: 'currency';
  /** Ký tự ngăn cách hàng nghìn. Mặc định `,` (giống Kit cũ). */
  separator?: string;
  readOnly?: boolean;
}

export const PortalNumberInput = ({
  inputType,
  separator = ',',
  step,
  readOnly = false,
  disabled = false,
  style,
  ...props
}: PortalNumberInputProps) => (
  <ReadOnlyProvider readOnly={readOnly} component="InputNumber">
    <InputNumber<number>
      min={0}
      style={{ width: '100%', ...style }}
      formatter={value => formatThousands(value, separator)}
      parser={value => Number((value ?? '').split(separator).join('')) as number}
      suffix={inputType === 'currency' ? 'VNĐ' : undefined}
      step={step ?? (inputType === 'currency' ? 1000 : undefined)}
      disabled={readOnly || disabled}
      {...props}
    />
  </ReadOnlyProvider>
);

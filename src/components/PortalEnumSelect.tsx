import type { Mapping } from './StatusTag';
import type { SelectProps } from 'antd';

import { Select } from 'antd';
import { useMemo } from 'react';

import { useT } from '../core/hooks';
import { includesText } from '../utils/string';
import { ReadOnlyProvider } from './ReadOnly';

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
export const PortalEnumSelect = ({
  data,
  prefixLocale,
  mapping,
  ignoreKeyList = [],
  hasAllOption = false,
  allOptionValue = -1,
  width = '100%',
  readOnly = false,
  disabled = false,
  allowClear = true,
  style,
  ...props
}: PortalEnumSelectProps) => {
  const t = useT();

  const options = useMemo(() => {
    const ignored = new Set(ignoreKeyList);
    const translate = (key: string | number) => {
      if (!prefixLocale) return String(key);

      const id = `${prefixLocale}.${key}`;
      const label = t(id);

      return label === id ? String(key) : label;
    };

    const list = mapping
      ? mapping.toOptions(t)
      : (Array.isArray(data) ? data : Object.values(data ?? {}))
          // Enum số của TS có cả ánh xạ ngược (0 -> 'A'), chỉ lấy giá trị thật.
          .filter(key =>
            Array.isArray(data) ? true : typeof key === 'string' || !Object.prototype.hasOwnProperty.call(data, key),
          )
          .map(key => ({ value: key, label: translate(key) }));

    const filtered = list.filter(option => !ignored.has(option.value));

    return hasAllOption ? [{ value: allOptionValue, label: t('select.all') }, ...filtered] : filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mapping, prefixLocale, t, hasAllOption, allOptionValue, ignoreKeyList.join('|')]);

  return (
    <ReadOnlyProvider readOnly={readOnly} component="Select">
      <Select
        showSearch
        allowClear={allowClear}
        filterOption={(input, option) => includesText(option?.label, input)}
        style={{ width, ...style }}
        {...props}
        options={options as SelectProps['options']}
        disabled={readOnly || disabled}
      />
    </ReadOnlyProvider>
  );
};

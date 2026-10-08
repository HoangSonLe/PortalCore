import type { DatePickerProps, TimeRangePickerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { Dayjs } from 'dayjs';

import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { useT } from '../core/hooks';
import { ReadOnlyProvider } from './ReadOnly';

dayjs.extend(customParseFormat);

type Picker = DatePickerProps['picker'];

/**
 * Cách lưu giá trị:
 * - `'iso'` (mặc định, giống Kit): chuỗi ISO giờ UTC, vd `2026-10-07T17:00:00.000Z` — hợp với cột timestamp.
 * - chuỗi định dạng dayjs, vd `'YYYY-MM-DD'`: lưu đúng ngày người dùng chọn, không lệch múi giờ —
 *   nên dùng cho ngày sinh, ngày hiệu lực... (cột `date` / `DateOnly` của .NET).
 */
export type DateValueFormat = 'iso' | (string & {});

export const parseDateValue = (value: string | null | undefined, valueFormat: DateValueFormat = 'iso') => {
  if (!value) return undefined;

  const parsed = valueFormat === 'iso' ? dayjs(value) : dayjs(value, valueFormat, true);

  return parsed.isValid() ? parsed : undefined;
};

export const formatDateValue = (date: Dayjs, valueFormat: DateValueFormat = 'iso') =>
  valueFormat === 'iso' ? date.toISOString() : date.format(valueFormat);

/** Định dạng hiển thị kiểu Việt Nam theo loại picker (giống Kit cũ). */
export const getDateFormat = (picker: Picker, showTime?: unknown) => {
  switch (picker) {
    case 'time':
      return 'HH:mm:ss';
    case 'month':
      return 'MM/YYYY';
    case 'year':
      return 'YYYY';
    case 'week':
    case 'quarter':
      return undefined;
    default:
      return showTime ? 'HH:mm:ss DD/MM/YYYY' : 'DD/MM/YYYY';
  }
};

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
export const PortalDatePicker = ({
  value,
  defaultValue,
  onChange,
  valueFormat = 'iso',
  readOnly = false,
  disabled = false,
  ...props
}: PortalDatePickerProps) => (
  <ReadOnlyProvider readOnly={readOnly} component="DatePicker">
    <DatePicker
      format={getDateFormat(props.picker, props.showTime)}
      style={{ width: '100%' }}
      {...props}
      disabled={readOnly || disabled}
      value={parseDateValue(value, valueFormat)}
      defaultValue={parseDateValue(defaultValue, valueFormat)}
      onChange={date => onChange?.(date && date.isValid() ? formatDateValue(date, valueFormat) : undefined)}
    />
  </ReadOnlyProvider>
);

/** Mốc chọn nhanh — tính lúc render nên luôn đúng ngày hiện tại (Kit cũ tính 1 lần lúc tải trang). */
export const useRangePresets = (): TimeRangePickerProps['presets'] => {
  const t = useT();
  const now = dayjs();

  return [
    { label: t('picker.today'), value: [now.startOf('day'), now.endOf('day')] },
    { label: t('picker.thisWeek'), value: [now.startOf('week'), now.endOf('day')] },
    { label: t('picker.thisMonth'), value: [now.startOf('month'), now.endOf('day')] },
    { label: t('picker.last7Days'), value: [now.subtract(7, 'day').startOf('day'), now.endOf('day')] },
    { label: t('picker.last30Days'), value: [now.subtract(30, 'day').startOf('day'), now.endOf('day')] },
  ];
};

/** Kéo về đầu/cuối đơn vị: chọn ngày 01 → 05 thành 00:00:00 ngày 01 → 23:59:59.999 ngày 05. */
export const normalizeRange = (start: Dayjs, end: Dayjs, picker: Picker, showTime?: unknown): [Dayjs, Dayjs] => {
  if (showTime || picker === 'time') return [start, end];

  const unit = picker === 'week' || picker === 'month' || picker === 'year' || picker === 'quarter' ? picker : 'day';
  const startUnit = unit === 'quarter' ? 'month' : unit;

  return [start.startOf(startUnit), end.endOf(startUnit)];
};

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

export const PortalRangePicker = ({
  value,
  defaultValue,
  onChange,
  usePortalPresets = true,
  presets,
  valueFormat = 'iso',
  readOnly = false,
  disabled = false,
  ...props
}: PortalRangePickerProps) => {
  const portalPresets = useRangePresets();

  return (
    <ReadOnlyProvider readOnly={readOnly} component="DatePicker">
      <DatePicker.RangePicker
        format={getDateFormat(props.picker, props.showTime)}
        style={{ width: '100%' }}
        {...props}
        presets={usePortalPresets ? portalPresets : presets}
        disabled={readOnly || disabled}
        value={
          value
            ? [parseDateValue(value[0], valueFormat) ?? null, parseDateValue(value[1], valueFormat) ?? null]
            : undefined
        }
        defaultValue={
          defaultValue
            ? [
                parseDateValue(defaultValue[0], valueFormat) ?? null,
                parseDateValue(defaultValue[1], valueFormat) ?? null,
              ]
            : undefined
        }
        onChange={dates => {
          if (!dates?.[0] || !dates[1]) {
            onChange?.(undefined);

            return;
          }

          const [start, end] = normalizeRange(dates[0], dates[1], props.picker, props.showTime);

          onChange?.([formatDateValue(start, valueFormat), formatDateValue(end, valueFormat)]);
        }}
      />
    </ReadOnlyProvider>
  );
};

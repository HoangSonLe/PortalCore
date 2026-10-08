import type { DatePickerProps, TimeRangePickerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { Dayjs } from 'dayjs';

import { DatePicker } from 'antd';
import dayjs from 'dayjs';

import { useT } from '../core/hooks';
import { ReadOnlyProvider } from './ReadOnly';

type Picker = DatePickerProps['picker'];

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

const toDayjs = (value?: string | null) => (value && dayjs(value).isValid() ? dayjs(value) : undefined);

export interface PortalDatePickerProps extends Omit<DatePickerProps, 'value' | 'defaultValue' | 'onChange'> {
  /** Chuỗi ISO. */
  value?: string;
  defaultValue?: string;
  /** Trả chuỗi ISO, hoặc `undefined` khi xoá. */
  onChange?: (value?: string) => void;
  readOnly?: boolean;
}

/** DatePicker nhận/trả chuỗi ISO — đưa thẳng vào form và API, không phải tự đổi Dayjs. */
export const PortalDatePicker = ({
  value,
  defaultValue,
  onChange,
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
      value={toDayjs(value)}
      defaultValue={toDayjs(defaultValue)}
      onChange={date => onChange?.(date && date.isValid() ? date.toISOString() : undefined)}
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
  readOnly?: boolean;
}

export const PortalRangePicker = ({
  value,
  defaultValue,
  onChange,
  usePortalPresets = true,
  presets,
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
        value={value ? [toDayjs(value[0]) ?? null, toDayjs(value[1]) ?? null] : undefined}
        defaultValue={defaultValue ? [toDayjs(defaultValue[0]) ?? null, toDayjs(defaultValue[1]) ?? null] : undefined}
        onChange={dates => {
          if (!dates?.[0] || !dates[1]) {
            onChange?.(undefined);

            return;
          }

          const [start, end] = normalizeRange(dates[0], dates[1], props.picker, props.showTime);

          onChange?.([start.toISOString(), end.toISOString()]);
        }}
      />
    </ReadOnlyProvider>
  );
};

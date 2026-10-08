import type { Translate } from '../i18n/messages';
import type { TagProps } from 'antd';

import { Tag } from 'antd';

import { useT } from '../core/hooks';

export interface MappingItem<V extends string | number = string | number> {
  value: V;
  /** Text hoặc i18n key. */
  label: string;
  /** Màu Tag của antd: `success`, `error`, `warning`, `processing`, `default` hoặc mã màu. */
  color?: TagProps['color'];
}

export interface Mapping<V extends string | number> {
  items: readonly MappingItem<V>[];
  get: (value: V | null | undefined) => MappingItem<V> | undefined;
  /** Cho `<Select options>`. */
  toOptions: (t?: Translate) => { label: string; value: V }[];
  /** Cho `valueEnum` của ProTable (filter + hiển thị). */
  toValueEnum: (t?: Translate) => Record<string, { text: string }>;
}

/**
 * Khai báo 1 lần, dùng ở mọi nơi: tag hiển thị, select lọc, valueEnum của ProTable.
 *
 * ```ts
 * export const userStatus = createMapping([
 *   { value: 'ACTIVE', label: 'Hoạt động', color: 'success' },
 *   { value: 'LOCKED', label: 'Đã khoá', color: 'error' },
 * ]);
 * ```
 */
export const createMapping = <V extends string | number>(items: readonly MappingItem<V>[]): Mapping<V> => {
  const byValue = new Map(items.map(item => [item.value, item]));
  const translate = (t: Translate | undefined, label: string) => (t ? t(label) : label);

  return {
    items,
    get: value => (value === null || value === undefined ? undefined : byValue.get(value)),
    toOptions: t => items.map(item => ({ label: translate(t, item.label), value: item.value })),
    toValueEnum: t => Object.fromEntries(items.map(item => [String(item.value), { text: translate(t, item.label) }])),
  };
};

export interface StatusTagProps<V extends string | number> extends Omit<TagProps, 'color'> {
  mapping: Mapping<V>;
  value: V | null | undefined;
  /** Hiện khi value không có trong mapping. Mặc định hiện chính value. */
  fallback?: React.ReactNode;
}

export const StatusTag = <V extends string | number>({ mapping, value, fallback, ...tagProps }: StatusTagProps<V>) => {
  const t = useT();
  const item = mapping.get(value);

  if (!item) return fallback ?? (value === null || value === undefined ? null : <Tag {...tagProps}>{value}</Tag>);

  return (
    <Tag {...tagProps} color={item.color}>
      {t(item.label)}
    </Tag>
  );
};

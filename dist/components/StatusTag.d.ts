import { Translate } from '../i18n/messages';
import { TagProps } from 'antd';
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
    toOptions: (t?: Translate) => {
        label: string;
        value: V;
    }[];
    /** Cho `valueEnum` của ProTable (filter + hiển thị). */
    toValueEnum: (t?: Translate) => Record<string, {
        text: string;
    }>;
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
export declare const createMapping: <V extends string | number>(items: readonly MappingItem<V>[]) => Mapping<V>;
export interface StatusTagProps<V extends string | number> extends Omit<TagProps, 'color'> {
    mapping: Mapping<V>;
    value: V | null | undefined;
    /** Hiện khi value không có trong mapping. Mặc định hiện chính value. */
    fallback?: React.ReactNode;
}
export declare const StatusTag: <V extends string | number>({ mapping, value, fallback, ...tagProps }: StatusTagProps<V>) => string | number | bigint | boolean | Iterable<import('react').ReactNode> | Promise<string | number | bigint | boolean | import('react').ReactPortal | import('react').ReactElement<unknown, string | import('react').JSXElementConstructor<any>> | Iterable<import('react').ReactNode> | null | undefined> | import("react").JSX.Element | null;

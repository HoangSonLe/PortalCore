import type { PathVars } from '../utils/url';
import type { SelectProps } from 'antd';
import type { ReactNode } from 'react';

import { List, Select, Tooltip } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getByPath, includesText } from '../utils/string';
import { ReadOnlyProvider } from './ReadOnly';

export interface SelectOption {
  label: ReactNode;
  value: any;
  [key: string]: unknown;
}

/** Tham số gửi cho `request` — khớp với `http.get(url, options)` của core. */
export interface SelectRequestParams {
  pathVars?: PathVars;
  params?: Record<string, unknown>;
}

export type SelectResponse<T> = T[] | { data?: T[] } | { value?: T[] };

/** Bóc list từ response: `T[]`, `{ data: T[] }` hoặc `{ value: T[] }`. */
export const toList = <T,>(response: SelectResponse<T> | undefined): T[] => {
  if (Array.isArray(response)) return response;

  const record = response as { data?: T[]; value?: T[] } | undefined;

  return (Array.isArray(record?.data) ? record.data : Array.isArray(record?.value) ? record.value : []) as T[];
};

/** Đủ tham số bắt buộc chưa (vd select Quận cần có `provinceId` mới gọi API). */
export const hasRequiredParams = (
  requestParams: SelectRequestParams | undefined,
  required: { pathVars?: string[]; params?: string[] } | undefined,
) =>
  !required ||
  ((required.pathVars ?? []).every(key => !!requestParams?.pathVars?.[key]) &&
    (required.params ?? []).every(key => !!requestParams?.params?.[key]));

export interface PortalSelectProps<T = any> extends Omit<
  SelectProps,
  'options' | 'loading' | 'onSearch' | 'filterOption' | 'value' | 'onChange'
> {
  /** Gọi API lấy danh sách, vd `opts => http.get('/roles', opts)`. */
  request?: (params: SelectRequestParams) => Promise<SelectResponse<T>>;
  requestParams?: SelectRequestParams;
  /** Chỉ gọi API khi các tham số này có giá trị (select phụ thuộc select khác). */
  requiredParamKeys?: { pathVars?: string[]; params?: string[] };
  /** Field làm nhãn (hỗ trợ `a.b`), hoặc hàm render. */
  labelKey: string | ((item: T) => ReactNode);
  /** Field làm giá trị. */
  valueKey: string;
  /** Tên tham số gửi từ khoá tìm kiếm. Mặc định `search`. */
  searchKey?: string;
  /** `server` (mặc định): gõ là gọi lại API. `local`: tải 1 lần, lọc tại chỗ (không phân biệt dấu). */
  searchMode?: 'server' | 'local';
  debounceTime?: number;
  /** Trả về object thay vì chỉ value, vd `item => ({ id: item.id, name: item.name })`. */
  customValue?: (item: T) => any;
  /** Field trong object `customValue` dùng làm khoá. Mặc định `valueKey`. */
  customValueKey?: string;
  /** Đặt giá trị ban đầu khi có options lần đầu, vd chọn sẵn phần tử đầu tiên. */
  initValue?: (options: SelectOption[]) => any;
  value?: any;
  onChange?: (value: any) => void;
  onResponse?: (items: T[]) => void;
  ignoreValueList?: unknown[];
  /** Option thêm cố định (vd "Khác"). */
  extraOptions?: SelectOption[];
  customOptions?: (option: SelectOption, item?: T) => SelectOption;
  readOnly?: boolean;
}

/** Select lấy dữ liệu từ API (giống PortalSelect bên Kit cũ). */
export const PortalSelect = <T,>({
  request,
  requestParams,
  requiredParamKeys,
  labelKey,
  valueKey,
  searchKey = 'search',
  searchMode = 'server',
  debounceTime = 300,
  customValue,
  customValueKey,
  initValue,
  value,
  onChange,
  onResponse,
  ignoreValueList,
  extraOptions,
  customOptions,
  readOnly = false,
  disabled = false,
  allowClear = true,
  ...selectProps
}: PortalSelectProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [initialized, setInitialized] = useState(false);
  /** Nhớ mọi item đã thấy -> option đã chọn vẫn hiện đúng nhãn khi kết quả tìm kiếm không còn chứa nó. */
  const cacheRef = useRef(new Map<unknown, T>());
  const requestRef = useRef(request);
  const callIdRef = useRef(0);

  requestRef.current = request;

  const toOption = (item: T): SelectOption => {
    const option = {
      value: getByPath(item, valueKey),
      label: typeof labelKey === 'function' ? labelKey(item) : getByPath(item, labelKey),
    };

    return customOptions ? customOptions(option, item) : option;
  };

  const paramsKey = JSON.stringify(requestParams ?? {});
  const serverSearch = searchMode === 'server' ? search : '';

  useEffect(() => {
    const callId = ++callIdRef.current;

    if (!requestRef.current || !hasRequiredParams(requestParams, requiredParamKeys)) {
      setItems([]);

      return undefined;
    }

    const timer = setTimeout(
      async () => {
        setLoading(true);

        try {
          const response = await requestRef.current!({
            pathVars: requestParams?.pathVars,
            params: { ...(serverSearch ? { [searchKey]: serverSearch } : {}), ...requestParams?.params },
          });
          const list = toList(response);

          if (callId !== callIdRef.current) return;

          list.forEach(item => cacheRef.current.set(getByPath(item, valueKey), item));
          setItems(list);
          onResponse?.(list);
        } catch {
          if (callId === callIdRef.current) setItems([]);
        } finally {
          if (callId === callIdRef.current) setLoading(false);
        }
      },
      serverSearch ? debounceTime : 0,
    );

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, serverSearch, JSON.stringify(requiredParamKeys ?? {})]);

  const keyOf = (item: unknown) =>
    item && typeof item === 'object' ? getByPath(item, customValueKey ?? valueKey) : item;
  const selectValue = customValue ? (Array.isArray(value) ? value.map(keyOf) : keyOf(value)) : value;

  const options = useMemo(() => {
    const ignored = new Set(ignoreValueList ?? []);
    const fromItems = items.map(toOption).filter(option => !ignored.has(option.value));
    const seen = new Set(fromItems.map(option => option.value));
    const selectedKeys = (
      Array.isArray(selectValue) ? selectValue : selectValue !== undefined ? [selectValue] : []
    ).filter(key => !seen.has(key) && cacheRef.current.has(key));
    const selectedOptions = selectedKeys.map(key => toOption(cacheRef.current.get(key)!));
    const extras = (extraOptions ?? []).filter(option => !seen.has(option.value));

    return [...selectedOptions, ...fromItems, ...extras];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, JSON.stringify(selectValue), extraOptions, ignoreValueList]);

  useEffect(() => {
    if (initValue && !initialized && options.length > 0) {
      setInitialized(true);
      onChange?.(initValue(options));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleChange = (next: any) => {
    if (searchMode === 'server') setSearch('');

    if (!customValue || next === undefined || next === null) {
      onChange?.(next);

      return;
    }

    const toCustom = (key: unknown) => {
      const item = cacheRef.current.get(key);

      return item ? customValue(item) : undefined;
    };

    onChange?.(Array.isArray(next) ? next.map(toCustom).filter(Boolean) : toCustom(next));
  };

  return (
    <ReadOnlyProvider readOnly={readOnly} component="Select">
      <Select
        showSearch
        allowClear={allowClear}
        {...selectProps}
        value={selectValue}
        options={options}
        loading={loading}
        disabled={readOnly || disabled}
        onChange={handleChange}
        onOpenChange={open => {
          if (!open && searchMode === 'server') setSearch('');
          selectProps.onOpenChange?.(open);
        }}
        {...(searchMode === 'server'
          ? { filterOption: false, onSearch: setSearch }
          : { filterOption: (input: string, option?: SelectOption) => includesText(option?.label, input) })}
        maxTagPlaceholder={omitted => (
          <Tooltip
            title={
              <List
                size="small"
                dataSource={omitted}
                renderItem={item => <List.Item style={{ color: 'inherit' }}>{item.label}</List.Item>}
                style={{ maxHeight: 200, overflowY: 'auto' }}
              />
            }
          >
            <span>+{omitted.length}...</span>
          </Tooltip>
        )}
      />
    </ReadOnlyProvider>
  );
};

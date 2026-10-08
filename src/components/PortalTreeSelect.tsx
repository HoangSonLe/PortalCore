import type { SelectRequestParams, SelectResponse } from './PortalSelect';
import type { TreeSelectProps } from 'antd';

import { TreeSelect } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { getByPath } from '../utils/string';
import { toList } from './PortalSelect';
import { ReadOnlyProvider } from './ReadOnly';

export interface TreeNode {
  label: string | number;
  value: string | number;
  children?: TreeNode[];
}

/**
 * Cách đọc cây từ response (giống Kit cũ):
 * `{ label: 'name', value: 'id', children: { key: 'units', value: { label: 'name', value: 'id' } } }`.
 */
export interface TreeSelectKey {
  label: string;
  value: string;
  children?: { key: string; value: TreeSelectKey };
}

export const toTreeNodes = (items: unknown[] | undefined, key: TreeSelectKey): TreeNode[] =>
  (items ?? []).map(item => ({
    label: getByPath(item, key.label),
    value: getByPath(item, key.value),
    ...(key.children ? { children: toTreeNodes(getByPath(item, key.children.key), key.children.value) } : {}),
  }));

/** Giữ lại các nhánh chứa giá trị đang chọn. */
export const pickSelectedBranches = (nodes: TreeNode[], selected: Set<unknown>): TreeNode[] =>
  nodes.flatMap((node): TreeNode[] => {
    const children = node.children ? pickSelectedBranches(node.children, selected) : [];

    if (children.length) return [{ ...node, children }];

    return selected.has(node.value) ? [{ ...node, children: undefined }] : [];
  });

/** Gộp 2 cây theo `value` (đệ quy). */
export const mergeTrees = (a: TreeNode[], b: TreeNode[]): TreeNode[] => {
  const result = a.map(node => ({ ...node }));

  for (const node of b) {
    const existing = result.find(item => item.value === node.value);

    if (!existing) result.push(node);
    else if (existing.children || node.children) existing.children = mergeTrees(existing.children ?? [], node.children ?? []);
  }

  return result;
};

export interface PortalTreeSelectProps<T = any> extends Omit<TreeSelectProps, 'treeData' | 'loading' | 'onSearch' | 'value' | 'onChange'> {
  request?: (params: SelectRequestParams) => Promise<SelectResponse<T>>;
  requestParams?: SelectRequestParams;
  treeSelectKey: TreeSelectKey;
  searchKey?: string;
  debounceTime?: number;
  initValue?: (treeData: TreeNode[]) => (string | number)[];
  value?: (string | number)[];
  onChange?: (value?: (string | number)[]) => void;
  /** Giống Kit: gọi kèm khi đổi giá trị. */
  handleOnChange?: (value?: (string | number)[]) => void;
  readOnly?: boolean;
}

/** Chọn trong cây lấy từ API (đơn vị, phòng ban...). Mặc định nhiều lựa chọn có checkbox. */
export const PortalTreeSelect = <T,>({
  request,
  requestParams,
  treeSelectKey,
  searchKey = 'search',
  debounceTime = 300,
  initValue,
  value,
  onChange,
  handleOnChange,
  readOnly = false,
  disabled = false,
  ...props
}: PortalTreeSelectProps<T>) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [initialized, setInitialized] = useState(false);
  const requestRef = useRef(request);
  const treeRef = useRef(treeData);
  const valueRef = useRef(value);
  const callIdRef = useRef(0);

  requestRef.current = request;
  treeRef.current = treeData;
  valueRef.current = value;

  const paramsKey = JSON.stringify(requestParams ?? {});

  useEffect(() => {
    const callId = ++callIdRef.current;

    if (!requestRef.current) return undefined;

    const timer = setTimeout(
      async () => {
        setLoading(true);

        try {
          const response = await requestRef.current!({
            pathVars: requestParams?.pathVars,
            params: { ...(search ? { [searchKey]: search } : {}), ...requestParams?.params },
          });

          if (callId !== callIdRef.current) return;

          const nodes = toTreeNodes(toList(response), treeSelectKey);
          const selected = new Set<unknown>(valueRef.current ?? []);

          // Kết quả tìm kiếm không chứa mục đã chọn -> giữ nhánh cũ để tag vẫn hiện đúng nhãn.
          setTreeData(selected.size ? mergeTrees(pickSelectedBranches(treeRef.current, selected), nodes) : nodes);
        } catch {
          // Lỗi đã được HttpClient thông báo.
        } finally {
          if (callId === callIdRef.current) setLoading(false);
        }
      },
      search ? debounceTime : 0,
    );

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, search]);

  useEffect(() => {
    if (initValue && !initialized && treeData.length) {
      setInitialized(true);
      onChange?.(initValue(treeData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData]);

  return (
    <ReadOnlyProvider readOnly={readOnly} component="TreeSelect">
      <TreeSelect
        showSearch
        allowClear
        treeCheckable
        treeDefaultExpandAll
        maxTagCount={1}
        style={{ width: '100%' }}
        {...props}
        value={value}
        treeData={treeData}
        loading={loading}
        filterTreeNode={false}
        disabled={readOnly || disabled}
        onSearch={setSearch}
        onOpenChange={open => {
          if (!open) setSearch('');
          props.onOpenChange?.(open);
        }}
        onChange={next => {
          handleOnChange?.(next);
          onChange?.(next);
        }}
      />
    </ReadOnlyProvider>
  );
};

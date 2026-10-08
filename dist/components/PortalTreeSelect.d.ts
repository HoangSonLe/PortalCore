import { SelectRequestParams, SelectResponse } from './PortalSelect';
import { TreeSelectProps } from 'antd';
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
    children?: {
        key: string;
        value: TreeSelectKey;
    };
}
export declare const toTreeNodes: (items: unknown[] | undefined, key: TreeSelectKey) => TreeNode[];
/** Giữ lại các nhánh chứa giá trị đang chọn. */
export declare const pickSelectedBranches: (nodes: TreeNode[], selected: Set<unknown>) => TreeNode[];
/** Gộp 2 cây theo `value` (đệ quy). */
export declare const mergeTrees: (a: TreeNode[], b: TreeNode[]) => TreeNode[];
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
export declare const PortalTreeSelect: <T>({ request, requestParams, treeSelectKey, searchKey, debounceTime, initValue, value, onChange, handleOnChange, readOnly, disabled, ...props }: PortalTreeSelectProps<T>) => import("react").JSX.Element;

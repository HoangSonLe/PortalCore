import { jsx } from "react/jsx-runtime";
import { TreeSelect } from "antd";
import { useState, useRef, useEffect } from "react";
import { getByPath } from "../utils/string.js";
import { toList } from "./PortalSelect.js";
import { ReadOnlyProvider } from "./ReadOnly.js";
const toTreeNodes = (items, key) => (items ?? []).map((item) => ({
  label: getByPath(item, key.label),
  value: getByPath(item, key.value),
  ...key.children ? { children: toTreeNodes(getByPath(item, key.children.key), key.children.value) } : {}
}));
const pickSelectedBranches = (nodes, selected) => nodes.flatMap((node) => {
  const children = node.children ? pickSelectedBranches(node.children, selected) : [];
  if (children.length) return [{ ...node, children }];
  return selected.has(node.value) ? [{ ...node, children: void 0 }] : [];
});
const mergeTrees = (a, b) => {
  const result = a.map((node) => ({ ...node }));
  for (const node of b) {
    const existing = result.find((item) => item.value === node.value);
    if (!existing) result.push(node);
    else if (existing.children || node.children)
      existing.children = mergeTrees(existing.children ?? [], node.children ?? []);
  }
  return result;
};
const PortalTreeSelect = ({
  request,
  requestParams,
  treeSelectKey,
  searchKey = "search",
  debounceTime = 300,
  initValue,
  value,
  onChange,
  handleOnChange,
  readOnly = false,
  disabled = false,
  ...props
}) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
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
    if (!requestRef.current) return void 0;
    const timer = setTimeout(
      async () => {
        setLoading(true);
        try {
          const response = await requestRef.current({
            pathVars: requestParams?.pathVars,
            params: { ...search ? { [searchKey]: search } : {}, ...requestParams?.params }
          });
          if (callId !== callIdRef.current) return;
          const nodes = toTreeNodes(toList(response), treeSelectKey);
          const selected = new Set(valueRef.current ?? []);
          setTreeData(selected.size ? mergeTrees(pickSelectedBranches(treeRef.current, selected), nodes) : nodes);
        } catch {
        } finally {
          if (callId === callIdRef.current) setLoading(false);
        }
      },
      search ? debounceTime : 0
    );
    return () => clearTimeout(timer);
  }, [paramsKey, search]);
  useEffect(() => {
    if (initValue && !initialized && treeData.length) {
      setInitialized(true);
      onChange?.(initValue(treeData));
    }
  }, [treeData]);
  return /* @__PURE__ */ jsx(ReadOnlyProvider, { readOnly, component: "TreeSelect", children: /* @__PURE__ */ jsx(
    TreeSelect,
    {
      showSearch: true,
      allowClear: true,
      treeCheckable: true,
      treeDefaultExpandAll: true,
      maxTagCount: 1,
      style: { width: "100%" },
      ...props,
      value,
      treeData,
      loading,
      filterTreeNode: false,
      disabled: readOnly || disabled,
      onSearch: setSearch,
      onOpenChange: (open) => {
        if (!open) setSearch("");
        props.onOpenChange?.(open);
      },
      onChange: (next) => {
        handleOnChange?.(next);
        onChange?.(next);
      }
    }
  ) });
};
export {
  PortalTreeSelect,
  mergeTrees,
  pickSelectedBranches,
  toTreeNodes
};
//# sourceMappingURL=PortalTreeSelect.js.map

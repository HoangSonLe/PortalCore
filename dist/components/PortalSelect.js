import { jsx, jsxs } from "react/jsx-runtime";
import { Select, Tooltip, List } from "antd";
import { useState, useRef, useEffect, useMemo } from "react";
import { getByPath, includesText } from "../utils/string.js";
import { ReadOnlyProvider } from "./ReadOnly.js";
const toList = (response) => {
  if (Array.isArray(response)) return response;
  const record = response;
  return Array.isArray(record?.data) ? record.data : Array.isArray(record?.value) ? record.value : [];
};
const hasRequiredParams = (requestParams, required) => !required || (required.pathVars ?? []).every((key) => !!requestParams?.pathVars?.[key]) && (required.params ?? []).every((key) => !!requestParams?.params?.[key]);
const PortalSelect = ({
  request,
  requestParams,
  requiredParamKeys,
  labelKey,
  valueKey,
  searchKey = "search",
  searchMode = "server",
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
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [initialized, setInitialized] = useState(false);
  const cacheRef = useRef(/* @__PURE__ */ new Map());
  const requestRef = useRef(request);
  const callIdRef = useRef(0);
  requestRef.current = request;
  const toOption = (item) => {
    const option = {
      value: getByPath(item, valueKey),
      label: typeof labelKey === "function" ? labelKey(item) : getByPath(item, labelKey)
    };
    return customOptions ? customOptions(option, item) : option;
  };
  const paramsKey = JSON.stringify(requestParams ?? {});
  const serverSearch = searchMode === "server" ? search : "";
  useEffect(() => {
    const callId = ++callIdRef.current;
    if (!requestRef.current || !hasRequiredParams(requestParams, requiredParamKeys)) {
      setItems([]);
      return void 0;
    }
    const timer = setTimeout(
      async () => {
        setLoading(true);
        try {
          const response = await requestRef.current({
            pathVars: requestParams?.pathVars,
            params: { ...serverSearch ? { [searchKey]: serverSearch } : {}, ...requestParams?.params }
          });
          const list = toList(response);
          if (callId !== callIdRef.current) return;
          list.forEach((item) => cacheRef.current.set(getByPath(item, valueKey), item));
          setItems(list);
          onResponse?.(list);
        } catch {
          if (callId === callIdRef.current) setItems([]);
        } finally {
          if (callId === callIdRef.current) setLoading(false);
        }
      },
      serverSearch ? debounceTime : 0
    );
    return () => clearTimeout(timer);
  }, [paramsKey, serverSearch, JSON.stringify(requiredParamKeys ?? {})]);
  const keyOf = (item) => item && typeof item === "object" ? getByPath(item, customValueKey ?? valueKey) : item;
  const selectValue = customValue ? Array.isArray(value) ? value.map(keyOf) : keyOf(value) : value;
  const options = useMemo(() => {
    const ignored = new Set(ignoreValueList ?? []);
    const fromItems = items.map(toOption).filter((option) => !ignored.has(option.value));
    const seen = new Set(fromItems.map((option) => option.value));
    const selectedKeys = (Array.isArray(selectValue) ? selectValue : selectValue !== void 0 ? [selectValue] : []).filter((key) => !seen.has(key) && cacheRef.current.has(key));
    const selectedOptions = selectedKeys.map((key) => toOption(cacheRef.current.get(key)));
    const extras = (extraOptions ?? []).filter((option) => !seen.has(option.value));
    return [...selectedOptions, ...fromItems, ...extras];
  }, [items, JSON.stringify(selectValue), extraOptions, ignoreValueList]);
  useEffect(() => {
    if (initValue && !initialized && options.length > 0) {
      setInitialized(true);
      onChange?.(initValue(options));
    }
  }, [options]);
  const handleChange = (next) => {
    if (searchMode === "server") setSearch("");
    if (!customValue || next === void 0 || next === null) {
      onChange?.(next);
      return;
    }
    const toCustom = (key) => {
      const item = cacheRef.current.get(key);
      return item ? customValue(item) : void 0;
    };
    onChange?.(Array.isArray(next) ? next.map(toCustom).filter(Boolean) : toCustom(next));
  };
  return /* @__PURE__ */ jsx(ReadOnlyProvider, { readOnly, component: "Select", children: /* @__PURE__ */ jsx(
    Select,
    {
      showSearch: true,
      allowClear,
      ...selectProps,
      value: selectValue,
      options,
      loading,
      disabled: readOnly || disabled,
      onChange: handleChange,
      onOpenChange: (open) => {
        if (!open && searchMode === "server") setSearch("");
        selectProps.onOpenChange?.(open);
      },
      ...searchMode === "server" ? { filterOption: false, onSearch: setSearch } : { filterOption: (input, option) => includesText(option?.label, input) },
      maxTagPlaceholder: (omitted) => /* @__PURE__ */ jsx(
        Tooltip,
        {
          title: /* @__PURE__ */ jsx(
            List,
            {
              size: "small",
              dataSource: omitted,
              renderItem: (item) => /* @__PURE__ */ jsx(List.Item, { style: { color: "inherit" }, children: item.label }),
              style: { maxHeight: 200, overflowY: "auto" }
            }
          ),
          children: /* @__PURE__ */ jsxs("span", { children: [
            "+",
            omitted.length,
            "..."
          ] })
        }
      )
    }
  ) });
};
export {
  PortalSelect,
  hasRequiredParams,
  toList
};
//# sourceMappingURL=PortalSelect.js.map

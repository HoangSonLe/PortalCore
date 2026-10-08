import { jsx } from "react/jsx-runtime";
import { Select } from "antd";
import { useMemo } from "react";
import { useT } from "../core/hooks.js";
import { includesText } from "../utils/string.js";
import { ReadOnlyProvider } from "./ReadOnly.js";
const PortalEnumSelect = ({
  data,
  prefixLocale,
  mapping,
  ignoreKeyList = [],
  hasAllOption = false,
  allOptionValue = -1,
  width = "100%",
  readOnly = false,
  disabled = false,
  allowClear = true,
  style,
  ...props
}) => {
  const t = useT();
  const options = useMemo(() => {
    const ignored = new Set(ignoreKeyList);
    const translate = (key) => {
      if (!prefixLocale) return String(key);
      const id = `${prefixLocale}.${key}`;
      const label = t(id);
      return label === id ? String(key) : label;
    };
    const list = mapping ? mapping.toOptions(t) : (Array.isArray(data) ? data : Object.values(data ?? {})).filter(
      (key) => Array.isArray(data) ? true : typeof key === "string" || !Object.prototype.hasOwnProperty.call(data, key)
    ).map((key) => ({ value: key, label: translate(key) }));
    const filtered = list.filter((option) => !ignored.has(option.value));
    return hasAllOption ? [{ value: allOptionValue, label: t("select.all") }, ...filtered] : filtered;
  }, [data, mapping, prefixLocale, t, hasAllOption, allOptionValue, ignoreKeyList.join("|")]);
  return /* @__PURE__ */ jsx(ReadOnlyProvider, { readOnly, component: "Select", children: /* @__PURE__ */ jsx(
    Select,
    {
      showSearch: true,
      allowClear,
      filterOption: (input, option) => includesText(option?.label, input),
      style: { width, ...style },
      ...props,
      options,
      disabled: readOnly || disabled
    }
  ) });
};
export {
  PortalEnumSelect
};
//# sourceMappingURL=PortalEnumSelect.js.map

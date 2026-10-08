import { jsx } from "react/jsx-runtime";
import { Tag } from "antd";
import { useT } from "../core/hooks.js";
const createMapping = (items) => {
  const byValue = new Map(items.map((item) => [item.value, item]));
  const translate = (t, label) => t ? t(label) : label;
  return {
    items,
    get: (value) => value === null || value === void 0 ? void 0 : byValue.get(value),
    toOptions: (t) => items.map((item) => ({ label: translate(t, item.label), value: item.value })),
    toValueEnum: (t) => Object.fromEntries(items.map((item) => [String(item.value), { text: translate(t, item.label) }]))
  };
};
const StatusTag = ({ mapping, value, fallback, ...tagProps }) => {
  const t = useT();
  const item = mapping.get(value);
  if (!item) return fallback ?? (value === null || value === void 0 ? null : /* @__PURE__ */ jsx(Tag, { ...tagProps, children: value }));
  return /* @__PURE__ */ jsx(Tag, { ...tagProps, color: item.color, children: t(item.label) });
};
export {
  StatusTag,
  createMapping
};
//# sourceMappingURL=StatusTag.js.map

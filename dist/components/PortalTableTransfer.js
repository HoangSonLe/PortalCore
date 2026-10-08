import { jsx, jsxs } from "react/jsx-runtime";
import { Transfer, InputNumber, Flex, Table, Form, Row, Col } from "antd";
import { useState, useMemo } from "react";
import { useT } from "../core/hooks.js";
import { getByPath } from "../utils/string.js";
const FilterForm = ({
  config,
  onChange
}) => {
  const [form] = Form.useForm();
  return /* @__PURE__ */ jsx(
    Form,
    {
      layout: "inline",
      ...config.formProps,
      form,
      onValuesChange: () => onChange(form.getFieldsValue()),
      style: { width: "100%", padding: "8px 0" },
      children: /* @__PURE__ */ jsx(Row, { style: { width: "100%" }, gutter: [8, 8], children: config.formItems.map(({ name, label, render }) => /* @__PURE__ */ jsx(Col, { span: 8, ...config.formItemSpan, children: /* @__PURE__ */ jsx(Form.Item, { name, label, style: { margin: 0 }, children: render() }) }, name)) })
    }
  );
};
const useSideFilters = (filter) => {
  const [params, setParams] = useState({ left: {}, right: {} });
  const apply = (direction, items) => filter ? items.filter((item) => filter[direction].onFilter(params[direction], item)) : items;
  const renderForm = (direction) => filter ? /* @__PURE__ */ jsx(
    FilterForm,
    {
      config: filter[direction],
      onChange: (values) => setParams((prev) => ({ ...prev, [direction]: values }))
    }
  ) : null;
  return { apply, renderForm };
};
const PortalTableTransfer = ({
  dataSource,
  leftColumns,
  rightColumns,
  filter,
  valueFormatter,
  value,
  onChange,
  rowKey,
  ...props
}) => {
  const { apply, renderForm } = useSideFilters(filter);
  const targetKeys = useMemo(
    () => (value ?? []).map((item) => valueFormatter ? getByPath(item, valueFormatter.rowKey ?? rowKey) : item),
    [value, valueFormatter, rowKey]
  );
  const handleChange = (nextKeys) => {
    if (!valueFormatter) {
      onChange?.(nextKeys);
      return;
    }
    onChange?.(
      nextKeys.map((key) => {
        const item = dataSource.find((row) => getByPath(row, rowKey) === key);
        return Object.fromEntries(
          valueFormatter.valueItems.map(({ dataIndex, name }) => [name ?? dataIndex, getByPath(item, dataIndex)])
        );
      })
    );
  };
  return /* @__PURE__ */ jsx(
    Transfer,
    {
      style: { width: "100%" },
      ...props,
      rowKey: (record) => getByPath(record, rowKey),
      dataSource,
      targetKeys,
      onChange: handleChange,
      showSelectAll: false,
      children: ({ direction, filteredItems, onItemSelect, onItemSelectAll, selectedKeys, disabled }) => {
        const rowSelection = {
          getCheckboxProps: () => ({ disabled }),
          onChange: (keys) => onItemSelectAll(keys, "replace"),
          selectedRowKeys: selectedKeys,
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
        };
        return /* @__PURE__ */ jsxs(Flex, { vertical: true, style: { width: "100%" }, children: [
          renderForm(direction),
          /* @__PURE__ */ jsx(
            Table,
            {
              rowKey: (record) => getByPath(record, rowKey),
              rowSelection,
              columns: direction === "left" ? leftColumns : rightColumns,
              dataSource: apply(direction, filteredItems),
              size: "small",
              pagination: false,
              scroll: { y: 320 },
              style: { pointerEvents: disabled ? "none" : void 0 },
              onRow: (record) => ({
                style: { cursor: "pointer" },
                onClick: () => {
                  if (disabled) return;
                  const key = getByPath(record, rowKey);
                  onItemSelect(key, !selectedKeys.includes(key));
                }
              })
            }
          )
        ] });
      }
    }
  );
};
const PortalTableCountTransfer = ({
  dataSource,
  leftColumns,
  rightColumns,
  filter,
  valueFormatter,
  value,
  onChange,
  rowKey,
  ...props
}) => {
  const t = useT();
  const { apply, renderForm } = useSideFilters(filter);
  const { count, valueItems } = valueFormatter;
  const valueKey = valueFormatter.valueKey ?? rowKey;
  const [pending, setPending] = useState({});
  const allocated = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    (value ?? []).forEach((item) => map.set(String(getByPath(item, valueKey)), Number(getByPath(item, count.name)) || 0));
    return map;
  }, [value, valueKey, count.name]);
  const rows = useMemo(() => {
    const left = dataSource.flatMap((item) => {
      const id = String(getByPath(item, rowKey));
      const available = (Number(getByPath(item, count.maxKey)) || 0) - (allocated.get(id) ?? 0);
      return available > 0 ? [{ ...item, _id: id, _max: available }] : [];
    });
    const right = [...allocated.entries()].map(([id, amount]) => {
      const item = dataSource.find((row) => String(getByPath(row, rowKey)) === id) ?? {};
      return { ...item, _id: `right-${id}`, _max: amount };
    });
    return [...left, ...right];
  }, [dataSource, allocated, rowKey, count.maxKey]);
  const targetKeys = rows.filter((row) => row._id.startsWith("right-")).map((row) => row._id);
  const selectedKeys = Object.keys(pending).filter((key) => pending[key] > 0);
  const toggle = (row) => setPending((prev) => ({ ...prev, [row._id]: prev[row._id] > 0 ? 0 : row._max }));
  const handleChange = (_next, direction, moveKeys) => {
    const next = new Map(allocated);
    moveKeys.forEach((key) => {
      const rowId = String(key);
      const id = rowId.replace(/^right-/, "");
      const amount = pending[rowId] ?? 0;
      const current = next.get(id) ?? 0;
      const updated = direction === "right" ? current + amount : current - amount;
      if (updated > 0) next.set(id, updated);
      else next.delete(id);
    });
    const existing = new Map((value ?? []).map((item) => [String(getByPath(item, valueKey)), item]));
    onChange?.(
      [...next.entries()].map(([id, amount]) => {
        const base = existing.get(id) ?? (() => {
          const item = dataSource.find((row) => String(getByPath(row, rowKey)) === id);
          return {
            [valueKey]: getByPath(item, rowKey),
            ...Object.fromEntries(
              valueItems.map(({ dataIndex, name }) => [name ?? dataIndex, getByPath(item, dataIndex)])
            )
          };
        })();
        return { ...base, [count.name]: amount };
      })
    );
    setPending({});
  };
  return /* @__PURE__ */ jsx(
    Transfer,
    {
      style: { width: "100%" },
      ...props,
      rowKey: (record) => record._id,
      dataSource: rows,
      targetKeys,
      selectedKeys,
      onChange: handleChange,
      showSelectAll: false,
      children: ({ direction, filteredItems, disabled }) => {
        const sideRows = apply(direction, filteredItems);
        const columns = [
          ...direction === "left" ? leftColumns : rightColumns,
          {
            title: count.title ?? t("transfer.quantity"),
            dataIndex: "_max",
            width: 130,
            render: (max, row) => /* @__PURE__ */ jsx("div", { onClick: (event) => event.stopPropagation(), children: /* @__PURE__ */ jsx(
              InputNumber,
              {
                size: "small",
                style: { width: "100%" },
                min: 0,
                max,
                value: pending[row._id] ?? 0,
                formatter: (val) => `${val ?? 0}/${max}`,
                parser: (val) => Number(String(val ?? "").split("/")[0]) || 0,
                onChange: (val) => setPending((prev) => ({ ...prev, [row._id]: Number(val) || 0 }))
              }
            ) })
          }
        ];
        return /* @__PURE__ */ jsxs(Flex, { vertical: true, style: { width: "100%" }, children: [
          renderForm(direction),
          /* @__PURE__ */ jsx(
            Table,
            {
              rowKey: "_id",
              columns,
              dataSource: sideRows,
              size: "small",
              pagination: false,
              scroll: { y: 320 },
              style: { pointerEvents: disabled ? "none" : void 0 },
              rowSelection: {
                selectedRowKeys: selectedKeys,
                getCheckboxProps: (row) => ({ disabled: disabled || row._max === 0 }),
                onSelect: toggle,
                onSelectAll: (selected) => setPending((prev) => ({
                  ...prev,
                  ...Object.fromEntries(sideRows.map((row) => [row._id, selected ? row._max : 0]))
                }))
              },
              onRow: (row) => ({ style: { cursor: "pointer" }, onClick: () => !disabled && toggle(row) })
            }
          )
        ] });
      }
    }
  );
};
export {
  PortalTableCountTransfer,
  PortalTableTransfer
};
//# sourceMappingURL=PortalTableTransfer.js.map

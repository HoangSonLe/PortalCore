import { jsx } from "react/jsx-runtime";
import { ProTable } from "@ant-design/pro-components";
import { useMemo } from "react";
import { useLocation } from "react-router";
import { usePortal } from "../core/context.js";
import { useT } from "../core/hooks.js";
import { PortalTableActionButton } from "./PortalTableActionButton.js";
const PortalTable = ({
  columns,
  indexColumn = true,
  actionColumn,
  searchFormItems,
  request,
  search,
  form,
  pagination,
  options,
  scroll,
  persistColumns = true,
  columnsState,
  ...props
}) => {
  const t = useT();
  const { pathname } = useLocation();
  const { storageKey } = usePortal();
  const persistenceKey = persistColumns === false ? void 0 : `${storageKey}:table:${typeof persistColumns === "string" ? persistColumns : pathname}`;
  const finalColumns = useMemo(() => {
    const indexColumns = indexColumn === false ? [] : [
      {
        title: t("table.index"),
        dataIndex: "__index",
        width: 56,
        align: "center",
        search: false,
        render: (_dom, _entity, index, action) => index + 1 + ((action?.pageInfo?.current ?? 1) - 1) * (action?.pageInfo?.pageSize ?? 0),
        ...typeof indexColumn === "object" ? indexColumn : {}
      }
    ];
    const searchColumns = (searchFormItems ?? []).map(
      ({ formItemProps, renderFormItem, hideInForm }) => ({
        formItemProps,
        renderFormItem,
        hideInForm,
        hideInTable: true,
        hideInSetting: true
      })
    );
    const actionColumns = actionColumn ? [
      {
        title: t("action.actions"),
        valueType: "option",
        width: 120,
        fixed: "right",
        render: (_dom, entity, index, action) => /* @__PURE__ */ jsx(PortalTableActionButton, { buttons: actionColumn.renderButtons?.(entity, index, action) }),
        ...actionColumn
      }
    ] : [];
    const dataColumns = (columns ?? []).map(
      (column) => ({ search: false, ...column })
    );
    return [...indexColumns, ...dataColumns, ...searchColumns, ...actionColumns];
  }, [columns, indexColumn, actionColumn, searchFormItems, t]);
  return /* @__PURE__ */ jsx(
    ProTable,
    {
      rowKey: "id",
      cardBordered: true,
      columns: finalColumns,
      search: search === false ? false : { labelWidth: "auto", defaultCollapsed: false, ...search },
      form: { resetText: t("button.reset"), searchText: t("button.search"), ...form },
      options: options ?? { fullScreen: true, reload: true, setting: true, density: false },
      pagination: pagination === false ? false : { showSizeChanger: true, defaultPageSize: 50, pageSizeOptions: [10, 20, 50, 100, 200], ...pagination },
      scroll: { x: "max-content", ...scroll },
      dateFormatter: "string",
      columnsState: columnsState ?? (persistenceKey ? { persistenceKey, persistenceType: "localStorage" } : void 0),
      request: request ? async (...args) => {
        try {
          return await request(...args);
        } catch {
          return { data: [], total: 0, success: false };
        }
      } : void 0,
      ...props
    }
  );
};
export {
  PortalTable
};
//# sourceMappingURL=PortalTable.js.map

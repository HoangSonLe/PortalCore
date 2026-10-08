import { jsx, jsxs } from "react/jsx-runtime";
import { InboxOutlined } from "@ant-design/icons";
import { Upload, Typography, Flex } from "antd";
import { useState } from "react";
import { useT } from "../core/hooks.js";
import { PortalButton } from "./PortalButton.js";
import { PortalDownloadButton } from "./PortalDownloadButton.js";
import { PortalTable } from "./PortalTable.js";
const ACCEPT = ".xls,.xlsx,.csv";
const PortalSheetUpload = ({
  onChange,
  xlsx,
  columnFieldItems,
  tableProps = {},
  headerRows = 1,
  templateUrl,
  templateFilename,
  containerClassName
}) => {
  const t = useT();
  const [rows, setRows] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [reading, setReading] = useState(false);
  const emit = (keys, source = rows) => {
    setSelectedKeys(keys);
    onChange?.(
      source.filter((row) => keys.includes(row.__row)).map(
        (row) => Object.fromEntries(
          columnFieldItems.filter((field) => field.name).map((field) => [field.name, row[field.dataIndex]])
        )
      )
    );
  };
  const readFile = async (file) => {
    setReading(true);
    try {
      const workbook = xlsx.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet, {
        header: columnFieldItems.map((field) => field.dataIndex),
        range: headerRows,
        defval: ""
      }).map((row, index) => ({ ...row, __row: index + 1 }));
      setRows(data);
      emit(
        data.map((row) => row.__row),
        data
      );
    } finally {
      setReading(false);
    }
    return false;
  };
  const clear = () => {
    setRows([]);
    setSelectedKeys([]);
    onChange?.(void 0);
  };
  if (rows.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: containerClassName, children: /* @__PURE__ */ jsxs(
      Upload.Dragger,
      {
        accept: ACCEPT,
        multiple: false,
        showUploadList: false,
        beforeUpload: readFile,
        disabled: reading,
        children: [
          /* @__PURE__ */ jsx("p", { className: "ant-upload-drag-icon", children: /* @__PURE__ */ jsx(InboxOutlined, {}) }),
          /* @__PURE__ */ jsxs("p", { className: "ant-upload-text", children: [
            t("sheet.drop"),
            " ",
            /* @__PURE__ */ jsx(Typography.Link, { children: t("sheet.choose") })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "ant-upload-hint", children: t("sheet.hint") }),
          templateUrl && /* @__PURE__ */ jsx("div", { style: { marginTop: 12 }, onClick: (event) => event.stopPropagation(), children: /* @__PURE__ */ jsx(
            PortalDownloadButton,
            {
              url: templateUrl,
              filename: templateFilename,
              buttonProps: { type: "default", children: t("sheet.template") }
            }
          ) })
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsx("div", { className: containerClassName, children: /* @__PURE__ */ jsx(
    PortalTable,
    {
      rowKey: "__row",
      dataSource: rows,
      loading: reading,
      search: false,
      options: false,
      pagination: false,
      tableAlertRender: false,
      columnEmptyText: "",
      headerTitle: /* @__PURE__ */ jsx(Typography.Text, { type: "secondary", children: t("sheet.selected", { count: selectedKeys.length, total: rows.length }) }),
      rowSelection: { selectedRowKeys: selectedKeys, onChange: (keys) => emit(keys) },
      toolBarRender: () => [
        /* @__PURE__ */ jsxs(Flex, { gap: 8, children: [
          /* @__PURE__ */ jsx(Upload, { accept: ACCEPT, multiple: false, showUploadList: false, beforeUpload: readFile, children: /* @__PURE__ */ jsx(PortalButton, { actionType: "upload", children: t("sheet.reupload") }) }),
          /* @__PURE__ */ jsx(PortalButton, { actionType: "cancel", danger: true, onClick: clear, children: t("sheet.clear") })
        ] }, "actions")
      ],
      ...tableProps
    }
  ) });
};
export {
  PortalSheetUpload
};
//# sourceMappingURL=PortalSheetUpload.js.map

import { jsx, jsxs } from "react/jsx-runtime";
import { DownOutlined } from "@ant-design/icons";
import { App, Dropdown, Space } from "antd";
import { useT } from "../core/hooks.js";
import { PortalButton } from "./PortalButton.js";
const PortalTableActionButton = ({ buttons = [] }) => /* @__PURE__ */ jsx(Space, { size: 4, wrap: true, children: buttons.map((props, index) => /* @__PURE__ */ jsx(
  PortalButton,
  {
    hiddenChildren: true,
    size: "small",
    color: props.danger || props.actionType === "delete" ? "danger" : "default",
    variant: "filled",
    ...props
  },
  index
)) });
const MoreButtonGroup = ({ buttons, label }) => {
  const t = useT();
  const { modal } = App.useApp();
  const items = buttons.filter((item) => !item.hidden).map((item, index) => ({
    key: index,
    label: item.children,
    icon: item.icon,
    danger: item.danger,
    onClick: ({ domEvent }) => {
      if (item.popConfirm) {
        modal.confirm({
          title: item.popConfirm.title,
          content: item.popConfirm.description,
          okButtonProps: { danger: item.danger },
          onOk: () => (item.popConfirm?.onConfirm ?? item.onClick)?.(domEvent)
        });
      } else {
        item.onClick?.(domEvent);
      }
    }
  }));
  return /* @__PURE__ */ jsx(Dropdown, { menu: { items }, trigger: ["click"], children: /* @__PURE__ */ jsx(PortalButton, { children: /* @__PURE__ */ jsxs(Space, { size: 6, children: [
    label ?? t("button.more"),
    /* @__PURE__ */ jsx(DownOutlined, { style: { fontSize: 10 } })
  ] }) }) });
};
export {
  MoreButtonGroup,
  PortalTableActionButton
};
//# sourceMappingURL=PortalTableActionButton.js.map

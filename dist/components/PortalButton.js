import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { ArrowLeftOutlined, PrinterFilled, PrinterOutlined, SettingFilled, SettingOutlined, HistoryOutlined, BookFilled, BookOutlined, EnvironmentFilled, EnvironmentOutlined, SnippetsFilled, SnippetsOutlined, CopyFilled, CopyOutlined, SelectOutlined, FlagFilled, FlagOutlined, CheckCircleFilled, CheckCircleOutlined, PlayCircleFilled, PlayCircleOutlined, ShareAltOutlined, NotificationFilled, NotificationOutlined, BellFilled, BellOutlined, ForwardFilled, ForwardOutlined, RollbackOutlined, MessageFilled, MessageOutlined, UsergroupAddOutlined, UserAddOutlined, StopOutlined, SwapOutlined, ToolFilled, ToolOutlined, InboxOutlined, AuditOutlined, SendOutlined, CloseSquareFilled, CloseSquareOutlined, CheckSquareFilled, CheckSquareOutlined, UnlockFilled, UnlockOutlined, LockFilled, LockOutlined, DownloadOutlined, UploadOutlined, ExportOutlined, ImportOutlined, SyncOutlined, SearchOutlined, CheckOutlined, CloseCircleFilled, CloseCircleOutlined, CloseOutlined, FileTextFilled, FileTextOutlined, SaveFilled, SaveOutlined, DeleteFilled, DeleteOutlined, EditFilled, EditOutlined, EyeFilled, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Tooltip } from "antd";
import { useState } from "react";
import { useT, usePermission } from "../core/hooks.js";
const actionTypeList = {
  add: { label: "button.add", icon: PlusOutlined },
  view: { label: "button.view", icon: EyeOutlined, filledIcon: EyeFilled },
  edit: { label: "button.edit", icon: EditOutlined, filledIcon: EditFilled },
  delete: { label: "button.delete", icon: DeleteOutlined, filledIcon: DeleteFilled },
  save: { label: "button.save", icon: SaveOutlined, filledIcon: SaveFilled },
  "save-draft": { label: "button.save-draft", icon: FileTextOutlined, filledIcon: FileTextFilled },
  cancel: { label: "button.cancel", icon: CloseOutlined },
  close: { label: "button.close", icon: CloseCircleOutlined, filledIcon: CloseCircleFilled },
  ok: { label: "button.ok", icon: CheckOutlined },
  search: { label: "button.search", icon: SearchOutlined },
  sync: { label: "button.sync", icon: SyncOutlined },
  import: { label: "button.import", icon: ImportOutlined },
  export: { label: "button.export", icon: ExportOutlined },
  upload: { label: "button.upload", icon: UploadOutlined },
  download: { label: "button.download", icon: DownloadOutlined },
  lock: { label: "button.lock", icon: LockOutlined, filledIcon: LockFilled },
  unlock: { label: "button.unlock", icon: UnlockOutlined, filledIcon: UnlockFilled },
  approve: { label: "button.approve", icon: CheckSquareOutlined, filledIcon: CheckSquareFilled },
  reject: { label: "button.reject", icon: CloseSquareOutlined, filledIcon: CloseSquareFilled },
  submit: { label: "button.submit", icon: SendOutlined },
  accept: { label: "button.accept", icon: AuditOutlined },
  receive: { label: "button.receive", icon: InboxOutlined },
  process: { label: "button.process", icon: ToolOutlined, filledIcon: ToolFilled },
  "transfer-process": { label: "button.transfer-process", icon: SwapOutlined },
  "cancel-process": { label: "button.cancel-process", icon: StopOutlined },
  assign: { label: "button.assign", icon: UserAddOutlined },
  mobilize: { label: "button.mobilize", icon: UsergroupAddOutlined },
  respond: { label: "button.respond", icon: MessageOutlined, filledIcon: MessageFilled },
  reply: { label: "button.reply", icon: RollbackOutlined },
  forward: { label: "button.forward", icon: ForwardOutlined, filledIcon: ForwardFilled },
  notify: { label: "button.notify", icon: BellOutlined, filledIcon: BellFilled },
  publish: { label: "button.publish", icon: NotificationOutlined, filledIcon: NotificationFilled },
  share: { label: "button.share", icon: ShareAltOutlined },
  start: { label: "button.start", icon: PlayCircleOutlined, filledIcon: PlayCircleFilled },
  complete: { label: "button.complete", icon: CheckCircleOutlined, filledIcon: CheckCircleFilled },
  finish: { label: "button.finish", icon: FlagOutlined, filledIcon: FlagFilled },
  select: { label: "button.select", icon: SelectOutlined },
  copy: { label: "button.copy", icon: CopyOutlined, filledIcon: CopyFilled },
  paste: { label: "button.paste", icon: SnippetsOutlined, filledIcon: SnippetsFilled },
  location: { label: "button.location", icon: EnvironmentOutlined, filledIcon: EnvironmentFilled },
  diary: { label: "button.diary", icon: BookOutlined, filledIcon: BookFilled },
  history: { label: "button.history", icon: HistoryOutlined },
  setting: { label: "button.setting", icon: SettingOutlined, filledIcon: SettingFilled },
  print: { label: "button.print", icon: PrinterOutlined, filledIcon: PrinterFilled },
  return: { label: "button.return", icon: ArrowLeftOutlined }
};
const PortalButton = ({
  permissionCode,
  actionType,
  hiddenChildren = false,
  popConfirm,
  tooltipProps,
  extraElement,
  hidden,
  loading,
  icon,
  filledIcon,
  children,
  danger,
  onClick,
  htmlType,
  onMouseEnter,
  onMouseLeave,
  ...buttonProps
}) => {
  const t = useT();
  const can = usePermission();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  if (hidden || !can(permissionCode)) return null;
  const preset = actionType ? actionTypeList[actionType] : void 0;
  const PresetIcon = preset?.icon;
  const PresetFilledIcon = preset?.filledIcon;
  const normalIcon = icon ?? (PresetIcon ? /* @__PURE__ */ jsx(PresetIcon, {}) : void 0);
  const hoverIcon = filledIcon ?? (icon ? void 0 : PresetFilledIcon ? /* @__PURE__ */ jsx(PresetFilledIcon, {}) : void 0);
  const showFilled = (hovered || confirmOpen) && !buttonProps.disabled && !!hoverIcon;
  const label = children ?? (preset ? t(preset.label) : void 0);
  const run = async (event) => {
    setConfirmOpen(false);
    const result = popConfirm?.onConfirm ? popConfirm.onConfirm(event) : onClick?.(event);
    if (result instanceof Promise) {
      setIsLoading(true);
      try {
        await result;
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
  };
  const isSubmit = htmlType === "submit" || htmlType === "reset";
  let node = /* @__PURE__ */ jsx(
    Button,
    {
      ...buttonProps,
      htmlType,
      danger: danger ?? actionType === "delete",
      loading: isLoading || loading,
      icon: showFilled ? hoverIcon : normalIcon,
      onMouseEnter: (event) => {
        setHovered(true);
        onMouseEnter?.(event);
      },
      onMouseLeave: (event) => {
        setHovered(false);
        onMouseLeave?.(event);
      },
      "aria-label": typeof label === "string" ? label : buttonProps["aria-label"],
      onClick: popConfirm ? () => setConfirmOpen(true) : isSubmit ? onClick : run,
      children: hiddenChildren ? void 0 : label
    }
  );
  if (popConfirm) {
    node = /* @__PURE__ */ jsx(
      Popconfirm,
      {
        okText: t("action.ok"),
        cancelText: t("action.cancel"),
        okButtonProps: { danger: danger ?? actionType === "delete" },
        ...popConfirm,
        open: confirmOpen,
        onOpenChange: setConfirmOpen,
        onConfirm: (event) => run(event),
        children: node
      }
    );
  }
  const tooltip = hiddenChildren ? { title: label, ...typeof hiddenChildren === "object" ? hiddenChildren.tooltipProps : void 0 } : tooltipProps;
  if (tooltip) node = /* @__PURE__ */ jsx(Tooltip, { ...tooltip, children: node });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    node,
    extraElement
  ] });
};
export {
  PortalButton,
  actionTypeList
};
//# sourceMappingURL=PortalButton.js.map

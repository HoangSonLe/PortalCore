import type { PermissionRequirement } from '../permission/permission';
import type { ButtonProps, PopconfirmProps, TooltipProps } from 'antd';
import type { ComponentType, MouseEvent, ReactNode } from 'react';

import {
  ArrowLeftOutlined,
  AuditOutlined,
  BellFilled,
  BellOutlined,
  BookFilled,
  BookOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CheckOutlined,
  CheckSquareFilled,
  CheckSquareOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  CloseOutlined,
  CloseSquareFilled,
  CloseSquareOutlined,
  CopyFilled,
  CopyOutlined,
  DeleteFilled,
  DeleteOutlined,
  DownloadOutlined,
  EditFilled,
  EditOutlined,
  EnvironmentFilled,
  EnvironmentOutlined,
  ExportOutlined,
  EyeFilled,
  EyeOutlined,
  FileTextFilled,
  FileTextOutlined,
  FlagFilled,
  FlagOutlined,
  ForwardFilled,
  ForwardOutlined,
  HistoryOutlined,
  ImportOutlined,
  InboxOutlined,
  LockFilled,
  LockOutlined,
  MessageFilled,
  MessageOutlined,
  NotificationFilled,
  NotificationOutlined,
  PlayCircleFilled,
  PlayCircleOutlined,
  PlusOutlined,
  PrinterFilled,
  PrinterOutlined,
  RollbackOutlined,
  SaveFilled,
  SaveOutlined,
  SearchOutlined,
  SelectOutlined,
  SendOutlined,
  SettingFilled,
  SettingOutlined,
  ShareAltOutlined,
  SnippetsFilled,
  SnippetsOutlined,
  StopOutlined,
  SwapOutlined,
  SyncOutlined,
  ToolFilled,
  ToolOutlined,
  UnlockFilled,
  UnlockOutlined,
  UploadOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Tooltip } from 'antd';
import { useState } from 'react';

import { usePermission, useT } from '../core/hooks';

type ActionPreset = { label: string; icon: ComponentType; filledIcon?: ComponentType };

/**
 * Nút dựng sẵn: chỉ cần `actionType="add"` là có nhãn + icon (cùng danh sách với PortalButton bên Kit cũ).
 * `filledIcon`: icon dạng đặc hiện khi rê chuột (chỉ những icon antd có cặp Outlined/Filled).
 */
export const actionTypeList = {
  add: { label: 'button.add', icon: PlusOutlined },
  view: { label: 'button.view', icon: EyeOutlined, filledIcon: EyeFilled },
  edit: { label: 'button.edit', icon: EditOutlined, filledIcon: EditFilled },
  delete: { label: 'button.delete', icon: DeleteOutlined, filledIcon: DeleteFilled },
  save: { label: 'button.save', icon: SaveOutlined, filledIcon: SaveFilled },
  'save-draft': { label: 'button.save-draft', icon: FileTextOutlined, filledIcon: FileTextFilled },
  cancel: { label: 'button.cancel', icon: CloseOutlined },
  close: { label: 'button.close', icon: CloseCircleOutlined, filledIcon: CloseCircleFilled },
  ok: { label: 'button.ok', icon: CheckOutlined },
  search: { label: 'button.search', icon: SearchOutlined },
  sync: { label: 'button.sync', icon: SyncOutlined },
  import: { label: 'button.import', icon: ImportOutlined },
  export: { label: 'button.export', icon: ExportOutlined },
  upload: { label: 'button.upload', icon: UploadOutlined },
  download: { label: 'button.download', icon: DownloadOutlined },
  lock: { label: 'button.lock', icon: LockOutlined, filledIcon: LockFilled },
  unlock: { label: 'button.unlock', icon: UnlockOutlined, filledIcon: UnlockFilled },
  approve: { label: 'button.approve', icon: CheckSquareOutlined, filledIcon: CheckSquareFilled },
  reject: { label: 'button.reject', icon: CloseSquareOutlined, filledIcon: CloseSquareFilled },
  submit: { label: 'button.submit', icon: SendOutlined },
  accept: { label: 'button.accept', icon: AuditOutlined },
  receive: { label: 'button.receive', icon: InboxOutlined },
  process: { label: 'button.process', icon: ToolOutlined, filledIcon: ToolFilled },
  'transfer-process': { label: 'button.transfer-process', icon: SwapOutlined },
  'cancel-process': { label: 'button.cancel-process', icon: StopOutlined },
  assign: { label: 'button.assign', icon: UserAddOutlined },
  mobilize: { label: 'button.mobilize', icon: UsergroupAddOutlined },
  respond: { label: 'button.respond', icon: MessageOutlined, filledIcon: MessageFilled },
  reply: { label: 'button.reply', icon: RollbackOutlined },
  forward: { label: 'button.forward', icon: ForwardOutlined, filledIcon: ForwardFilled },
  notify: { label: 'button.notify', icon: BellOutlined, filledIcon: BellFilled },
  publish: { label: 'button.publish', icon: NotificationOutlined, filledIcon: NotificationFilled },
  share: { label: 'button.share', icon: ShareAltOutlined },
  start: { label: 'button.start', icon: PlayCircleOutlined, filledIcon: PlayCircleFilled },
  complete: { label: 'button.complete', icon: CheckCircleOutlined, filledIcon: CheckCircleFilled },
  finish: { label: 'button.finish', icon: FlagOutlined, filledIcon: FlagFilled },
  select: { label: 'button.select', icon: SelectOutlined },
  copy: { label: 'button.copy', icon: CopyOutlined, filledIcon: CopyFilled },
  paste: { label: 'button.paste', icon: SnippetsOutlined, filledIcon: SnippetsFilled },
  location: { label: 'button.location', icon: EnvironmentOutlined, filledIcon: EnvironmentFilled },
  diary: { label: 'button.diary', icon: BookOutlined, filledIcon: BookFilled },
  history: { label: 'button.history', icon: HistoryOutlined },
  setting: { label: 'button.setting', icon: SettingOutlined, filledIcon: SettingFilled },
  print: { label: 'button.print', icon: PrinterOutlined, filledIcon: PrinterFilled },
  return: { label: 'button.return', icon: ArrowLeftOutlined },
} satisfies Record<string, ActionPreset>;

export type ActionType = keyof typeof actionTypeList;

export interface PortalButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Ẩn nút nếu user không có quyền. */
  permissionCode?: PermissionRequirement;
  /** Nút dựng sẵn (nhãn + icon). `children`/`icon` truyền vào sẽ đè lên. */
  actionType?: ActionType;
  /** Chỉ hiện icon, nhãn chuyển thành tooltip. */
  hiddenChildren?: boolean | { tooltipProps?: TooltipProps };
  /** Hỏi xác nhận trước khi chạy `onClick` (hoặc `popConfirm.onConfirm`). */
  popConfirm?: PopconfirmProps;
  tooltipProps?: TooltipProps;
  /** Render thêm ngay sau nút (khi nút được hiện). */
  extraElement?: ReactNode;
  /** Icon hiện khi rê chuột (giống Kit). `actionType` đã có sẵn bản đặc cho những icon hỗ trợ. */
  filledIcon?: ReactNode;
  /** Trả về Promise thì nút tự loading tới khi xong. */
  onClick?: (event: MouseEvent<HTMLElement>) => unknown;
}

export const PortalButton = ({
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
}: PortalButtonProps) => {
  const t = useT();
  const can = usePermission();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (hidden || !can(permissionCode)) return null;

  const preset: ActionPreset | undefined = actionType ? actionTypeList[actionType] : undefined;
  const PresetIcon = preset?.icon;
  const PresetFilledIcon = preset?.filledIcon;
  const normalIcon = icon ?? (PresetIcon ? <PresetIcon /> : undefined);
  const hoverIcon = filledIcon ?? (icon ? undefined : PresetFilledIcon ? <PresetFilledIcon /> : undefined);
  // Đang mở hộp xác nhận thì giữ icon đặc.
  const showFilled = (hovered || confirmOpen) && !buttonProps.disabled && !!hoverIcon;
  const label = children ?? (preset ? t(preset.label) : undefined);

  const run = async (event: MouseEvent<HTMLElement>) => {
    setConfirmOpen(false);

    const result = popConfirm?.onConfirm ? popConfirm.onConfirm(event) : onClick?.(event);

    if (result instanceof Promise) {
      setIsLoading(true);

      try {
        await result;
      } catch {
        // Lỗi API đã được HttpClient thông báo.
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isSubmit = htmlType === 'submit' || htmlType === 'reset';

  let node: ReactNode = (
    <Button
      {...buttonProps}
      htmlType={htmlType}
      danger={danger ?? actionType === 'delete'}
      loading={isLoading || loading}
      icon={showFilled ? hoverIcon : normalIcon}
      onMouseEnter={event => {
        setHovered(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={event => {
        setHovered(false);
        onMouseLeave?.(event);
      }}
      aria-label={typeof label === 'string' ? label : buttonProps['aria-label']}
      onClick={popConfirm ? () => setConfirmOpen(true) : isSubmit ? (onClick as ButtonProps['onClick']) : run}
    >
      {hiddenChildren ? undefined : label}
    </Button>
  );

  if (popConfirm) {
    node = (
      <Popconfirm
        okText={t('action.ok')}
        cancelText={t('action.cancel')}
        okButtonProps={{ danger: danger ?? actionType === 'delete' }}
        {...popConfirm}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={event => run(event as MouseEvent<HTMLElement>)}
      >
        {node}
      </Popconfirm>
    );
  }

  const tooltip = hiddenChildren
    ? { title: label, ...(typeof hiddenChildren === 'object' ? hiddenChildren.tooltipProps : undefined) }
    : tooltipProps;

  if (tooltip) node = <Tooltip {...tooltip}>{node}</Tooltip>;

  return (
    <>
      {node}
      {extraElement}
    </>
  );
};

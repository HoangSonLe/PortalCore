import type { PortalButtonProps } from './PortalButton';
import type { MenuProps } from 'antd';

import { DownOutlined } from '@ant-design/icons';
import { App, Dropdown, Space } from 'antd';

import { useT } from '../core/hooks';
import { PortalButton } from './PortalButton';

export interface PortalTableActionButtonProps {
  buttons?: PortalButtonProps[];
}

/** Nhóm nút icon trong cột thao tác của bảng (nhãn hiện ở tooltip). */
export const PortalTableActionButton = ({ buttons = [] }: PortalTableActionButtonProps) => (
  <Space size={4} wrap>
    {buttons.map((props, index) => (
      <PortalButton
        key={index}
        hiddenChildren
        size="small"
        color={props.danger || props.actionType === 'delete' ? 'danger' : 'default'}
        variant="filled"
        {...props}
      />
    ))}
  </Space>
);

export interface MoreButtonGroupProps {
  buttons: PortalButtonProps[];
  /** Nhãn nút. Mặc định "Thêm". */
  label?: string;
}

/** Nút "Thêm ▾" gom các thao tác phụ vào dropdown. Nút có `popConfirm` sẽ hỏi lại bằng modal. */
export const MoreButtonGroup = ({ buttons, label }: MoreButtonGroupProps) => {
  const t = useT();
  const { modal } = App.useApp();

  const items: MenuProps['items'] = buttons
    .filter(item => !item.hidden)
    .map((item, index) => ({
      key: index,
      label: item.children,
      icon: item.icon,
      danger: item.danger,
      onClick: ({ domEvent }) => {
        if (item.popConfirm) {
          modal.confirm({
            title: item.popConfirm.title as React.ReactNode,
            content: item.popConfirm.description as React.ReactNode,
            okButtonProps: { danger: item.danger },
            onOk: () => (item.popConfirm?.onConfirm ?? item.onClick)?.(domEvent as never),
          });
        } else {
          item.onClick?.(domEvent as never);
        }
      },
    }));

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <PortalButton>
        <Space size={6}>
          {label ?? t('button.more')}
          <DownOutlined style={{ fontSize: 10 }} />
        </Space>
      </PortalButton>
    </Dropdown>
  );
};

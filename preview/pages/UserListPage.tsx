import type { UserInput } from '../api';
import type { User } from '../mock/backend';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

import { ModalForm, ProFormRadio, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import {
  MoreButtonGroup,
  PageContainer,
  PortalButton,
  PortalDownloadButton,
  PortalInput,
  PortalSelect,
  PortalTable,
  StatusTag,
  useDisclosure,
  useT,
} from '@hoangsonle/portal-core';
import { App, Typography } from 'antd';
import dayjs from 'dayjs';
import { useRef } from 'react';
import { Link, useNavigate } from 'react-router';

import { roleApi, userApi } from '../api';
import { userRole, userStatus } from '../mappings';

const UserFormModal = ({
  open,
  user,
  onClose,
  onSaved,
}: {
  open: boolean;
  user?: User;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const t = useT();

  return (
    <ModalForm<UserInput>
      key={user?.id ?? 'new'}
      title={user ? `Sửa: ${user.name}` : 'Thêm người dùng'}
      open={open}
      width={520}
      initialValues={user ?? { role: 'VIEWER', status: 'PENDING' }}
      modalProps={{ destroyOnHidden: true, onCancel: onClose }}
      onFinish={async values => {
        try {
          if (user) await userApi.update(user.id, values);
          else await userApi.create(values);
        } catch {
          return false; // giữ modal mở, lỗi đã được toast
        }

        onSaved();
        onClose();

        return true;
      }}
    >
      <ProFormText name="name" label="Họ tên" rules={[{ required: true }]} />
      <ProFormText name="username" label="Tên đăng nhập" rules={[{ required: true }]} disabled={!!user} />
      <ProFormText name="email" label="Email" rules={[{ required: true, type: 'email' }]} />
      <ProFormSelect
        name="role"
        label="Vai trò"
        request={async () => (await roleApi.list()).map(role => ({ label: role.name, value: role.id }))}
        rules={[{ required: true }]}
      />
      <ProFormRadio.Group name="status" label="Trạng thái" radioType="button" options={userStatus.toOptions(t)} />
    </ModalForm>
  );
};

const UserListPage = () => {
  const t = useT();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(undefined);
  const editor = useDisclosure<User>();

  const columns: ProColumns<User>[] = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      sorter: true,
      render: (_, record) => <Link to={`/system/users/${record.id}`}>{record.name}</Link>,
    },
    { title: 'Tài khoản', dataIndex: 'username' },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (_, record) => <Typography.Text copyable>{record.email}</Typography.Text>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (_, record) => <StatusTag mapping={userRole} value={record.role} />,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      search: true,
      valueEnum: userStatus.toValueEnum(t),
      render: (_, record) => <StatusTag mapping={userStatus} value={record.status} />,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      sorter: true,
      render: (_, record) => dayjs(record.createdAt).format('DD/MM/YYYY'),
    },
  ];

  return (
    <PageContainer
      extra={
        <>
          <PortalDownloadButton url="/reports/users" buttonProps={{ type: 'default', actionType: 'export' }} />
          <MoreButtonGroup
            buttons={[
              { children: 'Nhập từ Excel', onClick: () => navigate('/components?tab=file') },
              { children: 'Đồng bộ', onClick: () => message.info('Đồng bộ (tự làm)') },
            ]}
          />
          <PortalButton type="primary" actionType="add" permissionCode="user.create" onClick={() => editor.show()} />
        </>
      }
    >
      <PortalTable<User>
        actionRef={actionRef}
        columns={columns}
        request={userApi.list}
        pagination={{ defaultPageSize: 10 }}
        searchFormItems={[
          {
            formItemProps: { name: 'keyword', label: 'Từ khoá' },
            renderFormItem: () => <PortalInput placeholder="Tên, email, tài khoản" allowClear />,
          },
          {
            formItemProps: { name: 'role', label: 'Vai trò' },
            renderFormItem: () => (
              <PortalSelect
                placeholder="Tất cả"
                request={roleApi.list}
                labelKey="name"
                valueKey="id"
                searchMode="local"
              />
            ),
          },
        ]}
        actionColumn={{
          renderButtons: record => [
            { actionType: 'view', onClick: () => navigate(`/system/users/${record.id}`) },
            { actionType: 'edit', permissionCode: 'user.update', onClick: () => editor.show(record) },
            {
              actionType: 'delete',
              permissionCode: 'user.delete',
              popConfirm: { title: 'Xoá người dùng này?' },
              onClick: async () => {
                await userApi.remove(record.id);
                actionRef.current?.reload();
              },
            },
          ],
        }}
      />
      <UserFormModal open={editor.open} user={editor.data} onClose={editor.hide} onSaved={() => actionRef.current?.reload()} />
    </PageContainer>
  );
};

export default UserListPage;

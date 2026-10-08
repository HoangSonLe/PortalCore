import type { UserInput } from '../api';
import type { User } from '../mock/backend';
import type { ProColumns } from '@ant-design/pro-components';

import { ProFormRadio, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import {
  MoreButtonGroup,
  PageContainer,
  PortalButton,
  PortalDownloadButton,
  PortalInput,
  PortalModalForm,
  PortalSelect,
  PortalTable,
  StatusTag,
  useCrudPage,
  useT,
} from '@hoangsonle/portal-core';
import { App, Typography } from 'antd';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router';

import { roleApi, userApi } from '../api';
import { userRole, userStatus } from '../mappings';

const UserListPage = () => {
  const t = useT();
  const navigate = useNavigate();
  const { message } = App.useApp();
  // Bảng + modal thêm/sửa + xoá + tải lại: gom hết vào 1 hook.
  const crud = useCrudPage<User>({ remove: user => userApi.remove(user.id) });

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
          <PortalButton type="primary" actionType="add" permissionCode="user.create" onClick={crud.openCreate} />
        </>
      }
    >
      <PortalTable<User>
        actionRef={crud.actionRef}
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
            { actionType: 'edit', permissionCode: 'user.update', onClick: () => crud.openEdit(record) },
            {
              actionType: 'delete',
              permissionCode: 'user.delete',
              popConfirm: { title: 'Xoá người dùng này?' },
              onClick: () => crud.removeRecord(record),
            },
          ],
        }}
      />
      <PortalModalForm<User, UserInput>
        {...crud.formProps}
        title={{ create: 'Thêm người dùng', edit: user => `Sửa: ${user.name}` }}
        initialValues={{ role: 'VIEWER', status: 'PENDING' }}
        create={userApi.create}
        update={(user, values) => userApi.update(user.id, values)}
      >
        <ProFormText name="name" label="Họ tên" rules={[{ required: true }]} />
        <ProFormText
          name="username"
          label="Tên đăng nhập"
          rules={[{ required: true }]}
          disabled={!!crud.formProps.record}
        />
        <ProFormText name="email" label="Email" rules={[{ required: true, type: 'email' }]} />
        <ProFormSelect
          name="role"
          label="Vai trò"
          request={async () => (await roleApi.list()).map(role => ({ label: role.name, value: role.id }))}
          rules={[{ required: true }]}
        />
        <ProFormRadio.Group name="status" label="Trạng thái" radioType="button" options={userStatus.toOptions(t)} />
      </PortalModalForm>
    </PageContainer>
  );
};

export default UserListPage;

import type { Category, CategoryInput } from '../api/categoryApi';
import type { ProColumns } from '@ant-design/pro-components';

import { ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import {
  createMapping,
  PageContainer,
  PortalButton,
  PortalInput,
  PortalModalForm,
  PortalTable,
  StatusTag,
  useCrudPage,
} from '@hoangsonle/portal-core';

import { categoryApi } from '../api/categoryApi';

const activeStatus = createMapping([
  { value: 'true', label: 'Đang dùng', color: 'success' },
  { value: 'false', label: 'Ngừng', color: 'default' },
] as const);

const columns: ProColumns<Category>[] = [
  { title: 'Mã', dataIndex: 'code', width: 120 },
  { title: 'Tên', dataIndex: 'name' },
  {
    title: 'Trạng thái',
    dataIndex: 'active',
    width: 140,
    render: (_, record) => <StatusTag mapping={activeStatus} value={String(record.active) as 'true' | 'false'} />,
  },
];

/** Trang danh mục mẫu: bảng + tìm kiếm + thêm/sửa/xoá — copy để làm trang mới. */
const CategoryListPage = () => {
  const crud = useCrudPage<Category>({ remove: item => categoryApi.remove(item.id) });

  return (
    <PageContainer extra={<PortalButton type="primary" actionType="add" onClick={crud.openCreate} />}>
      <PortalTable<Category>
        actionRef={crud.actionRef}
        columns={columns}
        request={categoryApi.list}
        pagination={{ defaultPageSize: 10 }}
        searchFormItems={[
          {
            formItemProps: { name: 'keyword', label: 'Từ khoá' },
            renderFormItem: () => <PortalInput placeholder="Mã hoặc tên" allowClear />,
          },
        ]}
        actionColumn={{
          renderButtons: item => [
            { actionType: 'edit', onClick: () => crud.openEdit(item) },
            {
              actionType: 'delete',
              popConfirm: { title: 'Xoá danh mục này?' },
              onClick: () => crud.removeRecord(item),
            },
          ],
        }}
      />
      <PortalModalForm<Category, CategoryInput>
        {...crud.formProps}
        title={{ create: 'Thêm danh mục', edit: item => `Sửa: ${item.name}` }}
        initialValues={{ active: true }}
        create={categoryApi.create}
        update={(item, values) => categoryApi.update(item.id, values)}
      >
        <ProFormText name="code" label="Mã" rules={[{ required: true }]} disabled={!!crud.formProps.record} />
        <ProFormText name="name" label="Tên" rules={[{ required: true }]} />
        <ProFormSwitch name="active" label="Đang dùng" />
      </PortalModalForm>
    </PageContainer>
  );
};

export default CategoryListPage;

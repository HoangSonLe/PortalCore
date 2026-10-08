import type { Device, Unit } from '../api';
import type { User } from '../mock/backend';
import type { ActionType } from '@hoangsonle/portal-core';
import type { ReactNode } from 'react';

import {
  actionTypeList,
  Can,
  MoreButtonGroup,
  PageContainer,
  PortalBlobImage,
  PortalButton,
  PortalDatePicker,
  PortalDownloadButton,
  PortalEnumSelect,
  PortalInput,
  PortalInputTextArea,
  PortalNumberInput,
  PortalRangePicker,
  PortalSelect,
  PortalSheetUpload,
  PortalTableActionButton,
  PortalTableCountTransfer,
  PortalTableTransfer,
  PortalTabs,
  PortalTreeSelect,
  PortalUpload,
  PortalUploadAvatar,
  readAsDataURL,
  StatusTag,
  useAuth,
  useDisclosure,
  useRequest,
} from '@hoangsonle/portal-core';
import { App, Card, Col, Flex, Form, Modal, Row, Space, Switch, Typography } from 'antd';
import { useState } from 'react';
import * as XLSX from 'xlsx';

import { catalogApi, roleApi, userApi } from '../api';
import { userRole, userStatus } from '../mappings';

const Section = ({ title, children, span = 12 }: { title: string; children: ReactNode; span?: number }) => (
  <Col xs={24} xl={span}>
    <Card title={title} style={{ height: '100%' }}>
      <Flex vertical gap={12}>
        {children}
      </Flex>
    </Card>
  </Col>
);

/** Hiện giá trị form ra để thấy component trả về gì. */
const ValuePreview = ({ value }: { value: unknown }) => (
  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
    Giá trị: <Typography.Text code>{JSON.stringify(value) ?? 'undefined'}</Typography.Text>
  </Typography.Text>
);

const wait = () => new Promise(resolve => setTimeout(resolve, 1000));

const ButtonsTab = () => {
  const { message } = App.useApp();

  return (
    <Row gutter={[16, 16]}>
      <Section title="PortalButton — 45 actionType (rê chuột để thấy icon đổi sang bản đặc)" span={24}>
        <Space wrap>
          {(Object.keys(actionTypeList) as ActionType[]).map(type => (
            <PortalButton key={type} actionType={type} onClick={() => message.info(type)} />
          ))}
        </Space>
      </Section>
      <Section title="PortalButton — biến thể">
        <Space wrap>
          <PortalButton type="primary" actionType="save" onClick={wait} />
          <PortalButton actionType="delete" popConfirm={{ title: 'Xoá bản ghi này?' }} onClick={wait} />
          <PortalButton actionType="export" hiddenChildren />
          <PortalButton actionType="approve" permissionCode="user.delete">
            Cần quyền user.delete
          </PortalButton>
        </Space>
      </Section>
      <Section title="PortalTableActionButton / MoreButtonGroup / PortalDownloadButton">
        <Space wrap>
          <PortalTableActionButton
            buttons={[
              { actionType: 'view', onClick: () => message.info('Xem') },
              { actionType: 'edit', onClick: () => message.info('Sửa') },
              { actionType: 'delete', popConfirm: { title: 'Xoá?' }, onClick: wait },
            ]}
          />
          <MoreButtonGroup
            buttons={[
              { children: 'Khoá tài khoản', onClick: () => message.info('Khoá') },
              { children: 'Xoá', danger: true, popConfirm: { title: 'Xoá bản ghi này?' }, onClick: wait },
            ]}
          />
          <PortalDownloadButton url="/reports/users" buttonProps={{ actionType: 'export' }} />
        </Space>
      </Section>
    </Row>
  );
};

const FormTab = () => {
  const [form] = Form.useForm();
  const [readOnly, setReadOnly] = useState(false);
  const values = Form.useWatch([], form);
  const provinceId = Form.useWatch('provinceId', form);

  return (
    <Card
      title="Form controls"
      extra={
        <Space>
          Chỉ đọc <Switch checked={readOnly} onChange={setReadOnly} />
        </Space>
      }
    >
      <Form form={form} layout="vertical" initialValues={{ salary: 15000000 }}>
        <Row gutter={16}>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="plate" label="PortalInput — textType uppercase" extra="Gõ chữ thường sẽ tự viết hoa">
              <PortalInput readOnly={readOnly} textType="uppercase" placeholder="30A-123.45" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="phone" label="PortalInput — regexRule chỉ số" extra="Không gõ được chữ">
              <PortalInput readOnly={readOnly} regexRule={/^[0-9]*$/} maxLength={10} placeholder="0912345678" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="fullName" label="PortalInput — capitalize">
              <PortalInput readOnly={readOnly} textType="capitalize" placeholder="nguyễn văn a" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="salary" label="PortalNumberInput — currency">
              <PortalNumberInput readOnly={readOnly} inputType="currency" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="birthday" label="PortalDatePicker — valueFormat YYYY-MM-DD">
              <PortalDatePicker readOnly={readOnly} valueFormat="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="range" label="PortalRangePicker (có chọn nhanh)">
              <PortalRangePicker readOnly={readOnly} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="status" label="PortalEnumSelect (từ mapping, có 'Tất cả')">
              <PortalEnumSelect readOnly={readOnly} mapping={userStatus} hasAllOption placeholder="Chọn trạng thái" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="userId" label="PortalSelect — tìm trên server">
              <PortalSelect<User>
                readOnly={readOnly}
                request={({ params }) => userApi.search(String(params?.keyword ?? ''))}
                searchKey="keyword"
                labelKey={user => `${user.name} (${user.username})`}
                valueKey="id"
                placeholder="Gõ tên để tìm"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="roles" label="PortalSelect — nhiều lựa chọn, lọc tại chỗ">
              <PortalSelect
                readOnly={readOnly}
                mode="multiple"
                request={roleApi.list}
                labelKey="name"
                valueKey="id"
                searchMode="local"
                maxTagCount={1}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="provinceId" label="Tỉnh/Thành (PortalSelect)">
              <PortalSelect
                readOnly={readOnly}
                request={catalogApi.provinces}
                labelKey="name"
                valueKey="id"
                searchMode="local"
                onChange={value => form.setFieldsValue({ provinceId: value, districtId: undefined })}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="districtId" label="Quận/Huyện — phụ thuộc Tỉnh (requiredParamKeys)">
              <PortalSelect
                readOnly={readOnly}
                request={catalogApi.districts}
                requestParams={{ pathVars: { id: provinceId } }}
                requiredParamKeys={{ pathVars: ['id'] }}
                labelKey="name"
                valueKey="id"
                searchMode="local"
                placeholder={provinceId ? 'Chọn quận/huyện' : 'Chọn tỉnh trước'}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item name="unitIds" label="PortalTreeSelect — cây đơn vị">
              <PortalTreeSelect<Unit>
                readOnly={readOnly}
                request={catalogApi.units}
                treeSelectKey={{
                  label: 'name',
                  value: 'id',
                  children: { key: 'children', value: { label: 'name', value: 'id' } },
                }}
                placeholder="Chọn đơn vị"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="note" label="PortalInputTextArea">
              <PortalInputTextArea readOnly={readOnly} placeholder="Ghi chú" showCount maxLength={500} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <ValuePreview value={values} />
    </Card>
  );
};

const FileTab = () => {
  const [avatar, setAvatar] = useState<string>();
  const [rows, setRows] = useState<Record<string, unknown>[]>();

  return (
    <Row gutter={[16, 16]}>
      <Section title="PortalUploadAvatar">
        <PortalUploadAvatar
          value={avatar}
          onChange={setAvatar}
          upload={file => wait().then(() => readAsDataURL(file))}
        />
        <Typography.Text type="secondary">
          Truyền hàm <Typography.Text code>upload(file) =&gt; Promise&lt;url&gt;</Typography.Text>. Muốn cắt ảnh: cài{' '}
          <Typography.Text code>antd-img-crop</Typography.Text> rồi truyền{' '}
          <Typography.Text code>imgCrop={'{ImgCrop}'}</Typography.Text>.
        </Typography.Text>
      </Section>
      <Section title="PortalBlobImage — ảnh cần token">
        <Space wrap>
          {[1, 2, 5, 9].map(id => (
            <PortalBlobImage
              key={id}
              imageUrl={`/files/avatar/${id}`}
              width={120}
              height={80}
              style={{ objectFit: 'cover', borderRadius: 6 }}
            />
          ))}
        </Space>
        <Typography.Text type="secondary">Tải qua HttpClient nên tự gắn token; bấm để xem lớn.</Typography.Text>
      </Section>
      <Section title="PortalUpload — nhiều ảnh" span={24}>
        <PortalUpload beforeUpload={() => false} maxCount={4} />
      </Section>
      <Section title="PortalSheetUpload — nhập Excel" span={24}>
        <PortalSheetUpload
          xlsx={XLSX}
          templateUrl="/files/user-template"
          columnFieldItems={[
            { dataIndex: 'name', name: 'name' },
            { dataIndex: 'username', name: 'username' },
            { dataIndex: 'email', name: 'email' },
          ]}
          tableProps={{
            columns: [
              { title: 'Họ tên', dataIndex: 'name' },
              { title: 'Tài khoản', dataIndex: 'username' },
              { title: 'Email', dataIndex: 'email' },
            ],
          }}
          onChange={setRows}
        />
        <ValuePreview value={rows} />
      </Section>
    </Row>
  );
};

const TransferTab = () => {
  const { data: users = [] } = useRequest(() => userApi.search(''));
  const { data: devices = [] } = useRequest(catalogApi.devices);
  const [members, setMembers] = useState<number[]>([2, 3]);
  const [allocation, setAllocation] = useState<{ deviceId: string; name: string; quantity: number }[]>([
    { deviceId: 'CAM', name: 'Camera IP', quantity: 4 },
  ]);

  return (
    <Row gutter={[16, 16]}>
      <Section title="PortalTableTransfer — gán người dùng vào nhóm" span={24}>
        <PortalTableTransfer<User>
          rowKey="id"
          dataSource={users}
          titles={['Chưa trong nhóm', 'Thành viên']}
          leftColumns={[
            { title: 'Họ tên', dataIndex: 'name' },
            { title: 'Tài khoản', dataIndex: 'username' },
          ]}
          rightColumns={[{ title: 'Họ tên', dataIndex: 'name' }]}
          value={members}
          onChange={setMembers}
        />
        <ValuePreview value={members} />
      </Section>
      <Section title="PortalTableCountTransfer — phân bổ thiết bị theo số lượng" span={24}>
        <PortalTableCountTransfer<Device>
          rowKey="id"
          dataSource={devices}
          titles={['Kho', 'Đã cấp cho dự án']}
          leftColumns={[{ title: 'Thiết bị', dataIndex: 'name' }]}
          rightColumns={[{ title: 'Thiết bị', dataIndex: 'name' }]}
          valueFormatter={{
            valueKey: 'deviceId',
            valueItems: [{ dataIndex: 'name' }],
            count: { maxKey: 'stock', name: 'quantity' },
          }}
          value={allocation}
          onChange={setAllocation}
        />
        <ValuePreview value={allocation} />
      </Section>
    </Row>
  );
};

const OtherTab = () => {
  const { can } = useAuth();
  const modal = useDisclosure<string>();

  return (
    <Row gutter={[16, 16]}>
      <Section title="StatusTag + createMapping">
        <Space wrap>
          {userStatus.items.map(item => (
            <StatusTag key={item.value} mapping={userStatus} value={item.value} />
          ))}
          {userRole.items.map(item => (
            <StatusTag key={item.value} mapping={userRole} value={item.value} />
          ))}
        </Space>
      </Section>
      <Section title="Can / usePermission / useDisclosure">
        <Can
          permission="setting.manage"
          fallback={<Typography.Text type="warning">Bạn không có quyền setting.manage</Typography.Text>}
        >
          <Typography.Text type="success">Bạn có quyền setting.manage</Typography.Text>
        </Can>
        <Typography.Text>
          <Typography.Text code>{`can(['user.create', 'user.delete'], 'any')`}</Typography.Text> ={' '}
          <b>{String(can(['user.create', 'user.delete'], 'any'))}</b>
        </Typography.Text>
        <div>
          <PortalButton onClick={() => modal.show('Dữ liệu truyền vào modal')}>Mở modal có dữ liệu</PortalButton>
        </div>
        <Modal open={modal.open} onCancel={modal.hide} onOk={modal.hide} title="useDisclosure">
          {modal.data}
        </Modal>
      </Section>
    </Row>
  );
};

const ComponentsPage = () => (
  <PageContainer description="Các component có sẵn trong core, cùng tên và API với Kit cũ. Tab bên dưới chính là PortalTabs (đồng bộ ?tab= trên URL).">
    <PortalTabs
      mode="query"
      destroyOnHidden
      items={[
        { key: 'button', label: 'Nút', children: <ButtonsTab /> },
        { key: 'form', label: 'Form', children: <FormTab /> },
        { key: 'file', label: 'File & ảnh', children: <FileTab /> },
        { key: 'transfer', label: 'Bảng chuyển', children: <TransferTab /> },
        { key: 'other', label: 'Khác', children: <OtherTab /> },
      ]}
    />
  </PageContainer>
);

export default ComponentsPage;

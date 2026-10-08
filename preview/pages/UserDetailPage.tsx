import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageContainer, StatusTag, useRequest } from '@hoangsonle/portal-core';
import { Button, Card, Descriptions, Result } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router';

import { userApi } from '../api';
import { userRole, userStatus } from '../mappings';

const UserDetailPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: user, loading, error } = useRequest(() => userApi.detail(id), { deps: [id] });

  return (
    <PageContainer
      title={user?.name}
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/system/users')}>
          Danh sách
        </Button>
      }
    >
      {error ? (
        <Result status="404" title="Không tìm thấy người dùng" />
      ) : (
        <Card loading={loading}>
          {user && (
            <Descriptions column={{ xs: 1, md: 2 }} bordered size="small">
              <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
              <Descriptions.Item label="Tài khoản">{user.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <StatusTag mapping={userRole} value={user.role} />
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <StatusTag mapping={userStatus} value={user.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{dayjs(user.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
            </Descriptions>
          )}
        </Card>
      )}
    </PageContainer>
  );
};

export default UserDetailPage;

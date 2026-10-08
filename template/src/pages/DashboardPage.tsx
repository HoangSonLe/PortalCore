import { PageContainer, useAuth } from '@hoangsonle/portal-core';
import { Card, Typography } from 'antd';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <PageContainer description={`Xin chào ${user?.name ?? ''}.`}>
      <Card>
        <Typography.Paragraph style={{ margin: 0 }}>
          Dự án tạo từ template của <Typography.Text code>@hoangsonle/portal-core</Typography.Text>. Xem trang{' '}
          <b>Danh mục mẫu</b> để có ví dụ CRUD hoàn chỉnh, rồi sửa{' '}
          <Typography.Text code>src/routes.tsx</Typography.Text> để thêm trang của bạn.
        </Typography.Paragraph>
      </Card>
    </PageContainer>
  );
};

export default DashboardPage;

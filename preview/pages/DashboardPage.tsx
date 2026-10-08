import { CheckCircleOutlined, ClockCircleOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import { PageContainer, PortalButton, useAuth, useRequest, useT } from '@hoangsonle/portal-core';
import { Alert, Avatar, Card, Col, List, Row, Space, Statistic, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

import { dashboardApi, devApi, userApi } from '../api';
import { resetMockDb } from '../mock/backend';

/** Demo: token hết hạn + 5 request song song -> core chỉ refresh 1 lần. */
const RefreshDemo = () => {
  const [result, setResult] = useState<string>();

  const run = async () => {
    setResult(undefined);
    const before = await devApi.stats();

    await devApi.expireTokens();

    const started = performance.now();
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, i) => userApi.list({ current: i + 1, pageSize: 5 })),
    );
    const after = await devApi.stats();
    const ok = results.filter(r => r.status === 'fulfilled').length;

    setResult(
      `${ok}/5 thành công · refresh được gọi ${after.refreshCalls - before.refreshCalls} lần · API /users nhận ${
        after.userListRequests - before.userListRequests
      } request (5 lần bị 401 + 5 lần gửi lại) · ${Math.round(performance.now() - started)}ms`,
    );
  };

  return (
    <Card
      title="Thử refresh token"
      extra={
        <Space>
          <PortalButton type="primary" onClick={run}>
            Chạy thử
          </PortalButton>
          <PortalButton actionType="sync" hiddenChildren onClick={resetMockDb}>
            Reset dữ liệu demo
          </PortalButton>
        </Space>
      }
    >
      <Typography.Paragraph type="secondary">
        Làm mọi access token hết hạn rồi gửi 5 request cùng lúc. Core chỉ refresh 1 lần và gửi lại mỗi request đúng 1
        lần.
      </Typography.Paragraph>
      {result && <Alert type="success" showIcon message={result} />}
    </Card>
  );
};

const DashboardPage = () => {
  const t = useT();
  const { user, permissions } = useAuth();
  const { data, loading } = useRequest(dashboardApi.summary);
  const { data: activity, loading: activityLoading } = useRequest(dashboardApi.activity);

  const stats = [
    { title: 'Tổng người dùng', value: data?.total.value, icon: <TeamOutlined />, color: '#1ab394' },
    { title: t('status.active'), value: data?.active.value, icon: <CheckCircleOutlined />, color: '#1c84c6' },
    { title: t('status.pending'), value: data?.pending.value, icon: <ClockCircleOutlined />, color: '#f8ac59' },
    { title: t('status.locked'), value: data?.locked.value, icon: <LockOutlined />, color: '#ed5565' },
  ];

  return (
    <PageContainer description={`Xin chào ${user?.name ?? ''}.`}>
      <Row gutter={[16, 16]}>
        {stats.map(stat => (
          <Col key={stat.title} xs={12} lg={6}>
            <Card loading={loading}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Hoạt động gần đây" style={{ height: '100%' }}>
            <List
              loading={activityLoading}
              dataSource={activity ?? []}
              renderItem={item => (
                <List.Item extra={<Typography.Text type="secondary">{dayjs(item.at).format('HH:mm')}</Typography.Text>}>
                  <List.Item.Meta
                    avatar={<Avatar>{item.actor.charAt(0)}</Avatar>}
                    title={item.actor}
                    description={`${item.text}${item.target ? ` ${item.target}` : ''}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card title="Phiên đăng nhập">
              <Space direction="vertical">
                <span>
                  Tài khoản: <b>{user?.username}</b>
                </span>
                <Space size={[4, 4]} wrap>
                  Quyền:
                  {permissions.map(code => (
                    <Tag key={code}>{code}</Tag>
                  ))}
                </Space>
                <Typography.Text type="secondary">
                  Đăng xuất rồi vào bằng tài khoản viewer để thấy menu và nút thay đổi theo quyền.
                </Typography.Text>
              </Space>
            </Card>
            <RefreshDemo />
          </Space>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardPage;

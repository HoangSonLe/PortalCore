import type { LoginCredentials } from '../auth/types';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Flex, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router';

import { useAuth, useT } from '../core/hooks';
import { isHttpError } from '../http/errors';

export interface QuickAccount {
  label: string;
  username: string;
  password: string;
}

export interface LoginPageProps {
  /** Nút đăng nhập nhanh — tiện cho môi trường dev/demo. Đừng dùng ở production. */
  quickAccounts?: QuickAccount[];
}

export const LoginPage = ({ quickAccounts }: LoginPageProps) => {
  const t = useT();
  const { login, canForgotPassword } = useAuth();
  const [form] = Form.useForm<LoginCredentials>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const handleFinish = async (values: LoginCredentials) => {
    setSubmitting(true);
    setError(undefined);

    try {
      await login(values);
      // Thành công: RequireGuest tự chuyển về trang `redirect` hoặc trang chủ.
    } catch (err) {
      setError((isHttpError(err) && err.serverMessage) || t('auth.login.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex vertical gap={20}>
      <Typography.Title level={4} style={{ margin: 0, textAlign: 'center' }}>
        {t('auth.login.title')}
      </Typography.Title>
      {error && <Alert type="error" showIcon message={error} />}
      <Form<LoginCredentials> form={form} layout="vertical" size="large" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="username"
          label={t('auth.login.username')}
          rules={[{ required: true, message: t('auth.required', { field: t('auth.login.username').toLowerCase() }) }]}
        >
          <Input prefix={<UserOutlined />} autoComplete="username" autoFocus />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('auth.login.password')}
          rules={[{ required: true, message: t('auth.required', { field: t('auth.login.password').toLowerCase() }) }]}
        >
          <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
        </Form.Item>
        {canForgotPassword && (
          <Flex justify="flex-end" style={{ marginTop: -12, marginBottom: 16 }}>
            <Link to="/auth/forgot-password">{t('auth.login.forgot')}</Link>
          </Flex>
        )}
        <Button type="primary" htmlType="submit" block loading={submitting}>
          {t('auth.login.submit')}
        </Button>
      </Form>
      {quickAccounts && quickAccounts.length > 0 && (
        <>
          <Divider plain style={{ margin: 0 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {t('auth.quick')}
            </Typography.Text>
          </Divider>
          <Space wrap style={{ justifyContent: 'center' }}>
            {quickAccounts.map(account => (
              <Button
                key={account.username}
                size="small"
                onClick={() => {
                  form.setFieldsValue({ username: account.username, password: account.password });
                  form.submit();
                }}
              >
                {account.username} · {account.label}
              </Button>
            ))}
          </Space>
        </>
      )}
    </Flex>
  );
};

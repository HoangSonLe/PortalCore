import { MailOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Form, Input, Result, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router';

import { useAuth, useT } from '../core/hooks';
import { isHttpError } from '../http/errors';

export const ForgotPasswordPage = () => {
  const t = useT();
  const { forgotPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();

  const handleFinish = async ({ email }: { email: string }) => {
    if (!forgotPassword) return;

    setSubmitting(true);
    setError(undefined);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError((isHttpError(err) && err.serverMessage) || t('http.error.default'));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Result
        status="success"
        title={t('auth.forgot.sent')}
        extra={<Link to="/auth/login">{t('auth.forgot.back')}</Link>}
        style={{ padding: 0 }}
      />
    );
  }

  return (
    <Flex vertical gap={24}>
      <div>
        <Typography.Title level={4} style={{ margin: 0, textAlign: 'center' }}>
          {t('auth.forgot.title')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center', margin: '8px 0 0' }}>
          {t('auth.forgot.description')}
        </Typography.Paragraph>
      </div>
      {error && <Alert type="error" showIcon message={error} />}
      <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="email"
          label={t('auth.forgot.email')}
          rules={[{ required: true, type: 'email', message: t('auth.required', { field: 'email' }) }]}
        >
          <Input size="large" prefix={<MailOutlined />} autoComplete="email" autoFocus />
        </Form.Item>
        <Button type="primary" size="large" htmlType="submit" block loading={submitting}>
          {t('auth.forgot.submit')}
        </Button>
      </Form>
      <Flex justify="center">
        <Link to="/auth/login">{t('auth.forgot.back')}</Link>
      </Flex>
    </Flex>
  );
};

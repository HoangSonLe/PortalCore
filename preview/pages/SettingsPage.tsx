import type { Locale } from '@hoangsonle/portal-core';

import { localeLabels, PageContainer, useAppSettings } from '@hoangsonle/portal-core';
import { Card, Form, Segmented, Select } from 'antd';

const SettingsPage = () => {
  const { themeMode, setThemeMode, locale, locales, setLocale } = useAppSettings();

  return (
    <PageContainer description="Trang này chỉ tài khoản có quyền setting.manage (admin) mới thấy.">
      <Card style={{ maxWidth: 560 }}>
        <Form layout="vertical">
          <Form.Item label="Giao diện">
            <Segmented
              value={themeMode}
              onChange={value => setThemeMode(value as typeof themeMode)}
              options={[
                { label: 'Sáng (kiểu ANVL)', value: 'light' },
                { label: 'Tối (kiểu C10)', value: 'dark' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Ngôn ngữ">
            <Select<Locale>
              value={locale}
              style={{ width: 200 }}
              onChange={setLocale}
              options={locales.map(code => ({ label: localeLabels[code], value: code }))}
            />
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default SettingsPage;

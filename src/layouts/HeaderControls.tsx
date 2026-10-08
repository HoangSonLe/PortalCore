import type { MenuProps } from 'antd';

import { GlobalOutlined, LogoutOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Flex, Tooltip, Typography } from 'antd';

import { usePortal } from '../core/context';
import { useAppSettings, useAuth, useT } from '../core/hooks';
import { localeLabels } from '../i18n/messages';

export const ThemeSwitch = () => {
  const t = useT();
  const { themeMode, toggleThemeMode } = useAppSettings();
  const isDark = themeMode === 'dark';

  return (
    <Tooltip title={t(isDark ? 'layout.theme.light' : 'layout.theme.dark')}>
      <Button
        type="text"
        aria-label={t(isDark ? 'layout.theme.light' : 'layout.theme.dark')}
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleThemeMode}
      />
    </Tooltip>
  );
};

export const LocaleSwitch = () => {
  const t = useT();
  const { locale, locales, setLocale } = useAppSettings();

  if (locales.length < 2) return null;

  const items: MenuProps['items'] = locales.map(code => ({ key: code, label: localeLabels[code] ?? code }));

  return (
    <Dropdown
      menu={{ items, selectable: true, selectedKeys: [locale], onClick: ({ key }) => setLocale(key as typeof locale) }}
      trigger={['click']}
    >
      <Button type="text" icon={<GlobalOutlined />} aria-label={t('layout.language')}>
        {locale.toUpperCase()}
      </Button>
    </Dropdown>
  );
};

/** `compact`: chỉ hiện avatar (màn hình nhỏ). */
export const UserMenu = ({ compact = false }: { compact?: boolean }) => {
  const t = useT();
  const { layout } = usePortal();
  const { user, enabled, logout } = useAuth();

  if (!enabled || !user) return null;

  const extraItems = layout.userMenuItems ?? [];
  const items: MenuProps['items'] = [
    ...extraItems.map(({ key, label, icon }) => ({ key, label, icon })),
    ...(extraItems.length ? [{ type: 'divider' as const }] : []),
    { key: '__logout', label: t('auth.logout'), icon: <LogoutOutlined />, danger: true },
  ];

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    if (key === '__logout') {
      void logout();

      return;
    }

    extraItems.find(item => item.key === key)?.onClick?.();
  };

  return (
    <Dropdown menu={{ items, onClick: handleClick }} trigger={['click']} placement="bottomRight">
      <Button type="text" style={{ height: 40, paddingInline: 8 }} aria-label={user.name}>
        <Flex align="center" gap={8}>
          <Avatar size={28} src={user.avatar}>
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          {!compact && (
            <Typography.Text style={{ maxWidth: 160 }} ellipsis>
              {user.name}
            </Typography.Text>
          )}
        </Flex>
      </Button>
    </Dropdown>
  );
};

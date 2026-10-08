import type { TabsProps } from 'antd';

import { Tabs } from 'antd';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';

export interface PortalTabsProps extends TabsProps {
  /**
   * `path` (mặc định, giống Kit): tab nằm ở đoạn cuối URL — route khai báo `path: 'users/:id/:tabKey?'`.
   * `query`: tab nằm ở query string `?tab=...` — không cần sửa route.
   */
  mode?: 'path' | 'query';
  /** Tên tham số route / query. Mặc định `tabKey` (path) hoặc `tab` (query). */
  paramName?: string;
}

/** Tabs đồng bộ với URL: F5 hay gửi link vẫn mở đúng tab (giống PortalTabs bên Kit cũ). */
export const PortalTabs = ({ mode = 'path', paramName, onChange, activeKey, items, ...props }: PortalTabsProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const name = paramName ?? (mode === 'path' ? 'tabKey' : 'tab');
  const current = mode === 'path' ? params[name] : (searchParams.get(name) ?? undefined);

  const handleChange = (key: string) => {
    onChange?.(key);

    if (mode === 'query') {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);

          next.set(name, key);

          return next;
        },
        { replace: true },
      );

      return;
    }

    const base = current ? pathname.slice(0, pathname.lastIndexOf('/')) : pathname.replace(/\/$/, '');

    navigate(`${base}/${key}`, { replace: true });
  };

  return <Tabs {...props} items={items} activeKey={activeKey ?? current ?? items?.[0]?.key} onChange={handleChange} />;
};

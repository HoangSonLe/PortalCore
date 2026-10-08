import type { ReactNode } from 'react';

import { Flex, Space, Typography } from 'antd';

import { useT } from '../core/hooks';
import { useCurrentRoute } from '../router/useVisibleRoutes';

export interface PageContainerProps {
  /** Mặc định lấy `title` của route hiện tại. */
  title?: ReactNode;
  description?: ReactNode;
  /** Nút hành động góc phải (Thêm mới, Xuất file...). */
  extra?: ReactNode;
  children?: ReactNode;
}

export const PageContainer = ({ title, description, extra, children }: PageContainerProps) => {
  const t = useT();
  const current = useCurrentRoute();
  const finalTitle = title ?? (current?.route.title ? t(current.route.title) : undefined);

  return (
    <Flex vertical gap={16}>
      {(finalTitle || extra) && (
        <Flex justify="space-between" align="center" wrap gap={12}>
          <div style={{ minWidth: 0 }}>
            {finalTitle && (
              <Typography.Title level={4} style={{ margin: 0 }}>
                {finalTitle}
              </Typography.Title>
            )}
            {description && <Typography.Text type="secondary">{description}</Typography.Text>}
          </div>
          {extra && <Space wrap>{extra}</Space>}
        </Flex>
      )}
      {children}
    </Flex>
  );
};

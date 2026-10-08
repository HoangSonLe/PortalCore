import type { ReactNode } from 'react';

import { ConfigProvider, theme } from 'antd';

type InputLikeComponent = 'Input' | 'InputNumber' | 'Select' | 'DatePicker' | 'TreeSelect';

/**
 * Chế độ chỉ đọc (giống Kit cũ): field bị disabled nhưng chữ vẫn rõ như bình thường, nền hơi xám —
 * dùng cho form xem chi tiết.
 */
export const ReadOnlyProvider = ({
  readOnly,
  component,
  children,
}: {
  readOnly?: boolean;
  component: InputLikeComponent;
  children: ReactNode;
}) => {
  const { token } = theme.useToken();

  if (!readOnly) return children;

  return (
    <ConfigProvider
      theme={{
        components: {
          [component]: { colorTextDisabled: token.colorText, colorBgContainerDisabled: token.colorFillQuaternary },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

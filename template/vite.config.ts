import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Đảm bảo app và portal-core dùng chung 1 bản React/antd (quan trọng khi link core bằng file:).
    dedupe: ['react', 'react-dom', 'react-router', 'antd', '@ant-design/icons', '@ant-design/pro-components', 'dayjs'],
  },
  server: { port: 5173 },
});

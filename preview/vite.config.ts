import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// App preview import thẳng source của core (không cần build lib) -> sửa core là preview tự reload.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@hoangsonle/portal-core': resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 5180,
    open: false,
  },
  build: {
    outDir: resolve(__dirname, '../preview-dist'),
    emptyOutDir: true,
  },
});

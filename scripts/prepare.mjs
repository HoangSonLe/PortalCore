#!/usr/bin/env node
/**
 * Chạy tự động ở `prepare` (npm/yarn gọi khi cài core từ git, và trước `npm pack`).
 * Repo không commit dist/, nên khi cài `github:HoangSonLe/PortalCore#vX.Y.Z` phải build tại chỗ,
 * nếu không app sẽ báo "Failed to resolve entry for package @hoangsonle/portal-core".
 * Đã có dist/ (dev local, create-app vừa build) thì bỏ qua cho nhanh.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

if (existsSync(join(root, 'dist', 'index.js'))) {
  process.exit(0);
}

console.log('› portal-core: chưa có dist/, đang build...');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

#!/usr/bin/env node
/**
 * Thử cài portal-core như một app thật:
 * build lib -> npm pack -> tạo app từ template/ -> npm install tarball -> tsc + vite build.
 * Bắt lỗi mà preview (import thẳng source) không thấy: thiếu file trong dist, sai exports, sai .d.ts, sai đường import.
 *   npm run smoke
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(root, '.smoke', 'app');
const step = (title, command, cwd = root) => {
  console.log(`\n› ${title}\n  $ ${command}`);
  execSync(command, { cwd, stdio: 'inherit' });
};

rmSync(join(root, '.smoke'), { recursive: true, force: true });

step('Tạo app từ template (kèm build + pack core)', `node scripts/create-app.mjs "${appDir}" --title "Smoke Test"`);
step('Cài dependency như người dùng thật', 'npm install --no-audit --no-fund', appDir);
step('Typecheck + build app', 'npm run build', appDir);

const assets = existsSync(join(appDir, 'dist', 'assets')) ? readdirSync(join(appDir, 'dist', 'assets')) : [];

if (!assets.some(file => file.endsWith('.js'))) {
  console.error('✗ Không thấy file JS trong dist/assets');
  process.exit(1);
}

console.log(
  `\n✓ Smoke test OK — app dùng @hoangsonle/portal-core từ tarball build thành công (${assets.length} file).`,
);

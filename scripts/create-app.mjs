#!/usr/bin/env node
/**
 * Tạo dự án mới từ template/:
 *   npm run create-app -- ../my-app --title "Quản lý kho"
 *
 * Core được đóng gói bằng `npm pack` và cài từ vendor/*.tgz (không symlink -> không bị trùng React).
 * Tuỳ chọn: --core <spec>  dùng spec khác, vd `github:HoangSonLe/PortalCore#v0.3.0`
 *           --skip-build    không build lại core (dùng dist hiện có)
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = name => {
  const index = args.indexOf(name);

  return index >= 0 ? args[index + 1] : undefined;
};
const target = args.find((arg, i) => !arg.startsWith('--') && !['--title', '--core'].includes(args[i - 1]));

if (!target) {
  console.error('Cách dùng: npm run create-app -- <thư-mục> [--title "Tên app"] [--core <spec>] [--skip-build]');
  process.exit(1);
}

const targetDir = resolve(process.cwd(), target);
const appName = basename(targetDir)
  .toLowerCase()
  .replace(/[^a-z0-9-]+/g, '-');
const title = option('--title') ?? appName;

if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
  console.error(`Thư mục ${targetDir} đã có nội dung, chọn thư mục khác.`);
  process.exit(1);
}

const run = (command, cwd = root) =>
  execSync(command, { cwd, stdio: ['ignore', 'pipe', 'inherit'] })
    .toString()
    .trim();

// 1. Đóng gói core
let coreSpec = option('--core');

if (!coreSpec) {
  if (!args.includes('--skip-build')) {
    console.log('› Build portal-core...');
    run('npm run build');
  }

  mkdirSync(join(targetDir, 'vendor'), { recursive: true });
  console.log('› Đóng gói portal-core...');

  const tarball = run(`npm pack --silent --pack-destination "${join(targetDir, 'vendor')}"`)
    .split(/\r?\n/)
    .pop();

  coreSpec = `file:vendor/${tarball}`;
}

// 2. Copy template
console.log('› Tạo dự án từ template...');
cpSync(join(root, 'template'), targetDir, {
  recursive: true,
  // Bỏ những gì sinh ra khi chạy thử template/ tại chỗ.
  filter: source =>
    !/[\\/](node_modules|dist)([\\/]|$)|[\\/](package-lock\.json|yarn\.lock|\.env\.local)$/.test(
      relative(root, source),
    ),
});

// npm bỏ qua file .gitignore khi publish, nên template lưu tên không có dấu chấm.
for (const [from, to] of [
  ['gitignore', '.gitignore'],
  ['dockerignore', '.dockerignore'],
]) {
  if (existsSync(join(targetDir, from))) renameSync(join(targetDir, from), join(targetDir, to));
}

// 3. Thay placeholder
const replaceIn = dir => {
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);

    if (statSync(file).isDirectory()) {
      if (entry !== 'vendor') replaceIn(file);
      continue;
    }

    if (!/\.(json|ts|tsx|html|md|js|conf|sh|example)$/.test(entry) && !entry.startsWith('.')) continue;

    const content = readFileSync(file, 'utf8');
    const next = content.replaceAll('__APP_NAME__', appName).replaceAll('__APP_TITLE__', title);

    if (next !== content) writeFileSync(file, next);
  }
};

replaceIn(targetDir);

// template/package.json trỏ core lên GitHub để chạy thử tại chỗ được; dự án mới dùng spec đã chọn.
const pkgFile = join(targetDir, 'package.json');
const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'));

pkg.dependencies['@hoangsonle/portal-core'] = coreSpec;
writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');

console.log(`
✓ Đã tạo ${targetDir}

  cd ${relative(process.cwd(), targetDir) || '.'}
  npm install
  npm run dev        # đăng nhập admin / admin (backend giả, bật sẵn trong .env.development)
`);

#!/usr/bin/env node
/**
 * Gắn tag phát hành vX.Y.Z (theo version trong package.json) lên một commit = HEAD + dist/ đã build.
 *   npm run release:tag && git push origin main vX.Y.Z
 *
 * Vì sao: main không commit dist/. Khi cài `github:HoangSonLe/PortalCore#vX.Y.Z`, yarn chỉ tải tarball của
 * commit (không build), nên commit được tag phải có sẵn dist/. Commit này nằm ngoài nhánh main (chỉ tag trỏ tới),
 * main vẫn sạch.
 */
import { execSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const git = (command, env) =>
  execSync(`git ${command}`, { cwd: root, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'inherit'] })
    .toString()
    .trim();
const fail = message => {
  console.error(`✗ ${message}`);
  process.exit(1);
};

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const tag = `v${version}`;

if (git('status --porcelain')) fail('Còn thay đổi chưa commit — commit trước rồi chạy lại.');
if (git(`tag --list ${tag}`)) fail(`Tag ${tag} đã có. Tăng version (npm run release:version) trước.`);

console.log('› Build...');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

// Dùng index tạm để không đụng vào index/nhánh hiện tại.
const indexFile = join(tmpdir(), `portal-core-release-${process.pid}.index`);
const env = { GIT_INDEX_FILE: indexFile };

try {
  git('read-tree HEAD', env);
  git('add -f dist', env);

  const tree = git('write-tree', env);
  const commit = git(`commit-tree ${tree} -p HEAD -m "release: ${tag} (kèm dist)"`);

  git(`tag -a ${tag} ${commit} -m "${tag}"`);
} finally {
  rmSync(indexFile, { force: true });
}

console.log(`
✓ Đã tạo tag ${tag} (HEAD + dist/). Đẩy lên:

  git push origin main ${tag}

Các dự án cài: github:HoangSonLe/PortalCore#${tag}`);

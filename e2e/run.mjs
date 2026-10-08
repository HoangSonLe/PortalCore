/**
 * Kịch bản e2e cho app preview. Cần dev server đang chạy (`npm run dev`) rồi: `npm run e2e`.
 * Dùng Chrome/Edge có sẵn trên máy (không tải browser). Đổi đường dẫn qua biến CHROME_PATH.
 * Ảnh chụp lưu ở e2e/shots/.
 */
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:5180';
const OUT = fileURLToPath(new URL('./shots/', import.meta.url));
const CHROME_PATH = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const browser = await chromium.launch({ executablePath: CHROME_PATH });
const context = await browser.newContext({ viewport: { width: 1366, height: 820 } });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', err => consoleErrors.push('PAGEERROR ' + err.message));

const login = async (username, password = username) => {
  await page.goto(`${BASE}/`);
  await page.waitForURL(/\/auth\/login/);
  await page.getByLabel(/Tên đăng nhập|Username/).fill(username);
  await page.getByLabel(/Mật khẩu|Password/).fill(password);
  await page.getByRole('button', { name: /Đăng nhập|Sign in/ }).click();
};

// 1. Chưa đăng nhập -> chuyển về login
await page.goto(`${BASE}/system/users`);
await page.waitForURL(/\/auth\/login\?redirect=/);
check('Chưa login vào /system/users -> /auth/login?redirect=...', true, page.url().replace(BASE, ''));
await page.locator('form').waitFor();
await page.screenshot({ path: OUT + '01-login.png' });

// 2. Sai mật khẩu -> báo lỗi inline
await page.getByLabel(/Tên đăng nhập/).fill('admin');
await page.getByLabel(/Mật khẩu/).fill('sai');
await page.getByRole('button', { name: /Đăng nhập/ }).click();
const loginError = await page.locator('.ant-alert-error').textContent({ timeout: 5000 });
check('Sai mật khẩu hiện lỗi từ server', loginError?.includes('Sai tên đăng nhập'), loginError);

// 3. Login đúng -> quay lại trang redirect
await page.getByLabel(/Mật khẩu/).fill('admin');
await page.getByRole('button', { name: /Đăng nhập/ }).click();
await page.waitForURL(/\/system\/users$/);
await page.locator('.ant-table-row').first().waitFor();
const rowCount = await page.locator('.ant-table-row').count();
check('Login xong quay lại đúng /system/users, bảng có dữ liệu', rowCount === 10, `${rowCount} dòng`);
const actionButtons = await page.locator('.ant-table-row').first().locator('td').last().locator('button').count();
check('Admin thấy đủ 3 nút thao tác (xem/sửa/xoá)', actionButtons === 3, `${actionButtons} nút`);
await page.screenshot({ path: OUT + '02-users-admin.png' });

// 4. Thêm user trùng email -> toast lỗi, modal giữ nguyên
await page.getByRole('button', { name: /Thêm mới/ }).click();
const modal = page.locator('.ant-modal-content');
await modal.getByLabel('Họ tên').fill('Test User');
await modal.getByLabel('Tên đăng nhập').fill('test.user');
await modal.getByLabel('Email').fill('admin@demo.local');
await modal.getByRole('button', { name: /OK|Xác nhận|Đồng ý|确 定|确定/ }).click();
const toast = await page.locator('.ant-notification-notice').first().textContent({ timeout: 5000 });
check('Email trùng -> toast lỗi server, modal vẫn mở', toast?.includes('Email đã tồn tại') && (await modal.isVisible()), toast);
await page.screenshot({ path: OUT + '03-create-error.png' });
await modal.getByLabel('Email').fill('test.user@demo.local');
await modal.getByRole('button', { name: /OK|Xác nhận|Đồng ý|确 定|确定/ }).click();
await page.locator('.ant-notification-notice', { hasText: 'Đã thêm người dùng' }).waitFor({ timeout: 5000 });
await page.locator('.ant-table-row', { hasText: 'Test User' }).waitFor({ timeout: 5000 });
check('Thêm user hợp lệ -> toast thành công + bảng reload có user mới', true);

// 5. Xem chi tiết (route ẩn khỏi menu) -> breadcrumb + menu cha được chọn
await page.locator('.ant-table-row', { hasText: 'Test User' }).getByRole('link').click();
await page.waitForURL(/\/system\/users\/\d+$/);
await page.locator('.ant-descriptions').waitFor();
const crumbs = (await page.locator('.ant-breadcrumb').textContent()) ?? '';
const selectedMenu = (await page.locator('.ant-menu-item-selected').first().textContent()) ?? '';
check('Trang chi tiết: breadcrumb đúng, menu "Người dùng" được chọn', crumbs.includes('Hệ thống') && crumbs.includes('Chi tiết') && selectedMenu.includes('Người dùng'), `${crumbs} | menu: ${selectedMenu}`);

// 6. Demo refresh token
await page.getByRole('menuitem', { name: /Tổng quan/ }).click();
await page.waitForURL(/\/dashboard$/);
await page.getByRole('button', { name: 'Chạy thử' }).click();
const refreshLog = await page.locator('.ant-alert-success').textContent({ timeout: 15000 });
check('Token hết hạn + 5 request song song -> 5/5 OK, refresh 1 lần, /users nhận đúng 10 request', /5\/5 thành công · refresh được gọi 1 lần · API \/users nhận 10 request/.test(refreshLog ?? ''), refreshLog);
await page.screenshot({ path: OUT + '04-dashboard-refresh.png' });

// 7. Dark mode + English
await page.getByRole('button', { name: /Giao diện tối/ }).click();
await page.getByRole('button', { name: /Ngôn ngữ/ }).click();
await page.getByRole('menuitem', { name: 'English' }).click();
await page.getByRole('menuitem', { name: 'Dashboard' }).waitFor();
const theme = await page.evaluate(() => document.documentElement.dataset.theme);
check('Đổi dark mode + tiếng Anh (menu dịch theo)', theme === 'dark', `data-theme=${theme}`);
await page.screenshot({ path: OUT + '05-dark-en.png' });
// trả về như cũ
await page.getByRole('button', { name: /Light theme/ }).click();
await page.getByRole('button', { name: /Language/ }).click();
await page.getByRole('menuitem', { name: 'Tiếng Việt' }).click();

// 8. Reload trang vẫn giữ phiên
await page.reload();
await page.getByRole('menuitem', { name: /Tổng quan/ }).waitFor();
check('F5 vẫn giữ đăng nhập (token persist, tải lại quyền)', page.url().endsWith('/dashboard'));

// 8b. Trang Component mẫu (component đem từ Kit cũ)
await page.goto(`${BASE}/components`);
await page.getByRole('tab', { name: 'Nút' }).waitFor();
const editBtn = page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).first();
const iconBefore = await editBtn.locator('svg').innerHTML();
await editBtn.hover();
await page.waitForTimeout(150);
const iconAfter = await editBtn.locator('svg').innerHTML();
check('PortalButton: rê chuột thì icon đổi sang bản đặc', iconBefore !== iconAfter);
const actionCount = await page.locator('.ant-card').first().locator('.ant-btn').count();
check('PortalButton: đủ 45 actionType', actionCount === 45, `${actionCount} nút`);
await page.screenshot({ path: OUT + '09-components-buttons.png' });

await page.getByRole('tab', { name: 'Form' }).click();
await page.waitForURL(/tab=form/);
check('PortalTabs (mode query): đổi tab cập nhật ?tab= trên URL', true, page.url().replace(BASE, ''));
const plate = page.getByLabel('PortalInput — textType uppercase');
await plate.fill('30a-123.45');
check('PortalInput textType=uppercase', (await plate.inputValue()) === '30A-123.45', await plate.inputValue());
const phone = page.getByLabel('PortalInput — regexRule chỉ số');
await phone.pressSequentially('09a1b2');
check('PortalInput regexRule chặn chữ', (await phone.inputValue()) === '0912', await phone.inputValue());
const salary = await page.getByLabel('PortalNumberInput — currency').inputValue();
check('PortalNumberInput currency có phân cách hàng nghìn', salary === '15,000,000', salary);
await page.getByLabel('PortalRangePicker (có chọn nhanh)').click();
const presets = page.locator('.ant-picker-presets li');
await presets.first().waitFor();
const presetLabels = await presets.allInnerTexts();
await presets.filter({ hasText: 'Hôm nay' }).click();
check('PortalRangePicker có chọn nhanh (Hôm nay, Tuần này...)', presetLabels.includes('Tuần này') && presetLabels.length === 5, presetLabels.join(', '));
await page.getByLabel('Tỉnh/Thành (PortalSelect)').click();
await page.locator('.ant-select-item-option', { hasText: 'Hà Nội' }).click();
await page.getByLabel('Quận/Huyện — phụ thuộc Tỉnh (requiredParamKeys)').click();
await page.locator('.ant-select-item-option', { hasText: 'Ba Đình' }).waitFor({ timeout: 5000 });
check('PortalSelect phụ thuộc: chọn tỉnh mới tải quận/huyện', true);
await page.locator('.ant-select-item-option', { hasText: 'Ba Đình' }).click();
await page.getByLabel('PortalTreeSelect — cây đơn vị').click();
await page.locator('.ant-select-tree-title', { hasText: 'Phòng CNTT' }).waitFor({ timeout: 5000 });
check('PortalTreeSelect tải cây đơn vị từ API', true);
await page.keyboard.press('Escape');
const preview = await page.locator('text=Giá trị:').locator('code').innerText();
check(
  'Form nhận đúng giá trị (ISO date range, districtId...)',
  preview.includes('"plate":"30A-123.45"') && preview.includes('"districtId":"1-1"') && preview.includes('"range":["'),
  preview.slice(0, 160),
);
await page.screenshot({ path: OUT + '10-components-form.png', fullPage: true });

await page.getByRole('tab', { name: 'File & ảnh' }).click();
await page.locator('.ant-image-img[src^="blob:"]').first().waitFor({ timeout: 8000 });
check('PortalBlobImage tải ảnh có token (blob URL)', true);
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Tải file mẫu', exact: true }).click();
const download = await downloadPromise;
check('PortalDownloadButton tải file, lấy tên từ Content-Disposition', download.suggestedFilename() === 'mau-nhap-nguoi-dung.csv', download.suggestedFilename());
const csvPath = OUT + 'import.csv';
await download.saveAs(csvPath);
await page.locator('.ant-upload-drag input[type=file]').setInputFiles(csvPath);
await page.locator('.ant-table-row', { hasText: 'nguyen.van.mau' }).waitFor({ timeout: 5000 });
const sheetPreview = await page.locator('text=Giá trị:').last().locator('code').innerText();
check('PortalSheetUpload đọc Excel/CSV → bảng xem trước + giá trị đã map', sheetPreview.includes('"username":"tran.thi.thu"'), sheetPreview.slice(0, 120));
await page.screenshot({ path: OUT + '11-components-file.png', fullPage: true });

await page.getByRole('tab', { name: 'Bảng chuyển' }).click();
const rightList = page.locator('.ant-transfer-list').nth(1);
await rightList.locator('.ant-table-row').first().waitFor({ timeout: 5000 });
const memberRows = await rightList.locator('.ant-table-row').count();
check('PortalTableTransfer hiện đúng thành viên ban đầu', memberRows === 2, `${memberRows} dòng`);
const countTransfer = page.locator('.ant-transfer').nth(1);
await countTransfer.locator('.ant-transfer-list').first().locator('.ant-table-row', { hasText: 'Đầu ghi NVR' }).click();
await countTransfer.locator('.ant-transfer-operation button').first().click();
const allocationPreview = await page.locator('text=Giá trị:').last().locator('code').innerText();
check('PortalTableCountTransfer chuyển theo số lượng', allocationPreview.includes('"deviceId":"NVR"') && allocationPreview.includes('"quantity":4'), allocationPreview);
await page.screenshot({ path: OUT + '12-components-transfer.png', fullPage: true });
await page.goto(`${BASE}/dashboard`);

// 9. Logout -> viewer: menu ẩn Cài đặt, không có nút Thêm/Sửa/Xoá, URL trực tiếp -> 403
await page.locator('.ant-layout-header').getByRole('button', { name: /Quản trị viên/ }).click();
await page.getByRole('menuitem', { name: /Đăng xuất/ }).click();
await page.waitForURL(/\/auth\/login/);
check('Đăng xuất -> về trang login', true);
await login('viewer');
await page.waitForURL(/\/dashboard$/);
await page.getByRole('menuitem', { name: /Hệ thống/ }).click();
const settingsVisible = await page.getByRole('menuitem', { name: /Cài đặt/ }).count();
check('Viewer: menu không có "Cài đặt"', settingsVisible === 0);
await page.getByRole('menuitem', { name: /Người dùng/ }).click();
await page.locator('.ant-table-row').first().waitFor();
const viewerButtons = await page.locator('.ant-table-row').first().locator('td').last().locator('button').count();
const createBtn = await page.getByRole('button', { name: /Thêm mới/ }).count();
check('Viewer: chỉ còn nút Xem, không có nút Thêm mới', viewerButtons === 1 && createBtn === 0, `${viewerButtons} nút, thêm mới=${createBtn}`);
await page.screenshot({ path: OUT + '06-users-viewer.png' });
await page.goto(`${BASE}/system/settings`);
await page.locator('.ant-result-403').waitFor({ timeout: 8000 });
check('Viewer gõ thẳng /system/settings -> trang 403', true);
await page.screenshot({ path: OUT + '07-forbidden.png' });
await page.goto(`${BASE}/khong-ton-tai`);
await page.locator('.ant-result-404').waitFor({ timeout: 8000 });
check('URL không tồn tại -> trang 404', true);

// 10. Mobile
await page.setViewportSize({ width: 390, height: 800 });
await page.goto(`${BASE}/system/users`);
await page.locator('.ant-table-row').first().waitFor();
const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
check('Mobile 390px: không tràn ngang trang', !hasHScroll);
await page.screenshot({ path: OUT + '08-mobile.png' });

const relevantErrors = consoleErrors.filter(e => !/favicon|Download the React DevTools/.test(e));
check('Không có lỗi console', relevantErrors.length === 0, relevantErrors.slice(0, 5).join(' || '));

await browser.close();
const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);

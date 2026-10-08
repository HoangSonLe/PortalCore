# @hoangsonle/portal-core

Core FE dùng chung cho các web quản trị / portal cá nhân: **provider gốc, đăng nhập + refresh token, HTTP client, router phân quyền, layout, i18n, theme sáng/tối và bộ component quản trị** — cài vào dự án như một package, dự án chỉ việc viết API + trang nghiệp vụ.

| | |
|---|---|
| Stack | React 19 · antd 5.29 · ProComponents 2.8 · react-router 7 · zustand 5 · axios · TypeScript 5.9 · Vite 7 |
| Kích thước | ~120 kB JS (chưa minify), không bundle antd/react — app dùng chung bản của mình |
| Kiểm thử | 55 unit/component test + smoke test cài từ tarball + 32 kịch bản e2e trên Chrome thật; CI GitHub Actions (xem [Kiểm thử](#9-kiểm-thử)) |

Mục lục: [1. Chạy thử preview](#1-chạy-thử-preview-5-phút) · [2. Cấu trúc](#2-cấu-trúc-thư-mục) · [3. Dùng trong dự án](#3-dùng-trong-dự-án-mới) · [4. Auth adapter](#4-auth-adapter--nối-với-backend) · [5. Route & phân quyền](#5-route--phân-quyền) · [6. Component](#6-component--hook) · [7. i18n, theme, env](#7-i18n-theme-runtime-env) · [8. Build & phát hành](#8-build--phát-hành) · [9. Kiểm thử](#9-kiểm-thử) · [10. Review thiết kế](#10-review-thiết-kế--so-với-các-core-công-ty) · [11. Giới hạn & roadmap](#11-giới-hạn-hiện-tại--roadmap)

---

## 1. Chạy thử preview (5 phút)

App preview nằm trong `preview/`, import thẳng source của core và dùng **backend giả chạy trong trình duyệt** — không cần server.

```bash
cd D:\repos\Private\PortalCore
npm install
npm run dev          # http://localhost:5180
```

Tài khoản demo (mật khẩu = tên đăng nhập):

| Tài khoản | Quyền | Sẽ thấy |
|---|---|---|
| `admin` | `*` (toàn quyền) | Mọi menu, đủ nút Thêm/Sửa/Xoá |
| `editor` | xem/thêm/sửa user | Không có nút Xoá, không có menu Cài đặt |
| `viewer` | chỉ xem | Chỉ nút Xem; gõ thẳng `/system/settings` ra trang 403 |

**Kịch bản nên thử:**

1. Mở `http://localhost:5180/system/users` khi chưa đăng nhập → bị đưa về login, đăng nhập xong **quay lại đúng trang đó**.
2. Nhập sai mật khẩu → lỗi hiện ngay trong form (message lấy từ server).
3. **Người dùng**: lọc theo từ khoá / vai trò / trạng thái, sắp xếp cột, đổi trang — tất cả xử lý phía "server".
4. **Thêm mới** với email `admin@demo.local` → toast "Email đã tồn tại", modal vẫn mở để sửa.
5. Bấm tên 1 người → trang chi tiết: breadcrumb `Hệ thống / Chi tiết người dùng`, menu vẫn sáng mục "Người dùng".
6. **Tổng quan → Thử refresh token → Chạy thử**: làm hết hạn token rồi bắn 5 request cùng lúc → `5/5 thành công · refresh được gọi 1 lần · /users nhận 10 request`.
7. Đổi sáng (kiểu ANVL) / tối (kiểu C10), đổi EN/VI (menu dịch theo). Trang **Component mẫu** có 5 tab: Nút (45 `actionType`), Form (input, số tiền, ngày, select gọi API, select phụ thuộc, cây đơn vị, bật/tắt chỉ đọc), File & ảnh (avatar, ảnh cần token, nhập Excel), Bảng chuyển, Khác.
8. F5 → vẫn đăng nhập. Đăng xuất → vào bằng `viewer` để thấy phân quyền thay đổi.
9. Thu cửa sổ về cỡ điện thoại → menu chuyển thành nút trên header.

Muốn về dữ liệu mẫu ban đầu: **Tổng quan → Reset dữ liệu demo**.

## 2. Cấu trúc thư mục

```
src/
  core/         PortalProvider (gốc app), context, hooks: useAuth, usePermission, useT, useHttp, useEnv, useAppSettings
  http/         createHttpClient (axios + refresh token single-flight), HttpError
  auth/         AuthAdapter (interface), createRestAuthAdapter, auth service
  stores/       zustand store: auth (chỉ persist token), app (theme, ngôn ngữ, thu gọn menu)
  router/       AppRoute, PortalRouter (guard login/guest, 403/404, redirect trang chủ), utils lọc route/menu/breadcrumb
  layouts/      AppLayout (sider + header + breadcrumb), AuthLayout, ThemeSwitch, LocaleSwitch, UserMenu
  pages/        LoginPage, ForgotPasswordPage, NotFoundPage, ForbiddenPage
  permission/   hasPermission, <Can>, withPermission
  components/   Các component Portal* cùng tên + API với Kit cũ (bảng, nút, input, select, ngày, upload, Excel, transfer...), StatusTag + createMapping, PageContainer
  theme/        themes.ts: lightTheme (kiểu ANVL) + darkTheme (kiểu C10) — ThemeConfig antd thuần
  hooks/        useRequest, useDisclosure, useCrudPage
  dev/          createMockAdapter (backend giả trong trình duyệt)
  i18n/ theme/ env/ utils/
preview/        App demo + mock backend (mock/backend.ts) — cũng là ví dụ cách dùng chuẩn
template/       Khung dự án mới (npm run create-app): Vite + Dockerfile + nginx + env.sh
scripts/        create-app.mjs, smoke-consumer.mjs
tests/          Unit + component test (Vitest + Testing Library)
e2e/            Kịch bản Playwright chạy trên preview
.github/        CI: lint, format, typecheck, test, build, smoke, e2e
```

## 3. Dùng trong dự án mới

### 3.1 Cách nhanh nhất: tạo từ template

```bash
cd D:\repos\Private\PortalCore
npm run create-app -- ../MyApp --title "Quản lý kho"
cd ../MyApp && npm install && cp .env.example .env.local && npm run dev   # admin / admin
```

Dự án mới có sẵn: `main.tsx`, routes, tầng API, backend giả (`src/api/mock.ts`), một trang CRUD mẫu dùng `useCrudPage`, Dockerfile + nginx + script sinh `env.js` lúc container khởi động. Core được đóng gói bằng `npm pack` và cài từ `vendor/*.tgz` (không symlink nên không bị trùng React). Muốn cài từ GitHub: `--core github:HoangSonLe/PortalCore#v0.3.0`.

### 3.1b Cài thủ công vào dự án có sẵn

```bash
# Từ tarball (khuyên dùng khi chưa publish): trong repo core
npm run build && npm pack          # -> hoangsonle-portal-core-x.y.z.tgz
# trong dự án
npm install ../PortalCore/hoangsonle-portal-core-x.y.z.tgz

# Hoặc từ GitHub (sau khi push repo)
npm install github:HoangSonLe/PortalCore#v0.3.0
```

Cài peer dependency (dùng chung bản với app):

```bash
npm install react react-dom antd @ant-design/icons @ant-design/pro-components react-router dayjs @ant-design/v5-patch-for-react-19
```

### 3.2 Khung tối thiểu

```ts
// src/api/http.ts — tạo 1 lần ở module level
import { createHttpClient, createRestAuthAdapter, readRuntimeEnv } from '@hoangsonle/portal-core';

export const env = readRuntimeEnv({ API_URL: import.meta.env.VITE_API_URL });

export const http = createHttpClient({ baseURL: env.API_URL ?? '/api' });

export const authAdapter = createRestAuthAdapter(http, {
  endpoints: { login: '/auth/login', refresh: '/auth/refresh', logout: '/auth/logout', session: '/auth/me' },
});
```

```tsx
// src/main.tsx
import '@ant-design/v5-patch-for-react-19'; // bắt buộc khi dùng antd 5 với React 19
import { PortalProvider } from '@hoangsonle/portal-core';
import { createRoot } from 'react-dom/client';

import { authAdapter, env, http } from './api/http';
import { routes } from './routes';

const app = { code: 'my-app', name: 'My App', version: '1.0.0', logo: <img src="/logo.svg" width={32} /> };

createRoot(document.getElementById('root')!).render(
  <PortalProvider app={app} routes={routes} http={http} auth={authAdapter} env={env} />,
);
```

Vậy là đủ: có trang login, layout, menu theo quyền, 403/404, đổi theme/ngôn ngữ, refresh token.

> `http`, `authAdapter`, `routes` nên khai báo ở module level (hoặc `useMemo`) — đừng tạo mới mỗi lần render.

### 3.3 Viết tầng API

`http.get/post/put/patch/delete` trả về **`response.data` nguyên vẹn**, core không ép format response:

```ts
export const userApi = {
  // Dùng thẳng làm `request` của PortalTable: nhận (params, sort) của ProTable.
  // Backend trả { items, totalItems } -> map về { data, total }.
  list: async (params: UserQuery, sort?: Record<string, SortOrder>): Promise<PageResult<User>> => {
    const res = await http.get<{ items: User[]; totalItems: number }>('/users', { params });
    return { data: res.items, total: res.totalItems };
  },
  detail: (id: number) => http.get<User>('/users/:id', { pathVars: { id } }),
  create: (input: UserInput) => http.post<User>('/users', input, { notify: { success: 'Đã thêm' } }),
  remove: (id: number) => http.delete('/users/:id', { pathVars: { id }, notify: { success: 'Đã xoá' } }),
};
```

Tuỳ chọn mỗi request (ngoài mọi option của axios):

| Option | Ý nghĩa |
|---|---|
| `pathVars` | Thay `:id` trong URL (có encode) |
| `params` / `body` | Query string / request body |
| `notify.success` | Toast thành công với nội dung này |
| `notify.error` | `false` = không toast lỗi; string = thay câu lỗi |
| `skipAuth` | Không gắn `Authorization` (API public) |
| `skipRefresh` | Không tự refresh khi 401 |

Lỗi luôn được ném ra dạng `HttpError` (`status`, `data`, `serverMessage`), mặc định đã toast bằng message server trả về (`message` / `error` / `title` / `detail`). Cần header riêng cho mọi request (tenant, ngôn ngữ...): `createHttpClient({ getHeaders: () => ({ 'X-Tenant-Id': tenantId }) })`. Cần nguyên `AxiosResponse` (tải file, đọc header): `http.raw('get', url, { responseType: 'blob' })`.

## 4. Auth adapter — nối với backend

Core **không biết** endpoint hay format của backend; mọi thứ đi qua `AuthAdapter`:

```ts
interface AuthAdapter {
  login(credentials): Promise<AuthTokens>;          // { accessToken, refreshToken? }
  getSession(): Promise<AuthSession>;               // { user: { id, name, ... }, permissions: string[] }
  refresh?(refreshToken): Promise<AuthTokens>;      // bỏ trống = không refresh, 401 là logout
  logout?(tokens): Promise<void>;
  forgotPassword?(email): Promise<void>;            // có thì trang login hiện "Quên mật khẩu?"
}
```

**Backend REST thường** → `createRestAuthAdapter(http, { endpoints, mapTokens?, mapSession?, refreshBody? })`. Mặc định đọc được `{ accessToken }`, `{ access_token }`, `{ data: {...} }` và `{ value: {...} }`.

**Ví dụ cho base `.NET` của bạn (`NetCoreLibrary`)** — login/refresh trả `ValueResponse<JwtToken>`, refresh nhận `[FromBody] string`:

```ts
import type { AuthAdapter } from '@hoangsonle/portal-core';

export const dotnetAuthAdapter: AuthAdapter = {
  login: async ({ username, password }) => {
    const res = await http.post<{ value: { accessToken: string; refreshToken: string } }>(
      '/Auth/login',
      { userName: username, password },
      { skipAuth: true, skipRefresh: true, notify: { error: false } },
    );
    return res.value;
  },
  refresh: async refreshToken => {
    const res = await http.post<{ value: { accessToken: string; refreshToken: string } }>(
      '/Auth/refresh-token',
      JSON.stringify(refreshToken), // [FromBody] string cần chuỗi JSON
      { skipAuth: true, skipRefresh: true, notify: { error: false }, headers: { 'Content-Type': 'application/json' } },
    );
    return res.value;
  },
  logout: async () => void (await http.post('/Auth/logout', undefined, { skipRefresh: true, notify: { error: false } })),
  // Cần thêm 1 endpoint trả user + danh sách mã quyền, vd GET /api/Users/me
  getSession: async () => {
    const res = await http.get<{ value: { id: string; fullName: string; permissions: string[] } }>('/Users/me');
    return { user: { id: res.value.id, name: res.value.fullName }, permissions: res.value.permissions };
  },
};
```

`PageResponse<T>` của base .NET đã có sẵn `data` + `total` nên trả thẳng cho `PortalTable` được; chỉ cần đổi query `current/pageSize` → `page/size`.

**Supabase / Firebase / OAuth redirect**: tự viết adapter tương tự, hoặc truyền `pages={{ login: <MySsoLoginPage /> }}` để thay trang login.

**Luồng chạy:** mở app có token → gọi `getSession()` (hiện loading) → vào trang. Request bị 401 → refresh **1 lần duy nhất** dù nhiều request cùng lỗi → gửi lại mỗi request đúng 1 lần → refresh thất bại thì xoá phiên, về login kèm `?redirect=` trang đang đứng.

## 5. Route & phân quyền

```tsx
const UserListPage = lazy(() => import('./pages/UserListPage')); // AppLayout đã bọc Suspense

export const routes: AppRoute[] = [
  { path: 'dashboard', title: 'menu.dashboard', icon: <DashboardOutlined />, element: <Dashboard /> },
  {
    path: 'system', title: 'menu.system', icon: <SettingOutlined />, // không có element = nhóm menu
    children: [
      { path: 'users', title: 'menu.users', permission: 'user.view', element: <UserListPage /> },
      { path: 'users/:id', title: 'menu.userDetail', permission: 'user.view', hideInMenu: true, element: <UserDetail /> },
      { path: 'settings', title: 'menu.settings', permission: ['setting.manage', 'admin'], permissionMode: 'any', element: <Settings /> },
    ],
  },
];
```

| Thuộc tính | Tác dụng |
|---|---|
| `title` | Menu, breadcrumb, tiêu đề tab, tiêu đề `PageContainer`. i18n key hoặc text thường |
| `permission` + `permissionMode` | Thiếu quyền: ẩn khỏi menu; vào thẳng URL ra trang 403 |
| `hideInMenu` | Có route nhưng không hiện menu (trang chi tiết). Menu tự sáng mục cha theo URL |
| `children` không có `element` | Thành submenu; vào `/system` tự chuyển tới trang con đầu tiên được phép |

Trang chủ `/` tự chuyển tới trang đầu tiên user được phép vào. Quyền là mảng mã phẳng do `getSession()` trả về; `'*'` = toàn quyền.

Trong code:

```tsx
<Can permission="user.create"><Button>Thêm</Button></Can>
const can = usePermission();  can(['user.create', 'user.update'], 'any');
export default withPermission(ReportPage, 'report.view');       // thiếu quyền -> 403
```

## 6. Component & hook

Các component bảng/nút có **cùng tên và cùng API với PortalKit cũ** (viết lại, dùng icon của `@ant-design/icons`), nên code cũ chuyển sang gần như không phải sửa.

**`PortalTable`** — ProTable cấu hình sẵn:

```tsx
<PortalTable<User>
  actionRef={actionRef}
  columns={columns}                 // ProColumns như ProTable; mặc định search: false (thêm search: true để lọc theo cột)
  request={userApi.list}            // (params, sort, filter) => { data, total }
  pagination={{ defaultPageSize: 10 }}   // mặc định 50, có chọn 10/20/50/100/200
  searchFormItems={[                // ô tìm kiếm không gắn với cột nào
    { formItemProps: { name: 'keyword', label: 'Từ khoá' }, renderFormItem: () => <Input allowClear /> },
  ]}
  actionColumn={{
    renderButtons: record => [
      { actionType: 'view', onClick: () => navigate(`/users/${record.id}`) },
      { actionType: 'edit', permissionCode: 'user.update', onClick: () => editor.show(record) },
      { actionType: 'delete', permissionCode: 'user.delete', popConfirm: { title: 'Xoá?' },
        onClick: async () => { await userApi.remove(record.id); actionRef.current?.reload(); } },
    ],
  }}
/>
```

Mặc định có cột **STT** đánh số liên tục qua các trang (`indexColumn={false}` để tắt), nút Làm mới / Tìm kiếm, toolbar reload + cài đặt cột + toàn màn hình. **Cài đặt cột (ẩn/hiện, thứ tự, ghim) được nhớ theo từng trang** (`persistColumns`, truyền string khi 1 trang có nhiều bảng, `false` để tắt). Lỗi API → bảng rỗng thay vì treo loading.

**`useCrudPage` + `PortalModalForm`** — gom phần lặp lại của trang danh mục (bảng, modal thêm/sửa, xoá, tải lại):

```tsx
const crud = useCrudPage<User>({ remove: user => userApi.remove(user.id) });

<PortalButton type="primary" actionType="add" onClick={crud.openCreate} />
<PortalTable actionRef={crud.actionRef} request={userApi.list} columns={columns}
  actionColumn={{ renderButtons: user => [
    { actionType: 'edit', onClick: () => crud.openEdit(user) },
    { actionType: 'delete', popConfirm: { title: 'Xoá?' }, onClick: () => crud.removeRecord(user) },
  ] }} />
<PortalModalForm<User, UserInput> {...crud.formProps}
  title={{ create: 'Thêm người dùng', edit: u => `Sửa: ${u.name}` }}
  create={userApi.create} update={(u, values) => userApi.update(u.id, values)}>
  <ProFormText name="name" label="Họ tên" rules={[{ required: true }]} />
</PortalModalForm>
```

Lỗi API khi lưu → modal giữ nguyên (lỗi đã được toast); lưu xong → đóng modal + tải lại bảng. Xem trang mẫu hoàn chỉnh ở `template/src/pages/CategoryListPage.tsx`.

**`createMockAdapter`** — backend giả chạy trong trình duyệt, để làm UI trước khi có API:

```ts
const http = createHttpClient({
  adapter: env.USE_MOCK === 'true' ? createMockAdapter({ routes: [
    ['post', '/auth/login', ({ body }) => ({ accessToken: 'x' })],
    ['get', '/users/:id', ({ pathVars, token }) => findUser(pathVars.id)],
    ['delete', '/users/:id', () => { throw new MockError(403, 'Không có quyền'); }],
    ['get', '/reports/users', () => mockFile(blob, 'nguoi-dung.xlsx')],
  ] }) : undefined,
});
```

**`ErrorBoundary`** — đã bọc sẵn quanh nội dung trang (reset khi đổi URL) và quanh toàn app: trang lỗi hiện thông báo + nút Thử lại / Tải lại thay vì trắng màn hình. Lỗi tải file JS sau khi deploy bản mới → tự tải lại trang 1 lần. Gửi lỗi đi đâu đó: `<PortalProvider onError={(error, info) => Sentry.captureException(error)} />`.

**`PortalButton`** — 45 `actionType` có sẵn nhãn + icon, cùng danh sách và cùng chữ với Kit cũ (`add` → "Thêm mới", `view` → "Xem chi tiết", `approve` → "Phê duyệt", `transfer-process` → "Chuyển xử lý"...). Xem đủ ở [PortalButton.tsx](src/components/PortalButton.tsx) hoặc tab Nút của preview.

```tsx
<PortalButton type="primary" actionType="add" permissionCode="user.create" onClick={...} />
<PortalButton actionType="delete" popConfirm={{ title: 'Xoá bản ghi này?' }} onClick={async () => ...} />
<PortalButton actionType="export" hiddenChildren />      {/* chỉ icon, nhãn ở tooltip */}
```

`permissionCode` thiếu quyền thì không render; `onClick` trả Promise thì nút tự loading; `delete` tự màu đỏ; **rê chuột thì icon đổi sang bản đặc** như Kit (`filledIcon` để tự chọn icon). **`PortalTableActionButton`** = nhóm nút icon dùng trong cột thao tác; **`MoreButtonGroup`** = nút "Thêm ▾" gom thao tác phụ (nút có `popConfirm` hỏi lại bằng modal).

**`createMapping` + `StatusTag`** — khai báo trạng thái 1 lần, dùng khắp nơi:

```ts
export const userStatus = createMapping([
  { value: 'ACTIVE', label: 'status.active', color: 'success' },
  { value: 'LOCKED', label: 'status.locked', color: 'error' },
] as const);

<StatusTag mapping={userStatus} value={record.status} />     // Tag có màu
userStatus.toOptions(t)                                       // cho <Select options>
userStatus.toValueEnum(t)                                     // cho valueEnum của ProTable (ô lọc)
```

### Các component khác đem từ Kit cũ

Viết lại, giữ tên + prop như Kit; đã sửa vài lỗi của bản cũ (ghi ở cột cuối).

| Component | Dùng để | Khác / sửa so với Kit |
|---|---|---|
| `PortalSelect` | Select gọi API: `request`, `labelKey`, `valueKey`, `requestParams`, `requiredParamKeys` (select phụ thuộc), `customValue`, `initValue`, `extraOptions` | Thêm `searchMode="local"` (tải 1 lần, lọc không dấu). Nhận `T[]`, `{data}` hoặc `{value}` |
| `PortalEnumSelect` | Select từ enum + `prefixLocale`, `hasAllOption` ("Tất cả") | Nhận thẳng `mapping` của `createMapping` |
| `PortalTreeSelect` | Chọn cây (đơn vị, phòng ban) từ API, `treeSelectKey` | Giữ nhãn mục đã chọn khi tìm kiếm |
| `PortalInput` | `textType` (viết hoa, capitalize...), `regexRule`, `readOnly` | `regexRule` giờ **có tác dụng** (Kit khai báo nhưng không dùng); `onChange` báo ngay, `debounceTime` tuỳ chọn và tự báo khi blur (Kit trễ 500ms → bấm Lưu nhanh mất ký tự) |
| `PortalInputTextArea` | Textarea có `readOnly` | Như trên |
| `PortalNumberInput` | Số có phân cách hàng nghìn, `inputType="currency"` (VNĐ, bước 1.000) | Không nhóm nhầm phần thập phân; đổi được `separator` |
| `PortalDatePicker` / `PortalRangePicker` | Nhận/trả chuỗi, định dạng kiểu VN, chọn nhanh Hôm nay / Tuần này / Tháng này / 7 ngày / 30 ngày | Mốc chọn nhanh tính lúc mở (Kit tính 1 lần lúc tải trang → qua nửa đêm sai ngày). **`valueFormat`**: mặc định `'iso'` như Kit; ô chỉ có ngày (ngày sinh, ngày hiệu lực) nên dùng `valueFormat="YYYY-MM-DD"` để không bị lệch ngày do múi giờ (ISO của 08/10 lúc 0h giờ VN là `2026-10-07T17:00:00Z`) |
| `PortalDownloadButton` | Tải file: `url`, `filename`, `buttonProps` | Đi qua HttpClient nên **gắn token + tự refresh**; tự đọc tên file từ `Content-Disposition` |
| `PortalUpload` | Upload nhiều ảnh dạng thẻ, bấm xem lớn | Dùng được dạng controlled (`fileList`) |
| `PortalUploadAvatar` | Chọn ảnh → (cắt) → upload → trả URL | Truyền `upload(file) => Promise<url>`; cắt ảnh: `imgCrop={ImgCrop}` (core không phụ thuộc `antd-img-crop`) |
| `PortalBlobImage` | Hiện ảnh từ server cần đăng nhập | Kit không gắn token và rò bộ nhớ blob; bản này gắn token + giải phóng URL |
| `PortalTabs` | Tab đồng bộ URL | Thêm `mode="query"` (`?tab=`), không phải sửa route |
| `PortalSheetUpload` | Nhập Excel: kéo thả → xem trước → chọn dòng, tải file mẫu | Truyền `xlsx={XLSX}`; cài SheetJS từ CDN chính thức (bản `xlsx` trên npm đã cũ, có lỗ hổng): `npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` |
| `PortalTableTransfer` | Chuyển bản ghi giữa 2 bảng (gán user vào nhóm), có bộ lọc 2 bên | |
| `PortalTableCountTransfer` | Chuyển theo số lượng (phân bổ thiết bị) | Viết lại gọn hơn, cùng `valueFormatter` |
| `ReadOnlyProvider` | Chế độ chỉ đọc dùng chung: field disabled nhưng chữ vẫn rõ | |

Không đem: `PortalStatusChip` (đã có `StatusTag`), `PortalPage`/`PortalParentPage` (đã có `PageContainer`), `PortalRowInfoItem` (dùng `Descriptions`), `PortalDropdownButton` (đã có `MoreButtonGroup`), `PortalImage` (ảnh minh hoạ của công ty), 16 component bản đồ (rất nặng — làm khi có dự án bản đồ).

**Về icon:** Kit dùng 150 file SVG tự vẽ (`PortalIcon`), không ghi nguồn/license nên nhiều khả năng là tài sản thiết kế của công ty, và nhiều icon chỉ có nghĩa với nghiệp vụ OTS (`accident-vehicle`, `mobilize`...). Core dùng `@ant-design/icons` (đã có sẵn, khớp antd, tree-shake được) và giữ hiệu ứng đổi sang bản đặc khi rê chuột bằng các cặp `Outlined`/`Filled` của antd.


**`PageContainer`** — tiêu đề (mặc định lấy từ route) + mô tả + nút góc phải.

**`useRequest(service, { manual, deps, onSuccess })`** → `{ data, loading, error, run, refresh }`, tự bỏ kết quả của lần gọi cũ về muộn. **`useDisclosure<T>()`** → `{ open, data, show(data), hide }` cho modal/drawer.

Hook khác: `useAuth()` (user, permissions, login, logout, reloadSession), `useAppSettings()` (theme, locale), `useT()`, `useHttp()`, `useEnv()`, `useCurrentRoute()`.

## 7. i18n, theme, runtime env

**i18n** — từ điển phẳng, `t('key', { name })`, không có key thì trả nguyên chuỗi (nên truyền text thường cũng được). App merge thêm từ điển:

```tsx
<PortalProvider i18n={{ defaultLocale: 'vi', locales: ['vi', 'en'], messages: { vi: {...}, en: {...} } }} />
```

Chỉ 1 ngôn ngữ (`locales: ['vi']`) thì nút đổi ngôn ngữ tự ẩn. Đổi ngôn ngữ cũng đổi locale của antd và dayjs.

**Theme** — 2 theme có sẵn, đều là `ThemeConfig` antd thuần (giống `configs/theme2` của C10), nằm ở [src/theme/themes.ts](src/theme/themes.ts):

| | Sáng (mặc định) — kiểu ANVL | Tối — kiểu C10 |
|---|---|---|
| Sidebar | `#2f4050`, mục chọn nền `#1ab394` | `#1E293B`, mục chọn chữ cyan |
| Nội dung | nền `#f3f3f4`, card trắng, header trắng | nền `#131B2B`, card `#1E293B` |
| Màu chính | `#1ab394` (link `#1c84c6`) | `#1CB2ED` |

Đổi màu/token cho dự án: `theme={{ defaultMode: 'light', light: { token: { colorPrimary: '#1677ff' } }, dark: { components: { Table: {...} } } }}` — merge lên theme có sẵn. Lựa chọn sáng/tối và ngôn ngữ của người dùng được nhớ theo từng app (`app.code`).

**Runtime env** — build 1 lần, deploy nhiều môi trường. `index.html` nạp `/env.js` trước app:

```html
<script src="/env.js"></script>
```

Khi container khởi động, sinh `env.js` từ biến môi trường (ví dụ Docker + nginx):

```sh
#!/bin/sh
# docker-entrypoint.d/40-env.sh
cat > /usr/share/nginx/html/env.js <<EOF
window.__APP_ENV__ = { API_URL: "${API_URL}", APP_ENV: "${APP_ENV}" };
EOF
```

Trong app: `readRuntimeEnv({ API_URL: import.meta.env.VITE_API_URL })` — giá trị runtime đè lên giá trị lúc build. Chỉ để cấu hình **công khai** (URL, cờ tính năng), không để secret.

**Sub-path** — app chạy dưới `/admin`: `basePath="/admin"` (+ `base: '/admin/'` trong vite config). Nhiều app chung domain: mỗi app 1 `app.code` để token và setting không đè nhau.

## 8. Build & phát hành

```bash
npm run lint          # ESLint 9 (typescript-eslint + rules-of-hooks/exhaustive-deps)
npm run format        # Prettier ghi đè; format:check để kiểm tra
npm run typecheck     # tsc toàn bộ (src + preview + tests)
npm test              # unit + component test
npm run build         # -> dist/ (ESM, giữ cấu trúc module để tree-shake, kèm .d.ts + sourcemap)
npm run smoke         # build -> npm pack -> tạo app từ template -> cài tarball -> tsc + build
npm run dev && npm run e2e   # e2e trên preview (Chrome có sẵn; đổi bằng CHROME_PATH)
npm run build:preview # build app demo -> preview-dist/
npm run create-app -- <thư-mục> [--title "..."] [--core <spec>]
```

**Quy trình phát hành (changesets):**

1. Mỗi thay đổi đáng ghi lại: `npm run changeset` → chọn patch / minor / major + mô tả ngắn (tạo file trong `.changeset/`, commit cùng code).
2. Khi phát hành: `npm run release:version` → tăng `version` trong `package.json` + ghi [CHANGELOG.md](CHANGELOG.md).
3. `git commit -am "release: vX.Y.Z" && git tag vX.Y.Z && git push --follow-tags` → các dự án cài qua `github:HoangSonLe/PortalCore#vX.Y.Z` (hoặc `npm publish` nếu muốn lên npm).

**CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) chạy mỗi lần push / PR: lint → format → typecheck → test → build → smoke, rồi e2e trên Chrome của runner (ảnh chụp lưu ở artifact `e2e-shots`). **Không commit `.npmrc` có token** (đã có trong `.gitignore`).

## 9. Kiểm thử

**Unit + component test (`npm test`) — 55 test**, tập trung vào phần dễ sai nhất. Component test dùng Testing Library với helper `tests/renderWithPortal.tsx` (render trong context giống PortalProvider, chỉnh được quyền):

- Component: `PortalButton` (nhãn actionType, ẩn khi thiếu quyền, tự loading, popConfirm, icon đổi khi rê chuột, hiddenChildren), `PortalInput` (viết hoa, chặn regex), `PortalSelect` (gọi API đúng tham số, chặn khi thiếu tham số bắt buộc, `customValue`), `Can`, `ErrorBoundary`; `createMockAdapter` (khớp route, `MockError`, `mockFile`, token).
- Logic component: đổi kiểu chữ, định dạng số tiền, khoảng ngày, `valueFormat`, select phụ thuộc, gộp cây, tên file tải về.

- HTTP client: bóc `data`, thay `pathVars`, gắn token/header; **5 request cùng 401 → refresh 1 lần, mỗi request gửi lại đúng 1 lần**; **401 về muộn sau khi refresh xong → dùng token mới, không refresh lần 2**; refresh thất bại → logout 1 lần, không toast; sai mật khẩu (skipAuth) → không logout; toast lỗi/thành công.
- Phân quyền `all`/`any`/`*`; lọc route + bỏ nhóm rỗng; tìm trang đầu tiên; match route + breadcrumb; chặn open redirect; i18n; map token/session nhiều format.

**E2E trên Chrome thật — 32/32 kịch bản pass** (`npm run dev` rồi `npm run e2e`; dùng Chrome có sẵn, ảnh chụp ở `e2e/shots/`): redirect về login và quay lại đúng trang, lỗi sai mật khẩu, bảng có dữ liệu, toast lỗi server và modal giữ nguyên, thêm mới + reload bảng, breadcrumb + menu ở trang ẩn, demo refresh token, dark mode + EN, F5 giữ phiên, đăng xuất, viewer không thấy menu/nút thiếu quyền, 403, 404, mobile 390px không tràn ngang; từng component đem từ Kit (icon đổi khi rê chuột, đủ 45 actionType, tab đồng bộ URL, input viết hoa/chặn chữ, số tiền, chọn nhanh khoảng ngày, select phụ thuộc, cây đơn vị, ảnh cần token, tải file, nhập Excel, 2 loại bảng chuyển); **không có lỗi console**.

## 10. Review thiết kế — so với các core công ty

Core này được thiết kế lại dựa trên việc đọc 3 core FE ở công ty: **PortalKit** (bản bạn giữ, chụp từ upstream v0.11.26), **`portal-components` upstream** (v0.11.60) và **`@portal/digipost`** (v0.0.50). Code được **viết mới**, chỉ học lại kiến trúc — không copy source của công ty.

### Giữ lại (vì đã chứng minh hiệu quả)

| Ý tưởng | Lấy từ |
|---|---|
| Lib build bằng Vite library mode + app `preview/` để phát triển | Cả 3 |
| 1 provider gốc nhận `app`, `routes`, layout tuỳ biến | PortalKit / DigiPost |
| Route khai báo kèm `title`/`icon`/`permission` → tự sinh menu, breadcrumb, 403, redirect trang đầu tiên | PortalKit |
| `pathVars` + `params` + `body`, `notify` success/error, bóc `response.data` | Cả 3 |
| `basePath`, namespace storage theo app (micro-frontend) | DigiPost |
| Runtime env qua `window.__APP_ENV__` | DigiPost / upstream |
| zustand cho state auth (đọc token mới nhất ngoài React) | Upstream (đang chuyển dở) |
| `PortalTable` / `PortalButton` / `PortalTableActionButton` / `MoreButtonGroup` (cùng API) | PortalKit |
| Mapping mã → nhãn/màu (`createMapping`) | DigiPost |
| Theme sáng kiểu ANVL (INSPINIA), theme tối kiểu C10 (`configs/theme2`) | ANVL, C10 |
| Form login / quên mật khẩu, nhiều theme, i18n vi/en, `withPermission` | PortalKit |

### Đã sửa / làm khác

| Vấn đề ở core công ty | Ở đây |
|---|---|
| **Refresh token**: PortalKit/DigiPost dùng cờ `refreshing` + `delay(1000)` → request thứ 2 trở đi bị **reject oan**. Upstream sửa bằng promise chung nhưng request đầu bị **gửi lại 2 lần** (POST có thể tạo trùng) | Single-flight: refresh đúng 1 lần, mỗi request gửi lại đúng 1 lần; xử lý cả ca 401 về muộn. Có unit test + demo |
| Interceptor cài trong `useEffect`, phải gỡ/gắn lại mỗi khi token đổi | Client tạo 1 lần, đọc token qua getter → không có khoảng trống giữa 2 lần gắn |
| Khoá AES `'B3FE829C8EA48'` viết cứng để "mã hoá" token trong localStorage | Bỏ mã hoá giả: khoá nằm trong bundle thì ai cũng giải được. Token lưu thường, user/quyền luôn lấy lại từ server. Muốn chặt hơn: cookie httpOnly phía backend hoặc `storage="session"` |
| Gắn chặt backend OTS (~14–50 endpoint, `property-id`, postbox, VNeID, multi-tenant) | `AuthAdapter` 5 hàm; header bổ sung qua `getHeaders` |
| Upstream giữ token ở **2 nơi** (Context state + zustand) | 1 nguồn duy nhất: zustand store |
| Chuỗi tiếng Việt viết cứng trong lớp API | Mọi chuỗi qua `t()`, có sẵn vi/en |
| Dependency thừa (redux, redux-persist không dùng; upstream thêm cả zustand) | 2 dependency: `axios`, `zustand` |
| Không có test | 55 unit/component test + smoke + 32 kịch bản e2e, chạy trên CI |

Trong lúc viết và chạy e2e, đã phát hiện và sửa thêm 3 lỗi của chính core này: side effect trong initializer của `useState` (StrictMode gọi 2 lần → gắn nhầm store), menu không sáng ở trang ẩn có path anh em (`users/:id`), và nền sider/header dark mode bị navy.

### Quyết định kỹ thuật

- **antd 5, chưa lên antd 6**: ProComponents 2.8 (ProTable, ModalForm) mới hỗ trợ antd ≤ 5. Khi ProComponents ra bản cho antd 6 thì nâng.
- **react-router 7** (chưa lên 8 vừa ra): API ổn định, đã quen; nâng sau.
- **i18n tự viết** thay vì react-intl: ~20 dòng, đủ cho admin, không thêm dependency.
- **Layout antd `Layout` chuẩn** (sider tối + header + breadcrumb), không CSS riêng: nhìn quen như các dự án công ty, dễ sửa.

## 11. Giới hạn hiện tại & roadmap

Đã xong ở 0.3.0: ESLint + Prettier, đồng bộ đăng xuất giữa các tab, ErrorBoundary + tự tải lại sau deploy, `valueFormat` cho ngày, nhớ cài đặt cột, `useCrudPage`, mock adapter, template + `create-app`, smoke test, CI, test component, changesets.

Còn lại (làm khi có nhu cầu):

- [ ] Realtime: hook cho SignalR (backend .NET) hoặc MQTT
- [ ] Bộ component bản đồ (port ý tưởng từ PortalKit khi có dự án cần)
- [ ] Trang đổi mật khẩu / hồ sơ cá nhân dựng sẵn
- [ ] Cache dữ liệu (TanStack Query) nếu dự án nhiều màn hình dùng chung dữ liệu
- [ ] Nâng antd 6 / react-router 8 khi ProComponents hỗ trợ
- [ ] Kiểm tra key i18n lúc biên dịch

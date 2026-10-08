# @hoangsonle/portal-core

Từ 0.3.0 trở đi, mỗi thay đổi ghi bằng `npm run changeset`; `npm run release:version` sẽ tự thêm mục mới vào đầu file này.

## 0.3.0

### Thêm mới

- `ErrorBoundary` quanh nội dung trang và lớp ngoài cùng: trang lỗi không làm trắng cả app; prop `onError` của `PortalProvider` để gửi Sentry / log.
- Tự tải lại trang 1 lần khi file JS lazy không còn trên server (ngay sau khi deploy bản mới).
- Đồng bộ đăng nhập / đăng xuất / giao diện giữa các tab.
- `PortalDatePicker` / `PortalRangePicker`: prop `valueFormat` (`'iso'` hoặc định dạng dayjs như `'YYYY-MM-DD'`) — tránh lệch ngày do múi giờ.
- `PortalTable`: nhớ cài đặt cột theo trang (`persistColumns`).
- `useCrudPage` + `PortalModalForm`: gom bảng, modal thêm/sửa, xoá, tải lại.
- `createMockAdapter`, `MockError`, `mockFile`: backend giả trong trình duyệt để làm UI trước khi có API.
- `template/` + `npm run create-app`: tạo dự án mới (kèm Dockerfile, nginx, sinh `env.js` lúc container khởi động).

### Công cụ

- ESLint 9 + Prettier; `npm run lint`, `npm run format`.
- Test component bằng Testing Library (tổng 55 unit test).
- `npm run smoke`: cài core từ tarball vào app tạo từ template rồi build.
- CI GitHub Actions: lint, format, typecheck, test, build, smoke, e2e (Chrome).
- Changesets để quản lý version + changelog.

## 0.2.0

- Đem các component từ PortalKit cũ, cùng tên + API: `PortalSelect`, `PortalEnumSelect`, `PortalTreeSelect`, `PortalInput`, `PortalInputTextArea`, `PortalNumberInput`, `PortalDatePicker`, `PortalRangePicker`, `PortalDownloadButton`, `PortalUpload`, `PortalUploadAvatar`, `PortalBlobImage`, `PortalTabs`, `PortalSheetUpload`, `PortalTableTransfer`, `PortalTableCountTransfer`.
- `PortalButton`: đủ 45 `actionType` như Kit, icon đổi sang bản đặc khi rê chuột.
- Sửa các lỗi của bản Kit cũ: `regexRule` không có tác dụng, `onChange` trễ 500ms làm mất ký tự, mốc chọn nhanh ngày bị cũ sau nửa đêm, tải file / ảnh không gắn token.
- Giao diện antd chuẩn: theme sáng kiểu ANVL, tối kiểu C10; `PortalTable`, `PortalTableActionButton`, `MoreButtonGroup` theo API của Kit.

## 0.1.0

- Bản đầu: `PortalProvider`, `AuthAdapter` + `createRestAuthAdapter`, HTTP client refresh token single-flight, router phân quyền (menu / breadcrumb / 403 / redirect), layout, i18n vi/en, preview có mock backend, unit test + e2e.

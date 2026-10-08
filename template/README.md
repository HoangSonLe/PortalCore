# __APP_TITLE__

Dự án tạo từ template của `@hoangsonle/portal-core`.

## Chạy

```bash
npm install                  # hoặc yarn
npm run dev                  # http://localhost:5173 — backend giả (.env.development), đăng nhập admin / admin
```

## Cấu trúc

```
src/
  main.tsx              PortalProvider: app, routes, http, auth
  routes.tsx            Menu + phân quyền (permission trên từng route)
  messages.ts           Từ điển vi/en của app
  api/http.ts           HttpClient + auth adapter (đổi endpoint cho khớp backend)
  api/mock.ts           Backend giả — xoá khi có API thật
  api/categoryApi.ts    Ví dụ tầng API
  pages/CategoryListPage.tsx   Ví dụ CRUD đầy đủ (useCrudPage + PortalTable + PortalModalForm) — copy để làm trang mới
```

## Nối backend thật

1. `cp .env.example .env.local` rồi đặt `VITE_USE_MOCK=false`, `VITE_API_URL=https://api.cua-ban` (`.env.local` đè `.env.development`).
2. Sửa `authAdapter` trong `src/api/http.ts` (endpoint login/refresh/me, map response). README của portal-core có ví dụ cho backend .NET.

## Deploy bằng Docker

```bash
docker build -t __APP_NAME__ .
docker run -p 8080:80 -e APP_API_URL=https://api.cua-ban -e APP_ENV=production __APP_NAME__
```

Biến `APP_*` của container được ghi vào `/env.js` lúc khởi động (bỏ tiền tố `APP_`), app đọc bằng `readRuntimeEnv` — đổi môi trường không cần build lại. Chỉ để cấu hình công khai, không để secret.

## Nâng portal-core

Core được cài từ file `vendor/*.tgz`. Khi core có bản mới: chạy lại `npm run create-app` ở repo core để lấy tarball mới, hoặc đổi dependency sang `github:HoangSonLe/PortalCore#vX.Y.Z` sau khi đã đẩy core lên GitHub.

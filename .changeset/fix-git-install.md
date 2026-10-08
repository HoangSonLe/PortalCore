---
'@hoangsonle/portal-core': patch
---

Cài core từ GitHub (`github:HoangSonLe/PortalCore#vX.Y.Z`) tự build `dist/` qua script `prepare` — trước đây app báo "Failed to resolve entry for package". Template chạy được tại chỗ (`cd template && yarn && yarn dev`), bật sẵn backend giả khi dev qua `.env.development`.

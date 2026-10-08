#!/bin/sh
# Sinh /env.js từ biến môi trường của container -> build 1 lần, deploy nhiều môi trường.
# Biến nào có tiền tố APP_ sẽ được đưa vào (bỏ tiền tố): APP_API_URL=https://api.x -> API_URL.
# Chỉ để cấu hình công khai, KHÔNG để secret (file này ai cũng tải được).
set -e

TARGET=/usr/share/nginx/html/env.js

{
  printf 'window.__APP_ENV__ = {'
  env | grep '^APP_' | while IFS='=' read -r key value; do
    name="${key#APP_}"
    escaped=$(printf '%s' "$value" | sed 's/\\/\\\\/g; s/"/\\"/g')
    printf '"%s":"%s",' "$name" "$escaped"
  done
  printf '};\n'
} | sed 's/,};/};/' > "$TARGET"

echo "[env.sh] Đã sinh $TARGET"

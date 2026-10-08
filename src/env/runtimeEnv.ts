declare global {
  interface Window {
    /** Được gán bởi `/env.js` sinh lúc container khởi động (xem README, mục Runtime env). */
    __APP_ENV__?: Record<string, string> | string;
  }
}

/**
 * Đọc biến môi trường lúc chạy: `window.__APP_ENV__` (deploy) đè lên `fallback` (thường là `import.meta.env`).
 * Nhờ vậy build 1 lần, deploy nhiều môi trường chỉ cần đổi file `env.js`.
 */
export const readRuntimeEnv = <T extends Record<string, string | undefined>>(fallback: T): T => {
  if (typeof window === 'undefined' || !window.__APP_ENV__) return { ...fallback };

  try {
    const runtime =
      typeof window.__APP_ENV__ === 'string'
        ? (JSON.parse(window.__APP_ENV__) as Record<string, string>)
        : window.__APP_ENV__;

    return { ...fallback, ...runtime };
  } catch (error) {
    console.error('[portal-core] window.__APP_ENV__ không phải JSON hợp lệ', error);

    return { ...fallback };
  }
};

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
export declare const readRuntimeEnv: <T extends Record<string, string | undefined>>(fallback: T) => T;

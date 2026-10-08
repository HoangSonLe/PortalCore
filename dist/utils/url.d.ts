export type PathVars = Record<string, string | number | undefined | null>;
/**
 * Thay `:name` trong URL bằng giá trị tương ứng (đã encode).
 * `buildPath('/users/:id/roles/:roleId', { id: 1, roleId: 'a b' })` -> `/users/1/roles/a%20b`
 */
export declare const buildPath: (url: string, pathVars?: PathVars) => string;
/** Nối các đoạn path, bỏ `/` thừa. `joinPath('/', 'system', 'users')` -> `/system/users` */
export declare const joinPath: (...segments: (string | undefined)[]) => string;
/** Chỉ chấp nhận đường dẫn nội bộ (bắt đầu bằng 1 dấu `/`) để tránh open redirect. */
export declare const safeRedirectPath: (value: string | null | undefined, fallback?: string) => string;

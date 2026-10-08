export type PathVars = Record<string, string | number | undefined | null>;

/**
 * Thay `:name` trong URL bằng giá trị tương ứng (đã encode).
 * `buildPath('/users/:id/roles/:roleId', { id: 1, roleId: 'a b' })` -> `/users/1/roles/a%20b`
 */
export const buildPath = (url: string, pathVars?: PathVars): string => {
  if (!pathVars) return url;

  return url.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (match, key: string) => {
    const value = pathVars[key];

    return value === undefined || value === null ? match : encodeURIComponent(String(value));
  });
};

/** Nối các đoạn path, bỏ `/` thừa. `joinPath('/', 'system', 'users')` -> `/system/users` */
export const joinPath = (...segments: (string | undefined)[]): string => {
  const joined = segments
    .filter(segment => segment !== undefined && segment !== '')
    .join('/')
    .replace(/\/{2,}/g, '/');
  const normalized = joined.length > 1 ? joined.replace(/\/$/, '') : joined;

  return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

/** Chỉ chấp nhận đường dẫn nội bộ (bắt đầu bằng 1 dấu `/`) để tránh open redirect. */
export const safeRedirectPath = (value: string | null | undefined, fallback = '/'): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }

  return value;
};

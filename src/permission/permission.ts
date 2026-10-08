/** Quyền đặc biệt: user có `*` được làm mọi thứ. */
export const ALL_PERMISSIONS = '*';

export type PermissionRequirement = string | string[] | undefined;

export type PermissionMode = 'all' | 'any';

/**
 * Kiểm tra danh sách quyền đã cấp có thoả yêu cầu không.
 * - Không yêu cầu (undefined / mảng rỗng) -> luôn true.
 * - `mode = 'all'` (mặc định): phải có đủ tất cả; `'any'`: chỉ cần 1.
 */
export const hasPermission = (
  granted: readonly string[],
  required: PermissionRequirement,
  mode: PermissionMode = 'all',
): boolean => {
  if (required === undefined) return true;

  const requiredList = Array.isArray(required) ? required : [required];

  if (requiredList.length === 0) return true;
  if (granted.includes(ALL_PERMISSIONS)) return true;

  return mode === 'all'
    ? requiredList.every(code => granted.includes(code))
    : requiredList.some(code => granted.includes(code));
};

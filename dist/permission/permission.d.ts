/** Quyền đặc biệt: user có `*` được làm mọi thứ. */
export declare const ALL_PERMISSIONS = "*";
export type PermissionRequirement = string | string[] | undefined;
export type PermissionMode = 'all' | 'any';
/**
 * Kiểm tra danh sách quyền đã cấp có thoả yêu cầu không.
 * - Không yêu cầu (undefined / mảng rỗng) -> luôn true.
 * - `mode = 'all'` (mặc định): phải có đủ tất cả; `'any'`: chỉ cần 1.
 */
export declare const hasPermission: (granted: readonly string[], required: PermissionRequirement, mode?: PermissionMode) => boolean;

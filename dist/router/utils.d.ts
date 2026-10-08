import { AppRoute, FlatRoute } from './types';
export type CanAccessRoute = (route: AppRoute) => boolean;
/**
 * Giữ lại các route được phép. Route nhóm (không có element) mà không còn con nào thì bỏ luôn,
 * để menu không còn nhóm rỗng.
 */
export declare const filterRoutes: (routes: AppRoute[], canAccess: CanAccessRoute) => AppRoute[];
/** Trang đầu tiên có thể vào được (bỏ qua trang ẩn và path động `:id`) — dùng cho redirect trang chủ. */
export declare const findFirstPath: (routes: AppRoute[], parentPath?: string) => string | undefined;
export declare const flattenRoutes: (routes: AppRoute[], parentPath?: string, parentChain?: FlatRoute["chain"]) => FlatRoute[];
/** Route khớp với pathname hiện tại (ưu tiên route sâu nhất). */
export declare const matchFlatRoute: (flatRoutes: FlatRoute[], pathname: string) => FlatRoute | undefined;

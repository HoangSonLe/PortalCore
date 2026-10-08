/** Các route user được phép thấy (dùng cho menu). */
export declare const useVisibleRoutes: () => import('./types').AppRoute[];
/**
 * Route khớp URL hiện tại, kèm chuỗi route cha (breadcrumb).
 * Dùng được trong mọi trang con của layout: `const current = useCurrentRoute(); current?.route.title`.
 */
export declare const useCurrentRoute: () => import('./types').FlatRoute | undefined;

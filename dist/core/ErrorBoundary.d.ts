import { ErrorInfo, ReactNode, Component } from 'react';
/** Lỗi do file JS lazy không còn trên server (thường gặp ngay sau khi deploy bản mới). */
export declare const isChunkLoadError: (error: unknown) => boolean;
/**
 * Tải lại trang 1 lần để lấy bản mới. Đánh dấu trong sessionStorage để không lặp vô hạn
 * nếu lỗi vẫn còn sau khi tải lại.
 */
export declare const reloadOnceForNewVersion: () => boolean;
/** Gọi khi app chạy ổn định để lần lỗi sau vẫn được tự tải lại. */
export declare const clearChunkReloadFlag: () => void;
export interface ErrorBoundaryProps {
    children: ReactNode;
    /** Thay giao diện lỗi mặc định. */
    fallback?: (error: Error, retry: () => void) => ReactNode;
    /** Gửi lỗi đi đâu đó (Sentry, log server...). */
    onError?: (error: Error, info: ErrorInfo) => void;
}
/**
 * Chặn lỗi render để không trắng cả app. Lỗi tải file JS sau deploy -> tự tải lại trang 1 lần.
 * AppLayout đã bọc sẵn quanh nội dung trang (reset khi đổi URL).
 */
export declare class ErrorBoundary extends Component<ErrorBoundaryProps, {
    error?: Error;
}> {
    state: {
        error?: Error;
    };
    static getDerivedStateFromError(error: Error): {
        error: Error;
    };
    componentDidCatch(error: Error, info: ErrorInfo): void;
    retry: () => void;
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import('react').ReactPortal | import('react').ReactElement<unknown, string | import('react').JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
}

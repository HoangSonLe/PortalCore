import type { ErrorInfo, ReactNode } from 'react';

import { Button, Result, Typography } from 'antd';
import { Component } from 'react';

import { useT } from './hooks';

const RELOAD_FLAG = 'portal-core:chunk-reload';

/** Lỗi do file JS lazy không còn trên server (thường gặp ngay sau khi deploy bản mới). */
export const isChunkLoadError = (error: unknown) =>
  error instanceof Error &&
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Unable to preload CSS/i.test(
    `${error.name} ${error.message}`,
  );

/**
 * Tải lại trang 1 lần để lấy bản mới. Đánh dấu trong sessionStorage để không lặp vô hạn
 * nếu lỗi vẫn còn sau khi tải lại.
 */
export const reloadOnceForNewVersion = (): boolean => {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return false;

    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  } catch {
    // Không có sessionStorage thì vẫn thử tải lại 1 lần.
  }

  window.location.reload();

  return true;
};

/** Gọi khi app chạy ổn định để lần lỗi sau vẫn được tự tải lại. */
export const clearChunkReloadFlag = () => {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    // bỏ qua
  }
};

const ErrorFallback = ({ error, onRetry }: { error: Error; onRetry: () => void }) => {
  const t = useT();

  return (
    <Result
      status="error"
      title={t('error.boundary.title')}
      subTitle={t('error.boundary.description')}
      extra={[
        <Button key="retry" onClick={onRetry}>
          {t('error.boundary.retry')}
        </Button>,
        <Button key="reload" type="primary" onClick={() => window.location.reload()}>
          {t('error.boundary.reload')}
        </Button>,
      ]}
    >
      {import.meta.env.DEV && (
        <Typography.Paragraph>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, margin: 0 }}>{error.stack ?? error.message}</pre>
        </Typography.Paragraph>
      )}
    </Result>
  );
};

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
export class ErrorBoundary extends Component<ErrorBoundaryProps, { error?: Error }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error) && reloadOnceForNewVersion()) return;

    this.props.onError?.(error, info);
    console.error('[portal-core] Lỗi render:', error, info.componentStack);
  }

  retry = () => this.setState({ error: undefined });

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return this.props.fallback ? (
      this.props.fallback(error, this.retry)
    ) : (
      <ErrorFallback error={error} onRetry={this.retry} />
    );
  }
}

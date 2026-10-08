import type { HttpMethod } from '../http/types';
import type { PortalButtonProps } from './PortalButton';
import type { MouseEvent } from 'react';

import { useHttp } from '../core/hooks';
import { filenameFromDisposition, saveBlob } from '../utils/file';
import { PortalButton } from './PortalButton';

export interface PortalDownloadButtonProps {
  /** URL tải file (đi qua HttpClient nên tự gắn token, tự refresh). */
  url: string;
  /** Tên file lưu. Bỏ trống thì đọc từ header `Content-Disposition`. */
  filename?: string;
  params?: Record<string, unknown>;
  method?: HttpMethod;
  body?: unknown;
  /** Props cho nút (giống Kit). Mặc định `type="primary" actionType="download"`. */
  buttonProps?: PortalButtonProps;
}

/** Nút tải file (giống PortalDownloadButton bên Kit cũ) — nút tự loading tới khi tải xong. */
export const PortalDownloadButton = ({ url, filename, params, method = 'get', body, buttonProps = {} }: PortalDownloadButtonProps) => {
  const http = useHttp();
  const { onClick, ...rest } = buttonProps;

  const handleClick = async (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onClick?.(event);

    const response = await http.raw<Blob>(method, url, { params, body, responseType: 'blob' });
    const name = filename ?? filenameFromDisposition(response.headers?.['content-disposition'] as string) ?? 'download';

    saveBlob(response.data, name);
  };

  return <PortalButton type="primary" actionType="download" {...rest} onClick={handleClick} />;
};

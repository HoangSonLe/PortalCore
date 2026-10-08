import { HttpMethod } from '../http/types';
import { PortalButtonProps } from './PortalButton';
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
export declare const PortalDownloadButton: ({ url, filename, params, method, body, buttonProps, }: PortalDownloadButtonProps) => import("react").JSX.Element;

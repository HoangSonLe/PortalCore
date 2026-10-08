import type { ImageProps } from 'antd';

import { Image } from 'antd';
import { useEffect, useState } from 'react';

import { useHttp } from '../core/hooks';

/** Ảnh thay thế khi lỗi: khung xám có biểu tượng ảnh (SVG nội tuyến, không phụ thuộc file ngoài). */
export const NO_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><rect width="160" height="120" fill="#f0f0f0"/><g fill="none" stroke="#bfbfbf" stroke-width="3"><rect x="55" y="38" width="50" height="40" rx="4"/><circle cx="70" cy="51" r="5"/><path d="M57 74l15-14 10 9 8-6 13 11"/></g></svg>',
  );

export interface PortalBlobImageProps extends Omit<ImageProps, 'src'> {
  /** URL ảnh cần đăng nhập mới xem được — tải qua HttpClient nên tự gắn token. */
  imageUrl?: string;
  noImageUrl?: string;
  /** `false`: tải bằng fetch thường, không gắn token. */
  withAuth?: boolean;
}

/** Hiện ảnh từ server file có bảo mật (giống PortalBlobImage bên Kit cũ, thêm gắn token + giải phóng bộ nhớ). */
export const PortalBlobImage = ({
  imageUrl,
  noImageUrl = NO_IMAGE,
  withAuth = true,
  preview,
  ...props
}: PortalBlobImageProps) => {
  const http = useHttp();
  const [blobUrl, setBlobUrl] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;

    setBlobUrl(undefined);

    if (!imageUrl) return undefined;

    const load = async () => {
      try {
        const blob = withAuth
          ? (await http.raw<Blob>('get', imageUrl, { responseType: 'blob', notify: { error: false } })).data
          : await (await fetch(imageUrl)).blob();

        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setBlobUrl(undefined);
      }
    };

    void load();

    return () => {
      cancelled = true;

      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [http, imageUrl, withAuth]);

  return <Image {...props} src={blobUrl ?? noImageUrl} fallback={noImageUrl} preview={blobUrl ? preview : false} />;
};

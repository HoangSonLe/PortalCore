import { ImageProps } from 'antd';
/** Ảnh thay thế khi lỗi: khung xám có biểu tượng ảnh (SVG nội tuyến, không phụ thuộc file ngoài). */
export declare const NO_IMAGE: string;
export interface PortalBlobImageProps extends Omit<ImageProps, 'src'> {
    /** URL ảnh cần đăng nhập mới xem được — tải qua HttpClient nên tự gắn token. */
    imageUrl?: string;
    noImageUrl?: string;
    /** `false`: tải bằng fetch thường, không gắn token. */
    withAuth?: boolean;
}
/** Hiện ảnh từ server file có bảo mật (giống PortalBlobImage bên Kit cũ, thêm gắn token + giải phóng bộ nhớ). */
export declare const PortalBlobImage: ({ imageUrl, noImageUrl, withAuth, preview, ...props }: PortalBlobImageProps) => import("react").JSX.Element;

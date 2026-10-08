import { ComponentType, ReactNode } from 'react';
import { RcFile, UploadProps } from 'antd/es/upload';
export interface PortalUploadProps extends Omit<UploadProps, 'children'> {
    /** Số ảnh tối đa (ẩn nút thêm khi đủ). Mặc định 8 như Kit. */
    maxCount?: number;
    /** Nội dung nút thêm. Mặc định icon + "Tải lên". */
    uploadButton?: ReactNode;
}
/** Upload nhiều ảnh dạng thẻ, bấm vào để xem lớn (giống PortalUpload bên Kit cũ). */
export declare const PortalUpload: ({ maxCount, uploadButton, fileList: controlled, onChange, ...props }: PortalUploadProps) => import("react").JSX.Element;
export interface PortalUploadAvatarProps {
    /** URL ảnh hiện tại. */
    value?: string;
    onChange?: (url: string) => void;
    /** Upload file lên server, trả về URL ảnh. Vd `file => fileApi.upload(file).then(r => r.url)`. */
    upload: (file: RcFile) => Promise<string>;
    width?: number | string;
    height?: number | string;
    /** Dung lượng tối đa (MB). Mặc định 10. */
    maxSizeMB?: number;
    accept?: string[];
    /**
     * Muốn cắt ảnh trước khi tải: cài `antd-img-crop` rồi truyền `imgCrop={ImgCrop}`.
     * Core không phụ thuộc thư viện này.
     */
    imgCrop?: ComponentType<any>;
    cropProps?: Record<string, unknown>;
}
/** Ô ảnh đại diện: chọn ảnh → (cắt) → upload → trả URL (giống PortalUploadAvatar bên Kit cũ). */
export declare const PortalUploadAvatar: ({ value, onChange, upload, width, height, maxSizeMB, accept, imgCrop, cropProps, }: PortalUploadAvatarProps) => import("react").JSX.Element;

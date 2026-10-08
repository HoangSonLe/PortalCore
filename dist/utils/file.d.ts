/** Lưu Blob thành file trên máy người dùng. */
export declare const saveBlob: (blob: Blob, filename: string) => void;
/** Lấy tên file từ header `Content-Disposition` (hỗ trợ `filename*=UTF-8''...`). */
export declare const filenameFromDisposition: (header: string | undefined | null) => string | undefined;
/** Đọc File thành data URL (base64) — dùng để xem trước ảnh. */
export declare const readAsDataURL: (file: Blob) => Promise<string>;

/** Lưu Blob thành file trên máy người dùng. */
export const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Trì hoãn để trình duyệt kịp bắt đầu tải.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Lấy tên file từ header `Content-Disposition` (hỗ trợ `filename*=UTF-8''...`). */
export const filenameFromDisposition = (header: string | undefined | null): string | undefined => {
  if (!header) return undefined;

  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);

  if (utf8) return decodeURIComponent(utf8[1].trim().replace(/"/g, ''));

  const plain = /filename="?([^";]+)"?/i.exec(header);

  return plain?.[1]?.trim();
};

/** Đọc File thành data URL (base64) — dùng để xem trước ảnh. */
export const readAsDataURL = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

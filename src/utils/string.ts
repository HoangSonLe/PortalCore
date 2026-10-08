/** Bỏ dấu tiếng Việt + chữ thường, để tìm "nguoi dung" vẫn ra "Người dùng". */
export const removeVietnameseTones = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** `true` nếu `text` chứa `keyword` (không phân biệt hoa thường, có dấu hay không). */
export const includesText = (text: unknown, keyword: string) =>
  removeVietnameseTones(String(text ?? '')).includes(removeVietnameseTones(keyword));

/** Đọc giá trị theo đường dẫn `a.b.c` (thay cho lodash.get, tránh thêm dependency). */
export const getByPath = (source: unknown, path: string): any =>
  path.split('.').reduce<any>((value, key) => (value === null || value === undefined ? undefined : value[key]), source);

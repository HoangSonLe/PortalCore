/** Bỏ dấu tiếng Việt + chữ thường, để tìm "nguoi dung" vẫn ra "Người dùng". */
export declare const removeVietnameseTones: (value: string) => string;
/** `true` nếu `text` chứa `keyword` (không phân biệt hoa thường, có dấu hay không). */
export declare const includesText: (text: unknown, keyword: string) => boolean;
/** Đọc giá trị theo đường dẫn `a.b.c` (thay cho lodash.get, tránh thêm dependency). */
export declare const getByPath: (source: unknown, path: string) => any;

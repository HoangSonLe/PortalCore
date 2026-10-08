import { StateStorage } from 'zustand/middleware';
export type StorageOption = 'local' | 'session' | StateStorage;
/** Trả về storage an toàn: trình duyệt chặn storage (private mode, iframe...) thì rơi về bộ nhớ tạm. */
export declare const resolveStorage: (option?: StorageOption) => StateStorage;

import type { StateStorage } from 'zustand/middleware';

export type StorageOption = 'local' | 'session' | StateStorage;

const memoryStorage = (): StateStorage => {
  const map = new Map<string, string>();

  return {
    getItem: name => map.get(name) ?? null,
    setItem: (name, value) => void map.set(name, value),
    removeItem: name => void map.delete(name),
  };
};

/** Trả về storage an toàn: trình duyệt chặn storage (private mode, iframe...) thì rơi về bộ nhớ tạm. */
export const resolveStorage = (option: StorageOption = 'local'): StateStorage => {
  if (typeof option === 'object') return option;

  try {
    const storage = option === 'session' ? window.sessionStorage : window.localStorage;
    const probe = '__portal_core_probe__';

    storage.setItem(probe, probe);
    storage.removeItem(probe);

    return storage;
  } catch {
    return memoryStorage();
  }
};

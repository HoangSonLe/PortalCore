const memoryStorage = () => {
  const map = /* @__PURE__ */ new Map();
  return {
    getItem: (name) => map.get(name) ?? null,
    setItem: (name, value) => void map.set(name, value),
    removeItem: (name) => void map.delete(name)
  };
};
const resolveStorage = (option = "local") => {
  if (typeof option === "object") return option;
  try {
    const storage = option === "session" ? window.sessionStorage : window.localStorage;
    const probe = "__portal_core_probe__";
    storage.setItem(probe, probe);
    storage.removeItem(probe);
    return storage;
  } catch {
    return memoryStorage();
  }
};
export {
  resolveStorage
};
//# sourceMappingURL=storage.js.map

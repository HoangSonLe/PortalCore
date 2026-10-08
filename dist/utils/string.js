const removeVietnameseTones = (value) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/\s+/g, " ").trim();
const includesText = (text, keyword) => removeVietnameseTones(String(text ?? "")).includes(removeVietnameseTones(keyword));
const getByPath = (source, path) => path.split(".").reduce((value, key) => value === null || value === void 0 ? void 0 : value[key], source);
export {
  getByPath,
  includesText,
  removeVietnameseTones
};
//# sourceMappingURL=string.js.map

const ALL_PERMISSIONS = "*";
const hasPermission = (granted, required, mode = "all") => {
  if (required === void 0) return true;
  const requiredList = Array.isArray(required) ? required : [required];
  if (requiredList.length === 0) return true;
  if (granted.includes(ALL_PERMISSIONS)) return true;
  return mode === "all" ? requiredList.every((code) => granted.includes(code)) : requiredList.some((code) => granted.includes(code));
};
export {
  ALL_PERMISSIONS,
  hasPermission
};
//# sourceMappingURL=permission.js.map

const buildPath = (url, pathVars) => {
  if (!pathVars) return url;
  return url.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (match, key) => {
    const value = pathVars[key];
    return value === void 0 || value === null ? match : encodeURIComponent(String(value));
  });
};
const joinPath = (...segments) => {
  const joined = segments.filter((segment) => segment !== void 0 && segment !== "").join("/").replace(/\/{2,}/g, "/");
  const normalized = joined.length > 1 ? joined.replace(/\/$/, "") : joined;
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};
const safeRedirectPath = (value, fallback = "/") => {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
};
export {
  buildPath,
  joinPath,
  safeRedirectPath
};
//# sourceMappingURL=url.js.map

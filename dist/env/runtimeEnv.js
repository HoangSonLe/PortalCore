const readRuntimeEnv = (fallback) => {
  if (typeof window === "undefined" || !window.__APP_ENV__) return { ...fallback };
  try {
    const runtime = typeof window.__APP_ENV__ === "string" ? JSON.parse(window.__APP_ENV__) : window.__APP_ENV__;
    return { ...fallback, ...runtime };
  } catch (error) {
    console.error("[portal-core] window.__APP_ENV__ không phải JSON hợp lệ", error);
    return { ...fallback };
  }
};
export {
  readRuntimeEnv
};
//# sourceMappingURL=runtimeEnv.js.map

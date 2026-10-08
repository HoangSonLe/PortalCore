import { darkTheme, lightTheme } from "./themes.js";
const mergeTheme = (base, override = {}) => {
  const components = { ...base.components };
  for (const [name, value] of Object.entries(override.components ?? {})) {
    const key = name;
    components[key] = { ...components[key], ...value };
  }
  return { ...base, ...override, token: { ...base.token, ...override.token }, components };
};
const buildTheme = (mode, options = {}) => mode === "dark" ? mergeTheme(darkTheme, options.dark) : mergeTheme(lightTheme, options.light);
export {
  buildTheme
};
//# sourceMappingURL=theme.js.map

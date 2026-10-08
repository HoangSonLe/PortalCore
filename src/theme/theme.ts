import type { ThemeMode } from '../stores/appStore';
import type { ThemeConfig } from 'antd';

import { darkTheme, lightTheme } from './themes';

export interface ThemeOptions {
  defaultMode?: ThemeMode;
  /** Ghi đè theme sáng (token, components) — merge lên `lightTheme`. */
  light?: ThemeConfig;
  /** Ghi đè theme tối — merge lên `darkTheme`. */
  dark?: ThemeConfig;
}

const mergeTheme = (base: ThemeConfig, override: ThemeConfig = {}): ThemeConfig => {
  const components = { ...base.components };

  for (const [name, value] of Object.entries(override.components ?? {})) {
    const key = name as keyof NonNullable<ThemeConfig['components']>;

    components[key] = { ...(components[key] as object), ...(value as object) } as never;
  }

  return { ...base, ...override, token: { ...base.token, ...override.token }, components };
};

export const buildTheme = (mode: ThemeMode, options: ThemeOptions = {}): ThemeConfig =>
  mode === 'dark' ? mergeTheme(darkTheme, options.dark) : mergeTheme(lightTheme, options.light);

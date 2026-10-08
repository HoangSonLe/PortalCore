import { ThemeMode } from '../stores/appStore';
import { ThemeConfig } from 'antd';
export interface ThemeOptions {
    defaultMode?: ThemeMode;
    /** Ghi đè theme sáng (token, components) — merge lên `lightTheme`. */
    light?: ThemeConfig;
    /** Ghi đè theme tối — merge lên `darkTheme`. */
    dark?: ThemeConfig;
}
export declare const buildTheme: (mode: ThemeMode, options?: ThemeOptions) => ThemeConfig;

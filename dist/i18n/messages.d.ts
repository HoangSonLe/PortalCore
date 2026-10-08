export type Locale = 'vi' | 'en';
export type Messages = Record<string, string>;
export declare const builtinMessages: Record<Locale, Messages>;
export declare const localeLabels: Record<Locale, string>;
export type Translate = (key: string | undefined, values?: Record<string, string | number>) => string;
/** Không có key trong từ điển thì trả nguyên key -> có thể truyền thẳng text thường vào `t()`. */
export declare const createTranslator: (messages: Messages) => Translate;

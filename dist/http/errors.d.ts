export declare class HttpError extends Error {
    readonly status?: number;
    readonly data?: unknown;
    readonly url?: string;
    /** Message lấy được từ response body (undefined nếu backend không trả message). */
    readonly serverMessage?: string;
    constructor(message: string, options?: {
        status?: number;
        data?: unknown;
        url?: string;
        serverMessage?: string;
        cause?: unknown;
    });
}
export declare const isHttpError: (error: unknown) => error is HttpError;
export declare const defaultGetErrorMessage: (data: unknown) => string | undefined;
export declare const toHttpError: (error: unknown, getErrorMessage: (data: unknown) => string | undefined) => Promise<HttpError>;

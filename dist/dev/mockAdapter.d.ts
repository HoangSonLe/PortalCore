import { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
/** Ném trong handler để trả lỗi HTTP: `throw new MockError(404, 'Không tìm thấy')`. */
export declare class MockError extends Error {
    readonly status: number;
    readonly data?: unknown | undefined;
    constructor(status: number, message: string, data?: unknown | undefined);
}
/** Trả file từ handler: `return mockFile(blob, 'bao-cao.xlsx')`. */
export declare class MockFile {
    readonly blob: Blob;
    readonly filename: string;
    constructor(blob: Blob, filename: string);
}
export declare const mockFile: (blob: Blob, filename: string) => MockFile;
export interface MockContext {
    method: string;
    /** Path không gồm query string, vd `/users/7`. */
    url: string;
    params: Record<string, any>;
    body: any;
    pathVars: Record<string, string>;
    config: InternalAxiosRequestConfig;
    /** Header `Authorization` đã bỏ tiền tố `Bearer `. */
    token?: string;
}
export type MockHandler = (ctx: MockContext) => unknown | Promise<unknown>;
/** `['get', '/users/:id', ctx => ...]` — route khai báo trước được ưu tiên. */
export type MockRoute = [method: string, pattern: string, handler: MockHandler];
export interface MockAdapterOptions {
    routes: MockRoute[];
    /** Độ trễ giả lập (ms) — số cố định hoặc khoảng `[min, max]`. Mặc định `[150, 400]`. */
    delay?: number | [number, number];
    onRequest?: (ctx: MockContext) => void;
    /** Gọi sau khi handler chạy xong không lỗi (vd lưu "database" giả). */
    onResponse?: (ctx: MockContext, data: unknown) => void;
}
/**
 * Backend giả chạy trong trình duyệt — làm UI trước khi có API thật, hoặc để demo/test.
 *
 * ```ts
 * const http = createHttpClient({
 *   adapter: import.meta.env.VITE_MOCK ? createMockAdapter({ routes }) : undefined,
 * });
 * ```
 */
export declare const createMockAdapter: ({ routes, delay, onRequest, onResponse, }: MockAdapterOptions) => AxiosAdapter;

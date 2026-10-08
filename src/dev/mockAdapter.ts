import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { AxiosError } from 'axios';

/** Ném trong handler để trả lỗi HTTP: `throw new MockError(404, 'Không tìm thấy')`. */
export class MockError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly data?: unknown,
  ) {
    super(message);
    this.name = 'MockError';
  }
}

/** Trả file từ handler: `return mockFile(blob, 'bao-cao.xlsx')`. */
export class MockFile {
  constructor(
    readonly blob: Blob,
    readonly filename: string,
  ) {}
}

export const mockFile = (blob: Blob, filename: string) => new MockFile(blob, filename);

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

const compile = (pattern: string) => {
  const names: string[] = [];
  const regex = new RegExp(
    `^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:(\w+)/g, (_match, name: string) => {
      names.push(name);

      return '([^/]+)';
    })}/?$`,
  );

  return (url: string) => {
    const match = regex.exec(url);

    return match ? Object.fromEntries(names.map((name, i) => [name, decodeURIComponent(match[i + 1])])) : undefined;
  };
};

/**
 * Backend giả chạy trong trình duyệt — làm UI trước khi có API thật, hoặc để demo/test.
 *
 * ```ts
 * const http = createHttpClient({
 *   adapter: import.meta.env.VITE_MOCK ? createMockAdapter({ routes }) : undefined,
 * });
 * ```
 */
export const createMockAdapter = ({
  routes,
  delay = [150, 400],
  onRequest,
  onResponse,
}: MockAdapterOptions): AxiosAdapter => {
  const compiled = routes.map(([method, pattern, handler]) => ({
    method: method.toLowerCase(),
    match: compile(pattern),
    handler,
    pattern,
  }));

  return async config => {
    const wait = Array.isArray(delay) ? delay[0] + Math.random() * (delay[1] - delay[0]) : delay;

    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));

    const method = (config.method ?? 'get').toLowerCase();
    const url = (config.url ?? '').split('?')[0];
    const respond = (status: number, data: unknown, headers: Record<string, string> = {}): AxiosResponse => ({
      data,
      status,
      statusText: String(status),
      headers,
      config,
      request: {},
    });

    let body: unknown = config.data;

    if (typeof body === 'string' && body) {
      try {
        body = JSON.parse(body);
      } catch {
        // giữ nguyên chuỗi
      }
    }

    const authorization = String(config.headers?.Authorization ?? '');
    const route = compiled.find(item => item.method === method && item.match(url));
    const ctx: MockContext = {
      method,
      url,
      params: config.params ?? {},
      body,
      pathVars: route?.match(url) ?? {},
      config,
      token: authorization.startsWith('Bearer ') ? authorization.slice(7) : undefined,
    };

    onRequest?.(ctx);

    try {
      if (!route) throw new MockError(404, `Mock API không có ${method.toUpperCase()} ${url}`);

      const data = (await route.handler(ctx)) ?? null;

      onResponse?.(ctx, data);

      if (data instanceof MockFile) {
        return respond(200, data.blob, {
          'content-type': data.blob.type,
          'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(data.filename)}`,
        });
      }

      return respond(200, data);
    } catch (error) {
      const status = error instanceof MockError ? error.status : 500;
      const data =
        error instanceof MockError && error.data !== undefined
          ? error.data
          : { message: error instanceof Error ? error.message : 'Lỗi mock server' };

      throw new AxiosError(
        `Request failed with status code ${status}`,
        'ERR_BAD_RESPONSE',
        config,
        {},
        respond(status, data),
      );
    }
  };
};

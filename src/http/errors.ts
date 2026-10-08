import { isAxiosError } from 'axios';

export class HttpError extends Error {
  readonly status?: number;
  readonly data?: unknown;
  readonly url?: string;
  /** Message lấy được từ response body (undefined nếu backend không trả message). */
  readonly serverMessage?: string;

  constructor(
    message: string,
    options: { status?: number; data?: unknown; url?: string; serverMessage?: string; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = 'HttpError';
    this.status = options.status;
    this.data = options.data;
    this.url = options.url;
    this.serverMessage = options.serverMessage;
  }
}

export const isHttpError = (error: unknown): error is HttpError => error instanceof HttpError;

export const defaultGetErrorMessage = (data: unknown): string | undefined => {
  if (!data || typeof data !== 'object') {
    return typeof data === 'string' && data.length < 300 ? data : undefined;
  }

  const record = data as Record<string, unknown>;

  for (const key of ['message', 'error', 'title', 'detail']) {
    if (typeof record[key] === 'string' && record[key]) {
      return record[key] as string;
    }
  }

  return undefined;
};

/** Response lỗi kiểu blob (tải file) thì phải đọc text rồi parse JSON mới lấy được message. */
const readBlobData = async (data: unknown): Promise<unknown> => {
  if (typeof Blob === 'undefined' || !(data instanceof Blob)) return data;

  try {
    const text = await data.text();

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return undefined;
  }
};

export const toHttpError = async (
  error: unknown,
  getErrorMessage: (data: unknown) => string | undefined,
): Promise<HttpError> => {
  if (isHttpError(error)) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = await readBlobData(error.response?.data);
    const serverMessage = getErrorMessage(data);
    const message =
      serverMessage ?? (status ? `Request failed with status ${status}` : error.message || 'Network error');

    return new HttpError(message, { status, data, url: error.config?.url, serverMessage, cause: error });
  }

  return new HttpError(error instanceof Error ? error.message : 'Unknown error', { cause: error });
};

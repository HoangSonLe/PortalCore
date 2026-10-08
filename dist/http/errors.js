import { isAxiosError } from "axios";
class HttpError extends Error {
  status;
  data;
  url;
  /** Message lấy được từ response body (undefined nếu backend không trả message). */
  serverMessage;
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.name = "HttpError";
    this.status = options.status;
    this.data = options.data;
    this.url = options.url;
    this.serverMessage = options.serverMessage;
  }
}
const isHttpError = (error) => error instanceof HttpError;
const defaultGetErrorMessage = (data) => {
  if (!data || typeof data !== "object") {
    return typeof data === "string" && data.length < 300 ? data : void 0;
  }
  const record = data;
  for (const key of ["message", "error", "title", "detail"]) {
    if (typeof record[key] === "string" && record[key]) {
      return record[key];
    }
  }
  return void 0;
};
const readBlobData = async (data) => {
  if (typeof Blob === "undefined" || !(data instanceof Blob)) return data;
  try {
    const text = await data.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return void 0;
  }
};
const toHttpError = async (error, getErrorMessage) => {
  if (isHttpError(error)) return error;
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = await readBlobData(error.response?.data);
    const serverMessage = getErrorMessage(data);
    const message = serverMessage ?? (status ? `Request failed with status ${status}` : error.message || "Network error");
    return new HttpError(message, { status, data, url: error.config?.url, serverMessage, cause: error });
  }
  return new HttpError(error instanceof Error ? error.message : "Unknown error", { cause: error });
};
export {
  HttpError,
  defaultGetErrorMessage,
  isHttpError,
  toHttpError
};
//# sourceMappingURL=errors.js.map

import { AxiosError } from "axios";
class MockError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "MockError";
  }
  status;
  data;
}
class MockFile {
  constructor(blob, filename) {
    this.blob = blob;
    this.filename = filename;
  }
  blob;
  filename;
}
const mockFile = (blob, filename) => new MockFile(blob, filename);
const compile = (pattern) => {
  const names = [];
  const regex = new RegExp(
    `^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/:(\w+)/g, (_match, name) => {
      names.push(name);
      return "([^/]+)";
    })}/?$`
  );
  return (url) => {
    const match = regex.exec(url);
    return match ? Object.fromEntries(names.map((name, i) => [name, decodeURIComponent(match[i + 1])])) : void 0;
  };
};
const createMockAdapter = ({
  routes,
  delay = [150, 400],
  onRequest,
  onResponse
}) => {
  const compiled = routes.map(([method, pattern, handler]) => ({
    method: method.toLowerCase(),
    match: compile(pattern),
    handler,
    pattern
  }));
  return async (config) => {
    const wait = Array.isArray(delay) ? delay[0] + Math.random() * (delay[1] - delay[0]) : delay;
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    const method = (config.method ?? "get").toLowerCase();
    const url = (config.url ?? "").split("?")[0];
    const respond = (status, data, headers = {}) => ({
      data,
      status,
      statusText: String(status),
      headers,
      config,
      request: {}
    });
    let body = config.data;
    if (typeof body === "string" && body) {
      try {
        body = JSON.parse(body);
      } catch {
      }
    }
    const authorization = String(config.headers?.Authorization ?? "");
    const route = compiled.find((item) => item.method === method && item.match(url));
    const ctx = {
      method,
      url,
      params: config.params ?? {},
      body,
      pathVars: route?.match(url) ?? {},
      config,
      token: authorization.startsWith("Bearer ") ? authorization.slice(7) : void 0
    };
    onRequest?.(ctx);
    try {
      if (!route) throw new MockError(404, `Mock API không có ${method.toUpperCase()} ${url}`);
      const data = await route.handler(ctx) ?? null;
      onResponse?.(ctx, data);
      if (data instanceof MockFile) {
        return respond(200, data.blob, {
          "content-type": data.blob.type,
          "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(data.filename)}`
        });
      }
      return respond(200, data);
    } catch (error) {
      const status = error instanceof MockError ? error.status : 500;
      const data = error instanceof MockError && error.data !== void 0 ? error.data : { message: error instanceof Error ? error.message : "Lỗi mock server" };
      throw new AxiosError(
        `Request failed with status code ${status}`,
        "ERR_BAD_RESPONSE",
        config,
        {},
        respond(status, data)
      );
    }
  };
};
export {
  MockError,
  MockFile,
  createMockAdapter,
  mockFile
};
//# sourceMappingURL=mockAdapter.js.map

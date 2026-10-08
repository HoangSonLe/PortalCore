import { jsx } from "react/jsx-runtime";
import { Result, Button } from "antd";
import { Component } from "react";
import { useT } from "./hooks.js";
const RELOAD_FLAG = "portal-core:chunk-reload";
const isChunkLoadError = (error) => error instanceof Error && /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Unable to preload CSS/i.test(
  `${error.name} ${error.message}`
);
const reloadOnceForNewVersion = () => {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return false;
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  } catch {
  }
  window.location.reload();
  return true;
};
const clearChunkReloadFlag = () => {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
  }
};
const ErrorFallback = ({ error, onRetry }) => {
  const t = useT();
  return /* @__PURE__ */ jsx(
    Result,
    {
      status: "error",
      title: t("error.boundary.title"),
      subTitle: t("error.boundary.description"),
      extra: [
        /* @__PURE__ */ jsx(Button, { onClick: onRetry, children: t("error.boundary.retry") }, "retry"),
        /* @__PURE__ */ jsx(Button, { type: "primary", onClick: () => window.location.reload(), children: t("error.boundary.reload") }, "reload")
      ],
      children: false
    }
  );
};
class ErrorBoundary extends Component {
  state = {};
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    if (isChunkLoadError(error) && reloadOnceForNewVersion()) return;
    this.props.onError?.(error, info);
    console.error("[portal-core] Lỗi render:", error, info.componentStack);
  }
  retry = () => this.setState({ error: void 0 });
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return this.props.fallback ? this.props.fallback(error, this.retry) : /* @__PURE__ */ jsx(ErrorFallback, { error, onRetry: this.retry });
  }
}
export {
  ErrorBoundary,
  clearChunkReloadFlag,
  isChunkLoadError,
  reloadOnceForNewVersion
};
//# sourceMappingURL=ErrorBoundary.js.map

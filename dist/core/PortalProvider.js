import { jsx, jsxs } from "react/jsx-runtime";
import { ConfigProvider, App } from "antd";
import enUS from "antd/locale/en_US";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { useStore } from "zustand";
import "dayjs/locale/vi";
import { bindHttpAuth, createAuthService } from "../auth/service.js";
import { createTranslator, builtinMessages } from "../i18n/messages.js";
import { PortalRouter } from "../router/PortalRouter.js";
import { createAppStore } from "../stores/appStore.js";
import { createAuthStore } from "../stores/authStore.js";
import { resolveStorage } from "../stores/storage.js";
import { buildTheme } from "../theme/theme.js";
import { PortalContext, usePortal } from "./context.js";
import { clearChunkReloadFlag, reloadOnceForNewVersion } from "./ErrorBoundary.js";
const antdLocales = { vi: viVN, en: enUS };
const EMPTY_ENV = {};
const EMPTY_LAYOUT = {};
const EMPTY_PAGES = {};
const HttpNotifierBridge = () => {
  const { http, t } = usePortal();
  const { notification } = App.useApp();
  useEffect(() => {
    http.setNotifier({
      success: (message) => notification.success({ message: t("http.success"), description: message }),
      error: (message) => notification.error({ message: t("http.error"), description: message ?? t("http.error.default") })
    });
    return () => http.setNotifier(void 0);
  }, [http, notification, t]);
  return null;
};
const SessionBootstrap = () => {
  const { authStore, authService } = usePortal();
  const status = useStore(authStore, (state) => state.status);
  useEffect(() => {
    if (status === "checking" && authService) {
      authService.reloadSession().catch(() => void 0);
    }
  }, [status, authService]);
  return null;
};
const PortalProvider = ({
  app,
  routes,
  http,
  auth,
  basePath = "/",
  storage,
  storageKey,
  theme,
  i18n,
  env = EMPTY_ENV,
  layout = EMPTY_LAYOUT,
  pages = EMPTY_PAGES,
  antd,
  children,
  onError
}) => {
  const locales = i18n?.locales ?? ["vi", "en"];
  const defaultLocale = i18n?.defaultLocale ?? locales[0] ?? "vi";
  const [core] = useState(() => {
    const resolvedStorage = resolveStorage(storage);
    const key = storageKey ?? `portal:${app.code}`;
    const authStore = createAuthStore(key, resolvedStorage);
    const appStore = createAppStore(key, resolvedStorage, {
      themeMode: theme?.defaultMode ?? "light",
      locale: defaultLocale
    });
    const authService = auth ? createAuthService(auth, authStore) : void 0;
    if (!auth) authStore.setState({ status: "authenticated", permissions: [] });
    return { authStore, appStore, authService, storageKey: key };
  });
  useEffect(() => {
    const onPreloadError = (event) => {
      if (reloadOnceForNewVersion()) event.preventDefault();
    };
    const timer = setTimeout(clearChunkReloadFlag, 1e4);
    window.addEventListener("vite:preloadError", onPreloadError);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("vite:preloadError", onPreloadError);
    };
  }, []);
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === `${core.storageKey}:auth`) {
        let tokens;
        try {
          tokens = event.newValue ? JSON.parse(event.newValue)?.state?.tokens : void 0;
        } catch {
          tokens = void 0;
        }
        const state = core.authStore.getState();
        if (!tokens?.accessToken) {
          if (state.tokens) state.clear();
        } else if (tokens.accessToken !== state.tokens?.accessToken) {
          state.setTokens(tokens);
          if (state.status === "anonymous") core.authStore.setState({ status: "checking" });
        }
      } else if (event.key === `${core.storageKey}:app`) {
        void core.appStore.persist.rehydrate();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [core]);
  useLayoutEffect(() => {
    if (!auth || !core.authService) return void 0;
    return bindHttpAuth(http, core.authStore, core.authService, auth);
  }, [http, auth, core]);
  const themeMode = useStore(core.appStore, (state) => state.themeMode);
  const storedLocale = useStore(core.appStore, (state) => state.locale);
  const locale = locales.includes(storedLocale) ? storedLocale : defaultLocale;
  const t = useMemo(
    () => createTranslator({ ...builtinMessages[locale], ...i18n?.messages?.[locale] }),
    [locale, i18n?.messages]
  );
  useEffect(() => {
    dayjs.locale(locale);
    document.documentElement.lang = locale;
  }, [locale]);
  const contextValue = useMemo(
    () => ({
      app,
      routes,
      http,
      authAdapter: auth,
      authService: core.authService,
      authStore: core.authStore,
      appStore: core.appStore,
      env,
      locales,
      t,
      layout,
      pages,
      basePath,
      storageKey: core.storageKey,
      onError
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [app, routes, http, auth, core, env, t, layout, pages, basePath, onError, locales.join(",")]
  );
  const antdTheme = useMemo(() => buildTheme(themeMode, theme), [themeMode, theme]);
  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
    document.body.style.margin = "0";
    document.body.style.background = antdTheme.token?.colorBgLayout ?? "";
  }, [themeMode, antdTheme]);
  return /* @__PURE__ */ jsx(PortalContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(ConfigProvider, { ...antd, theme: antdTheme, locale: antdLocales[locale], children: /* @__PURE__ */ jsxs(App, { children: [
    /* @__PURE__ */ jsx(HttpNotifierBridge, {}),
    auth && /* @__PURE__ */ jsx(SessionBootstrap, {}),
    children,
    /* @__PURE__ */ jsx(PortalRouter, {})
  ] }) }) });
};
export {
  PortalProvider
};
//# sourceMappingURL=PortalProvider.js.map

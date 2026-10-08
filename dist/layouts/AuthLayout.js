import { jsxs, jsx } from "react/jsx-runtime";
import { theme, Flex, Typography, Card } from "antd";
import { useEffect } from "react";
import { Outlet } from "react-router";
import { usePortal } from "../core/context.js";
import { LocaleSwitch, ThemeSwitch } from "./HeaderControls.js";
const AuthLayout = () => {
  const { app, layout } = usePortal();
  const { token } = theme.useToken();
  useEffect(() => {
    document.title = app.name;
  }, [app.name]);
  return /* @__PURE__ */ jsxs(
    Flex,
    {
      vertical: true,
      align: "center",
      justify: "center",
      style: { minHeight: "100vh", padding: 16, background: token.colorBgLayout, position: "relative" },
      children: [
        /* @__PURE__ */ jsxs(Flex, { gap: 4, style: { position: "absolute", top: 12, right: 12 }, children: [
          layout.showLocaleSwitch !== false && /* @__PURE__ */ jsx(LocaleSwitch, {}),
          layout.showThemeSwitch !== false && /* @__PURE__ */ jsx(ThemeSwitch, {})
        ] }),
        /* @__PURE__ */ jsxs(Flex, { vertical: true, align: "center", gap: 8, style: { marginBottom: 24 }, children: [
          app.logo,
          /* @__PURE__ */ jsx(Typography.Title, { level: 3, style: { margin: 0 }, children: app.name })
        ] }),
        /* @__PURE__ */ jsx(Card, { style: { width: "100%", maxWidth: 400 }, styles: { body: { padding: 28 } }, children: /* @__PURE__ */ jsx(Outlet, {}) }),
        app.version && /* @__PURE__ */ jsxs(Typography.Text, { type: "secondary", style: { marginTop: 16, fontSize: 12 }, children: [
          "v",
          app.version
        ] })
      ]
    }
  );
};
export {
  AuthLayout
};
//# sourceMappingURL=AuthLayout.js.map

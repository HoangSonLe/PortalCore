import { jsx, jsxs } from "react/jsx-runtime";
import { GlobalOutlined, SunOutlined, MoonOutlined, LogoutOutlined } from "@ant-design/icons";
import { Dropdown, Button, Tooltip, Flex, Avatar, Typography } from "antd";
import { usePortal } from "../core/context.js";
import { useT, useAppSettings, useAuth } from "../core/hooks.js";
import { localeLabels } from "../i18n/messages.js";
const ThemeSwitch = () => {
  const t = useT();
  const { themeMode, toggleThemeMode } = useAppSettings();
  const isDark = themeMode === "dark";
  return /* @__PURE__ */ jsx(Tooltip, { title: t(isDark ? "layout.theme.light" : "layout.theme.dark"), children: /* @__PURE__ */ jsx(
    Button,
    {
      type: "text",
      "aria-label": t(isDark ? "layout.theme.light" : "layout.theme.dark"),
      icon: isDark ? /* @__PURE__ */ jsx(SunOutlined, {}) : /* @__PURE__ */ jsx(MoonOutlined, {}),
      onClick: toggleThemeMode
    }
  ) });
};
const LocaleSwitch = () => {
  const t = useT();
  const { locale, locales, setLocale } = useAppSettings();
  if (locales.length < 2) return null;
  const items = locales.map((code) => ({ key: code, label: localeLabels[code] ?? code }));
  return /* @__PURE__ */ jsx(
    Dropdown,
    {
      menu: { items, selectable: true, selectedKeys: [locale], onClick: ({ key }) => setLocale(key) },
      trigger: ["click"],
      children: /* @__PURE__ */ jsx(Button, { type: "text", icon: /* @__PURE__ */ jsx(GlobalOutlined, {}), "aria-label": t("layout.language"), children: locale.toUpperCase() })
    }
  );
};
const UserMenu = ({ compact = false }) => {
  const t = useT();
  const { layout } = usePortal();
  const { user, enabled, logout } = useAuth();
  if (!enabled || !user) return null;
  const extraItems = layout.userMenuItems ?? [];
  const items = [
    ...extraItems.map(({ key, label, icon }) => ({ key, label, icon })),
    ...extraItems.length ? [{ type: "divider" }] : [],
    { key: "__logout", label: t("auth.logout"), icon: /* @__PURE__ */ jsx(LogoutOutlined, {}), danger: true }
  ];
  const handleClick = ({ key }) => {
    if (key === "__logout") {
      void logout();
      return;
    }
    extraItems.find((item) => item.key === key)?.onClick?.();
  };
  return /* @__PURE__ */ jsx(Dropdown, { menu: { items, onClick: handleClick }, trigger: ["click"], placement: "bottomRight", children: /* @__PURE__ */ jsx(Button, { type: "text", style: { height: 40, paddingInline: 8 }, "aria-label": user.name, children: /* @__PURE__ */ jsxs(Flex, { align: "center", gap: 8, children: [
    /* @__PURE__ */ jsx(Avatar, { size: 28, src: user.avatar, children: user.name?.charAt(0).toUpperCase() }),
    !compact && /* @__PURE__ */ jsx(Typography.Text, { style: { maxWidth: 160 }, ellipsis: true, children: user.name })
  ] }) }) });
};
export {
  LocaleSwitch,
  ThemeSwitch,
  UserMenu
};
//# sourceMappingURL=HeaderControls.js.map

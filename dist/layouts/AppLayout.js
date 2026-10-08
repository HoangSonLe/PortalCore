import { jsx, jsxs } from "react/jsx-runtime";
import { MenuOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { theme, Grid, Layout, Drawer, Button, Breadcrumb, Flex, Spin, Menu } from "antd";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useNavigate, useLocation, Link, Outlet } from "react-router";
import { usePortal } from "../core/context.js";
import { ErrorBoundary } from "../core/ErrorBoundary.js";
import { useT, useAppSettings } from "../core/hooks.js";
import { useVisibleRoutes, useCurrentRoute } from "../router/useVisibleRoutes.js";
import { joinPath } from "../utils/url.js";
import { LocaleSwitch, ThemeSwitch, UserMenu } from "./HeaderControls.js";
const buildMenuItems = (routes, t, parentPath = "/") => routes.flatMap((route) => {
  if (route.index || route.hideInMenu || !route.title) return [];
  const fullPath = joinPath(parentPath, route.path);
  const children = buildMenuItems(route.children ?? [], t, fullPath);
  if (children.length > 0) {
    return [{ key: fullPath, icon: route.icon, label: t(route.title), children }];
  }
  return [{ key: fullPath, icon: route.icon, label: t(route.title) }];
});
const collectLeafKeys = (items) => items.flatMap((item) => {
  if (!item || !("key" in item)) return [];
  return "children" in item && item.children ? collectLeafKeys(item.children) : [String(item.key)];
});
const SiderBrand = ({ collapsed }) => {
  const { app } = usePortal();
  return /* @__PURE__ */ jsxs(
    Flex,
    {
      align: "center",
      gap: 10,
      style: {
        height: 56,
        paddingInline: collapsed ? 0 : 20,
        justifyContent: collapsed ? "center" : "flex-start",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
      },
      children: [
        app.logo,
        !collapsed && /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            },
            children: app.name
          }
        )
      ]
    }
  );
};
const AppLayout = () => {
  const t = useT();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { app, layout, onError } = usePortal();
  const { siderCollapsed, setSiderCollapsed } = useAppSettings();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const visibleRoutes = useVisibleRoutes();
  const current = useCurrentRoute();
  const menuItems = useMemo(() => buildMenuItems(visibleRoutes, t), [visibleRoutes, t]);
  const parentKeys = useMemo(() => current?.chain.slice(0, -1).map((item) => item.fullPath) ?? [], [current]);
  const selectedKey = useMemo(
    () => collectLeafKeys(menuItems).filter((key) => pathname === key || pathname.startsWith(`${key}/`)).sort((a, b) => b.length - a.length)[0],
    [menuItems, pathname]
  );
  const [openKeys, setOpenKeys] = useState(parentKeys);
  useEffect(() => {
    setOpenKeys((prev) => Array.from(/* @__PURE__ */ new Set([...prev, ...parentKeys])));
  }, [parentKeys]);
  const currentTitle = current?.route.title ? t(current.route.title) : void 0;
  useEffect(() => {
    document.title = currentTitle ? `${currentTitle} · ${app.name}` : app.name;
  }, [currentTitle, app.name]);
  const breadcrumbItems = (current?.chain ?? []).filter((item) => item.route.title).map((item, index, list) => ({
    key: item.fullPath,
    title: item.route.element && index < list.length - 1 && !item.fullPath.includes(":") ? /* @__PURE__ */ jsx(Link, { to: item.fullPath, children: t(item.route.title) }) : t(item.route.title)
  }));
  const menu = (collapsed, onNavigate) => /* @__PURE__ */ jsx(
    Menu,
    {
      theme: "dark",
      mode: "inline",
      items: menuItems,
      selectedKeys: selectedKey ? [selectedKey] : [],
      ...collapsed ? {} : { openKeys, onOpenChange: setOpenKeys },
      onClick: ({ key }) => {
        onNavigate?.();
        navigate(key);
      },
      style: { borderInlineEnd: "none", paddingBlock: 8 }
    }
  );
  return /* @__PURE__ */ jsxs(Layout, { style: { minHeight: "100vh" }, children: [
    !isMobile && /* @__PURE__ */ jsxs(
      Layout.Sider,
      {
        width: layout.siderWidth ?? 240,
        collapsedWidth: 64,
        collapsed: siderCollapsed,
        trigger: null,
        style: { position: "sticky", top: 0, height: "100vh", overflow: "auto" },
        children: [
          /* @__PURE__ */ jsx(SiderBrand, { collapsed: siderCollapsed }),
          menu(siderCollapsed)
        ]
      }
    ),
    isMobile && /* @__PURE__ */ jsxs(
      Drawer,
      {
        open: drawerOpen,
        onClose: () => setDrawerOpen(false),
        placement: "left",
        width: 260,
        closable: false,
        styles: { body: { padding: 0, background: token.Layout?.siderBg } },
        children: [
          /* @__PURE__ */ jsx(SiderBrand, { collapsed: false }),
          menu(false, () => setDrawerOpen(false))
        ]
      }
    ),
    /* @__PURE__ */ jsxs(Layout, { children: [
      /* @__PURE__ */ jsxs(
        Layout.Header,
        {
          style: {
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${token.colorBorderSecondary}`
          },
          children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "text",
                "aria-label": t(siderCollapsed ? "layout.expand" : "layout.collapse"),
                icon: isMobile ? /* @__PURE__ */ jsx(MenuOutlined, {}) : siderCollapsed ? /* @__PURE__ */ jsx(MenuUnfoldOutlined, {}) : /* @__PURE__ */ jsx(MenuFoldOutlined, {}),
                onClick: () => isMobile ? setDrawerOpen(true) : setSiderCollapsed(!siderCollapsed)
              }
            ),
            !isMobile && /* @__PURE__ */ jsx(Breadcrumb, { items: breadcrumbItems }),
            /* @__PURE__ */ jsx("div", { style: { flex: 1 } }),
            /* @__PURE__ */ jsxs(Flex, { align: "center", gap: 4, children: [
              layout.headerExtra,
              layout.showLocaleSwitch !== false && /* @__PURE__ */ jsx(LocaleSwitch, {}),
              layout.showThemeSwitch !== false && /* @__PURE__ */ jsx(ThemeSwitch, {}),
              /* @__PURE__ */ jsx(UserMenu, { compact: isMobile })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(Layout.Content, { style: { padding: isMobile ? 16 : 24 }, children: /* @__PURE__ */ jsx(ErrorBoundary, { onError, children: /* @__PURE__ */ jsx(
        Suspense,
        {
          fallback: /* @__PURE__ */ jsx(Flex, { align: "center", justify: "center", style: { minHeight: 240 }, children: /* @__PURE__ */ jsx(Spin, {}) }),
          children: /* @__PURE__ */ jsx(Outlet, {})
        }
      ) }, pathname) }),
      layout.footer && /* @__PURE__ */ jsx(Layout.Footer, { style: { textAlign: "center", color: token.colorTextSecondary }, children: layout.footer })
    ] })
  ] });
};
export {
  AppLayout
};
//# sourceMappingURL=AppLayout.js.map

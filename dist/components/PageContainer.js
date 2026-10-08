import { jsxs, jsx } from "react/jsx-runtime";
import { Flex, Typography, Space } from "antd";
import { useT } from "../core/hooks.js";
import { useCurrentRoute } from "../router/useVisibleRoutes.js";
const PageContainer = ({ title, description, extra, children }) => {
  const t = useT();
  const current = useCurrentRoute();
  const finalTitle = title ?? (current?.route.title ? t(current.route.title) : void 0);
  return /* @__PURE__ */ jsxs(Flex, { vertical: true, gap: 16, children: [
    (finalTitle || extra) && /* @__PURE__ */ jsxs(Flex, { justify: "space-between", align: "center", wrap: true, gap: 12, children: [
      /* @__PURE__ */ jsxs("div", { style: { minWidth: 0 }, children: [
        finalTitle && /* @__PURE__ */ jsx(Typography.Title, { level: 4, style: { margin: 0 }, children: finalTitle }),
        description && /* @__PURE__ */ jsx(Typography.Text, { type: "secondary", children: description })
      ] }),
      extra && /* @__PURE__ */ jsx(Space, { wrap: true, children: extra })
    ] }),
    children
  ] });
};
export {
  PageContainer
};
//# sourceMappingURL=PageContainer.js.map

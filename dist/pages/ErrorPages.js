import { jsx } from "react/jsx-runtime";
import { Result, Button } from "antd";
import { useNavigate } from "react-router";
import { useT } from "../core/hooks.js";
const BackHomeButton = () => {
  const t = useT();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsx(Button, { type: "primary", onClick: () => navigate("/"), children: t("error.backHome") });
};
const NotFoundPage = () => {
  const t = useT();
  return /* @__PURE__ */ jsx(
    Result,
    {
      status: "404",
      title: t("error.notFound.title"),
      subTitle: t("error.notFound.description"),
      extra: /* @__PURE__ */ jsx(BackHomeButton, {})
    }
  );
};
const ForbiddenPage = () => {
  const t = useT();
  return /* @__PURE__ */ jsx(
    Result,
    {
      status: "403",
      title: t("error.forbidden.title"),
      subTitle: t("error.forbidden.description"),
      extra: /* @__PURE__ */ jsx(BackHomeButton, {})
    }
  );
};
export {
  ForbiddenPage,
  NotFoundPage
};
//# sourceMappingURL=ErrorPages.js.map

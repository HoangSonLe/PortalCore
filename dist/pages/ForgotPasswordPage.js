import { jsx, jsxs } from "react/jsx-runtime";
import { MailOutlined } from "@ant-design/icons";
import { Result, Flex, Typography, Alert, Form, Input, Button } from "antd";
import { useState } from "react";
import { Link } from "react-router";
import { useT, useAuth } from "../core/hooks.js";
import { isHttpError } from "../http/errors.js";
const ForgotPasswordPage = () => {
  const t = useT();
  const { forgotPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState();
  const handleFinish = async ({ email }) => {
    if (!forgotPassword) return;
    setSubmitting(true);
    setError(void 0);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(isHttpError(err) && err.serverMessage || t("http.error.default"));
    } finally {
      setSubmitting(false);
    }
  };
  if (sent) {
    return /* @__PURE__ */ jsx(
      Result,
      {
        status: "success",
        title: t("auth.forgot.sent"),
        extra: /* @__PURE__ */ jsx(Link, { to: "/auth/login", children: t("auth.forgot.back") }),
        style: { padding: 0 }
      }
    );
  }
  return /* @__PURE__ */ jsxs(Flex, { vertical: true, gap: 24, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Typography.Title, { level: 4, style: { margin: 0, textAlign: "center" }, children: t("auth.forgot.title") }),
      /* @__PURE__ */ jsx(Typography.Paragraph, { type: "secondary", style: { textAlign: "center", margin: "8px 0 0" }, children: t("auth.forgot.description") })
    ] }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", showIcon: true, message: error }),
    /* @__PURE__ */ jsxs(Form, { layout: "vertical", onFinish: handleFinish, requiredMark: false, children: [
      /* @__PURE__ */ jsx(
        Form.Item,
        {
          name: "email",
          label: t("auth.forgot.email"),
          rules: [{ required: true, type: "email", message: t("auth.required", { field: "email" }) }],
          children: /* @__PURE__ */ jsx(Input, { size: "large", prefix: /* @__PURE__ */ jsx(MailOutlined, {}), autoComplete: "email", autoFocus: true })
        }
      ),
      /* @__PURE__ */ jsx(Button, { type: "primary", size: "large", htmlType: "submit", block: true, loading: submitting, children: t("auth.forgot.submit") })
    ] }),
    /* @__PURE__ */ jsx(Flex, { justify: "center", children: /* @__PURE__ */ jsx(Link, { to: "/auth/login", children: t("auth.forgot.back") }) })
  ] });
};
export {
  ForgotPasswordPage
};
//# sourceMappingURL=ForgotPasswordPage.js.map

import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Form, Flex, Typography, Alert, Input, Button, Divider, Space } from "antd";
import { useState } from "react";
import { Link } from "react-router";
import { useT, useAuth } from "../core/hooks.js";
import { isHttpError } from "../http/errors.js";
const LoginPage = ({ quickAccounts }) => {
  const t = useT();
  const { login, canForgotPassword } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState();
  const handleFinish = async (values) => {
    setSubmitting(true);
    setError(void 0);
    try {
      await login(values);
    } catch (err) {
      setError(isHttpError(err) && err.serverMessage || t("auth.login.failed"));
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs(Flex, { vertical: true, gap: 20, children: [
    /* @__PURE__ */ jsx(Typography.Title, { level: 4, style: { margin: 0, textAlign: "center" }, children: t("auth.login.title") }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", showIcon: true, message: error }),
    /* @__PURE__ */ jsxs(Form, { form, layout: "vertical", size: "large", onFinish: handleFinish, requiredMark: false, children: [
      /* @__PURE__ */ jsx(
        Form.Item,
        {
          name: "username",
          label: t("auth.login.username"),
          rules: [{ required: true, message: t("auth.required", { field: t("auth.login.username").toLowerCase() }) }],
          children: /* @__PURE__ */ jsx(Input, { prefix: /* @__PURE__ */ jsx(UserOutlined, {}), autoComplete: "username", autoFocus: true })
        }
      ),
      /* @__PURE__ */ jsx(
        Form.Item,
        {
          name: "password",
          label: t("auth.login.password"),
          rules: [{ required: true, message: t("auth.required", { field: t("auth.login.password").toLowerCase() }) }],
          children: /* @__PURE__ */ jsx(Input.Password, { prefix: /* @__PURE__ */ jsx(LockOutlined, {}), autoComplete: "current-password" })
        }
      ),
      canForgotPassword && /* @__PURE__ */ jsx(Flex, { justify: "flex-end", style: { marginTop: -12, marginBottom: 16 }, children: /* @__PURE__ */ jsx(Link, { to: "/auth/forgot-password", children: t("auth.login.forgot") }) }),
      /* @__PURE__ */ jsx(Button, { type: "primary", htmlType: "submit", block: true, loading: submitting, children: t("auth.login.submit") })
    ] }),
    quickAccounts && quickAccounts.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Divider, { plain: true, style: { margin: 0 }, children: /* @__PURE__ */ jsx(Typography.Text, { type: "secondary", style: { fontSize: 12 }, children: t("auth.quick") }) }),
      /* @__PURE__ */ jsx(Space, { wrap: true, style: { justifyContent: "center" }, children: quickAccounts.map((account) => /* @__PURE__ */ jsxs(
        Button,
        {
          size: "small",
          onClick: () => {
            form.setFieldsValue({ username: account.username, password: account.password });
            form.submit();
          },
          children: [
            account.username,
            " · ",
            account.label
          ]
        },
        account.username
      )) })
    ] })
  ] });
};
export {
  LoginPage
};
//# sourceMappingURL=LoginPage.js.map

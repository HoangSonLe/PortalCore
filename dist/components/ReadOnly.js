import { jsx } from "react/jsx-runtime";
import { theme, ConfigProvider } from "antd";
const ReadOnlyProvider = ({
  readOnly,
  component,
  children
}) => {
  const { token } = theme.useToken();
  if (!readOnly) return children;
  return /* @__PURE__ */ jsx(
    ConfigProvider,
    {
      theme: {
        components: {
          [component]: { colorTextDisabled: token.colorText, colorBgContainerDisabled: token.colorFillQuaternary }
        }
      },
      children
    }
  );
};
export {
  ReadOnlyProvider
};
//# sourceMappingURL=ReadOnly.js.map

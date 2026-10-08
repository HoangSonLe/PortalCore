import { jsx } from "react/jsx-runtime";
import { InputNumber } from "antd";
import { ReadOnlyProvider } from "./ReadOnly.js";
const formatThousands = (value, separator = ",") => {
  if (value === void 0 || value === null || value === "") return "";
  const [integer, decimal] = String(value).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decimal !== void 0 ? `${grouped}.${decimal}` : grouped;
};
const PortalNumberInput = ({
  inputType,
  separator = ",",
  step,
  readOnly = false,
  disabled = false,
  style,
  ...props
}) => /* @__PURE__ */ jsx(ReadOnlyProvider, { readOnly, component: "InputNumber", children: /* @__PURE__ */ jsx(
  InputNumber,
  {
    min: 0,
    style: { width: "100%", ...style },
    formatter: (value) => formatThousands(value, separator),
    parser: (value) => Number((value ?? "").split(separator).join("")),
    suffix: inputType === "currency" ? "VNĐ" : void 0,
    step: step ?? (inputType === "currency" ? 1e3 : void 0),
    disabled: readOnly || disabled,
    ...props
  }
) });
export {
  PortalNumberInput,
  formatThousands
};
//# sourceMappingURL=PortalNumberInput.js.map

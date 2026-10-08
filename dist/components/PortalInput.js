import { jsx } from "react/jsx-runtime";
import { Input } from "antd";
import { useState, useRef, useEffect } from "react";
import { ReadOnlyProvider } from "./ReadOnly.js";
const transformText = (value, textType) => {
  switch (textType) {
    case "uppercase":
      return value.toUpperCase();
    case "lowercase":
      return value.toLowerCase();
    case "uppercaseFirstLetter":
      return value.charAt(0).toUpperCase() + value.slice(1);
    case "capitalize":
      return value.replace(/(^|\s)(\S)/g, (_match, space, char) => space + char.toUpperCase());
    default:
      return value;
  }
};
const useBufferedValue = (propValue, onChange, debounceTime) => {
  const [value, setValue] = useState(propValue ?? "");
  const timerRef = useRef(void 0);
  const pendingRef = useRef(void 0);
  useEffect(() => {
    if (pendingRef.current === void 0) setValue(propValue ?? "");
  }, [propValue]);
  useEffect(() => () => clearTimeout(timerRef.current), []);
  const flush = () => {
    clearTimeout(timerRef.current);
    if (pendingRef.current !== void 0) {
      onChange?.(pendingRef.current);
      pendingRef.current = void 0;
    }
  };
  const update = (next) => {
    setValue(next);
    if (!debounceTime) {
      onChange?.(next);
      return;
    }
    pendingRef.current = next;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, debounceTime);
  };
  return { value, update, flush };
};
const PortalInput = ({
  value: propValue,
  onChange,
  regexRule,
  textType,
  debounceTime = 0,
  readOnly = false,
  disabled = false,
  onBlur,
  ...props
}) => {
  const { value, update, flush } = useBufferedValue(propValue, onChange, debounceTime);
  const handleChange = (event) => {
    const next = transformText(event.target.value, textType);
    if (regexRule && next !== "" && !regexRule.test(next)) return;
    update(next);
  };
  return /* @__PURE__ */ jsx(ReadOnlyProvider, { readOnly, component: "Input", children: /* @__PURE__ */ jsx(
    Input,
    {
      ...props,
      value,
      onChange: handleChange,
      onBlur: (event) => {
        flush();
        onBlur?.(event);
      },
      disabled: readOnly || disabled
    }
  ) });
};
const PortalInputTextArea = ({
  value: propValue,
  onChange,
  debounceTime = 0,
  readOnly = false,
  disabled = false,
  onBlur,
  ...props
}) => {
  const { value, update, flush } = useBufferedValue(propValue, onChange, debounceTime);
  return /* @__PURE__ */ jsx(ReadOnlyProvider, { readOnly, component: "Input", children: /* @__PURE__ */ jsx(
    Input.TextArea,
    {
      autoSize: { minRows: 3, maxRows: 8 },
      ...props,
      value,
      onChange: (event) => update(event.target.value),
      onBlur: (event) => {
        flush();
        onBlur?.(event);
      },
      disabled: readOnly || disabled
    }
  ) });
};
export {
  PortalInput,
  PortalInputTextArea,
  transformText
};
//# sourceMappingURL=PortalInput.js.map

import { jsx } from "react/jsx-runtime";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useT } from "../core/hooks.js";
import { ReadOnlyProvider } from "./ReadOnly.js";
dayjs.extend(customParseFormat);
const parseDateValue = (value, valueFormat = "iso") => {
  if (!value) return void 0;
  const parsed = valueFormat === "iso" ? dayjs(value) : dayjs(value, valueFormat, true);
  return parsed.isValid() ? parsed : void 0;
};
const formatDateValue = (date, valueFormat = "iso") => valueFormat === "iso" ? date.toISOString() : date.format(valueFormat);
const getDateFormat = (picker, showTime) => {
  switch (picker) {
    case "time":
      return "HH:mm:ss";
    case "month":
      return "MM/YYYY";
    case "year":
      return "YYYY";
    case "week":
    case "quarter":
      return void 0;
    default:
      return showTime ? "HH:mm:ss DD/MM/YYYY" : "DD/MM/YYYY";
  }
};
const PortalDatePicker = ({
  value,
  defaultValue,
  onChange,
  valueFormat = "iso",
  readOnly = false,
  disabled = false,
  ...props
}) => /* @__PURE__ */ jsx(ReadOnlyProvider, { readOnly, component: "DatePicker", children: /* @__PURE__ */ jsx(
  DatePicker,
  {
    format: getDateFormat(props.picker, props.showTime),
    style: { width: "100%" },
    ...props,
    disabled: readOnly || disabled,
    value: parseDateValue(value, valueFormat),
    defaultValue: parseDateValue(defaultValue, valueFormat),
    onChange: (date) => onChange?.(date && date.isValid() ? formatDateValue(date, valueFormat) : void 0)
  }
) });
const useRangePresets = () => {
  const t = useT();
  const now = dayjs();
  return [
    { label: t("picker.today"), value: [now.startOf("day"), now.endOf("day")] },
    { label: t("picker.thisWeek"), value: [now.startOf("week"), now.endOf("day")] },
    { label: t("picker.thisMonth"), value: [now.startOf("month"), now.endOf("day")] },
    { label: t("picker.last7Days"), value: [now.subtract(7, "day").startOf("day"), now.endOf("day")] },
    { label: t("picker.last30Days"), value: [now.subtract(30, "day").startOf("day"), now.endOf("day")] }
  ];
};
const normalizeRange = (start, end, picker, showTime) => {
  if (showTime || picker === "time") return [start, end];
  const unit = picker === "week" || picker === "month" || picker === "year" || picker === "quarter" ? picker : "day";
  const startUnit = unit === "quarter" ? "month" : unit;
  return [start.startOf(startUnit), end.endOf(startUnit)];
};
const PortalRangePicker = ({
  value,
  defaultValue,
  onChange,
  usePortalPresets = true,
  presets,
  valueFormat = "iso",
  readOnly = false,
  disabled = false,
  ...props
}) => {
  const portalPresets = useRangePresets();
  return /* @__PURE__ */ jsx(ReadOnlyProvider, { readOnly, component: "DatePicker", children: /* @__PURE__ */ jsx(
    DatePicker.RangePicker,
    {
      format: getDateFormat(props.picker, props.showTime),
      style: { width: "100%" },
      ...props,
      presets: usePortalPresets ? portalPresets : presets,
      disabled: readOnly || disabled,
      value: value ? [parseDateValue(value[0], valueFormat) ?? null, parseDateValue(value[1], valueFormat) ?? null] : void 0,
      defaultValue: defaultValue ? [
        parseDateValue(defaultValue[0], valueFormat) ?? null,
        parseDateValue(defaultValue[1], valueFormat) ?? null
      ] : void 0,
      onChange: (dates) => {
        if (!dates?.[0] || !dates[1]) {
          onChange?.(void 0);
          return;
        }
        const [start, end] = normalizeRange(dates[0], dates[1], props.picker, props.showTime);
        onChange?.([formatDateValue(start, valueFormat), formatDateValue(end, valueFormat)]);
      }
    }
  ) });
};
export {
  PortalDatePicker,
  PortalRangePicker,
  formatDateValue,
  getDateFormat,
  normalizeRange,
  parseDateValue,
  useRangePresets
};
//# sourceMappingURL=PortalDatePicker.js.map

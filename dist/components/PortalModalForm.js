import { jsx } from "react/jsx-runtime";
import { ModalForm } from "@ant-design/pro-components";
import { useT } from "../core/hooks.js";
const PortalModalForm = ({
  open,
  record,
  onClose,
  onSaved,
  title,
  create,
  update,
  toFormValues,
  recordKey = "id",
  initialValues,
  modalProps,
  children,
  ...props
}) => {
  const t = useT();
  const isEdit = record !== void 0;
  const resolvedTitle = title && typeof title === "object" && ("create" in title || "edit" in title) ? isEdit ? title.edit?.(record) ?? t("button.edit") : title.create ?? t("button.add") : title ?? t(isEdit ? "button.edit" : "button.add");
  return /* @__PURE__ */ jsx(
    ModalForm,
    {
      width: 560,
      ...props,
      title: resolvedTitle,
      open,
      initialValues: isEdit ? toFormValues ? toFormValues(record) : record : initialValues,
      modalProps: { destroyOnHidden: true, ...modalProps, onCancel: onClose },
      onFinish: async (values) => {
        try {
          if (isEdit) await update?.(record, values);
          else await create?.(values);
        } catch {
          return false;
        }
        onSaved?.();
        onClose();
        return true;
      },
      children
    },
    isEdit ? String(record[recordKey] ?? "edit") : "create"
  );
};
export {
  PortalModalForm
};
//# sourceMappingURL=PortalModalForm.js.map

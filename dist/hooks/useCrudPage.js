import { useRef, useCallback } from "react";
import { useDisclosure } from "./useDisclosure.js";
const useCrudPage = ({ remove } = {}) => {
  const actionRef = useRef(void 0);
  const editor = useDisclosure();
  const removeRef = useRef(remove);
  removeRef.current = remove;
  const reload = useCallback(() => actionRef.current?.reload(), []);
  const openCreate = useCallback(() => editor.show(void 0), [editor]);
  const openEdit = useCallback((record) => editor.show(record), [editor]);
  const removeRecord = useCallback(
    async (record) => {
      await removeRef.current?.(record);
      reload();
    },
    [reload]
  );
  return {
    actionRef,
    reload,
    editor,
    openCreate,
    openEdit,
    removeRecord,
    /** Trải vào `<PortalModalForm {...crud.formProps} />`. */
    formProps: { open: editor.open, record: editor.data, onClose: editor.hide, onSaved: reload }
  };
};
export {
  useCrudPage
};
//# sourceMappingURL=useCrudPage.js.map

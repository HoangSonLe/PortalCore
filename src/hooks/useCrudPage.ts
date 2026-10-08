import type { ActionType } from '@ant-design/pro-components';

import { useCallback, useRef } from 'react';

import { useDisclosure } from './useDisclosure';

export interface UseCrudPageOptions<T> {
  /** Gọi API xoá. Xoá xong bảng tự tải lại. */
  remove?: (record: T) => Promise<unknown>;
}

/**
 * Gom phần lặp lại của trang danh mục: bảng + modal thêm/sửa + xoá + tải lại.
 *
 * ```tsx
 * const crud = useCrudPage<User>({ remove: user => userApi.remove(user.id) });
 *
 * <PortalButton actionType="add" onClick={crud.openCreate} />
 * <PortalTable actionRef={crud.actionRef} actionColumn={{ renderButtons: user => [
 *   { actionType: 'edit', onClick: () => crud.openEdit(user) },
 *   { actionType: 'delete', popConfirm: { title: 'Xoá?' }, onClick: () => crud.removeRecord(user) },
 * ] }} />
 * <PortalModalForm {...crud.formProps} create={userApi.create} update={(u, v) => userApi.update(u.id, v)}>...</PortalModalForm>
 * ```
 */
export const useCrudPage = <T>({ remove }: UseCrudPageOptions<T> = {}) => {
  const actionRef = useRef<ActionType>(undefined);
  const editor = useDisclosure<T>();
  const removeRef = useRef(remove);

  removeRef.current = remove;

  const reload = useCallback(() => actionRef.current?.reload(), []);
  const openCreate = useCallback(() => editor.show(undefined), [editor]);
  const openEdit = useCallback((record: T) => editor.show(record), [editor]);
  const removeRecord = useCallback(
    async (record: T) => {
      await removeRef.current?.(record);
      reload();
    },
    [reload],
  );

  return {
    actionRef,
    reload,
    editor,
    openCreate,
    openEdit,
    removeRecord,
    /** Trải vào `<PortalModalForm {...crud.formProps} />`. */
    formProps: { open: editor.open, record: editor.data, onClose: editor.hide, onSaved: reload },
  };
};

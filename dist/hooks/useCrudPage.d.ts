import { ActionType } from '@ant-design/pro-components';
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
export declare const useCrudPage: <T>({ remove }?: UseCrudPageOptions<T>) => {
    actionRef: import('react').RefObject<ActionType | undefined>;
    reload: () => Promise<void> | undefined;
    editor: {
        open: boolean;
        data: T | undefined;
        show: (data?: T | undefined) => void;
        hide: () => void;
    };
    openCreate: () => void;
    openEdit: (record: T) => void;
    removeRecord: (record: T) => Promise<void>;
    /** Trải vào `<PortalModalForm {...crud.formProps} />`. */
    formProps: {
        open: boolean;
        record: T | undefined;
        onClose: () => void;
        onSaved: () => Promise<void> | undefined;
    };
};

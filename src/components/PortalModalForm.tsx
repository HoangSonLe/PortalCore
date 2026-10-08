import type { ModalFormProps } from '@ant-design/pro-components';
import type { ReactNode } from 'react';

import { ModalForm } from '@ant-design/pro-components';

import { useT } from '../core/hooks';

export interface PortalModalFormProps<T, V extends Record<string, any>> extends Omit<
  ModalFormProps<V>,
  'onFinish' | 'open' | 'title' | 'onOpenChange'
> {
  open: boolean;
  /** Có = đang sửa bản ghi này; không có = thêm mới. */
  record?: T;
  onClose: () => void;
  /** Gọi sau khi lưu thành công (thường là tải lại bảng). */
  onSaved?: () => void;
  /** Mặc định "Thêm mới" / "Chỉnh sửa". */
  title?: ReactNode | { create?: ReactNode; edit?: (record: T) => ReactNode };
  create?: (values: V) => Promise<unknown>;
  update?: (record: T, values: V) => Promise<unknown>;
  /** Đổi bản ghi sang giá trị form khi sửa. Mặc định dùng nguyên bản ghi. */
  toFormValues?: (record: T) => Partial<V>;
  /** Field làm khoá để reset form khi đổi bản ghi. Mặc định `id`. */
  recordKey?: string;
}

/**
 * ModalForm thêm/sửa dùng chung: lỗi API thì giữ modal (lỗi đã được toast), lưu xong thì đóng + `onSaved`.
 * Dùng cùng `useCrudPage`.
 */
export const PortalModalForm = <T extends Record<string, any>, V extends Record<string, any> = Record<string, any>>({
  open,
  record,
  onClose,
  onSaved,
  title,
  create,
  update,
  toFormValues,
  recordKey = 'id',
  initialValues,
  modalProps,
  children,
  ...props
}: PortalModalFormProps<T, V>) => {
  const t = useT();
  const isEdit = record !== undefined;

  const resolvedTitle =
    title && typeof title === 'object' && ('create' in title || 'edit' in title)
      ? isEdit
        ? ((title as { edit?: (r: T) => ReactNode }).edit?.(record) ?? t('button.edit'))
        : ((title as { create?: ReactNode }).create ?? t('button.add'))
      : ((title as ReactNode) ?? t(isEdit ? 'button.edit' : 'button.add'));

  return (
    <ModalForm<V>
      key={isEdit ? String(record[recordKey] ?? 'edit') : 'create'}
      width={560}
      {...props}
      title={resolvedTitle}
      open={open}
      initialValues={isEdit ? ((toFormValues ? toFormValues(record) : record) as unknown as V) : initialValues}
      modalProps={{ destroyOnHidden: true, ...modalProps, onCancel: onClose }}
      onFinish={async values => {
        try {
          if (isEdit) await update?.(record, values);
          else await create?.(values);
        } catch {
          return false;
        }

        onSaved?.();
        onClose();

        return true;
      }}
    >
      {children}
    </ModalForm>
  );
};

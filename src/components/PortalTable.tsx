import type { PortalButtonProps } from './PortalButton';
import type { ParamsType, ProColumns, ProCoreActionType, ProTableProps } from '@ant-design/pro-components';
import type { ReactNode } from 'react';

import { ProTable } from '@ant-design/pro-components';
import { useMemo } from 'react';

import { useT } from '../core/hooks';
import { PortalTableActionButton } from './PortalTableActionButton';

export interface PortalTableAction<DataType extends Record<string, any>> extends ProColumns<DataType> {
  /** Các nút trên mỗi dòng, hiển thị dạng icon + tooltip. */
  renderButtons?: (entity: DataType, index: number, action: ProCoreActionType | undefined) => PortalButtonProps[];
}

export interface PortalTableSearchItem {
  formItemProps: ProColumns['formItemProps'] & { label: ReactNode };
  renderFormItem: ProColumns['renderFormItem'];
  hideInForm?: boolean;
}

export interface PortalTableProps<
  DataType extends Record<string, any>,
  Params extends ParamsType = ParamsType,
  ValueType = 'text',
> extends ProTableProps<DataType, Params, ValueType> {
  /** Cột STT đánh số liên tục qua các trang. Mặc định bật; truyền object để chỉnh cột. */
  indexColumn?: ProColumns<DataType> | boolean;
  /** Cột thao tác (bên phải). */
  actionColumn?: PortalTableAction<DataType>;
  /** Ô tìm kiếm không gắn với cột nào. */
  searchFormItems?: PortalTableSearchItem[];
}

/**
 * ProTable cấu hình sẵn (giống PortalTable bên Kit cũ):
 * cột STT, cột thao tác `renderButtons`, ô tìm kiếm riêng, cột mặc định không hiện trong form tìm kiếm.
 * Mọi prop khác của ProTable truyền thẳng được.
 */
export const PortalTable = <
  DataType extends Record<string, any>,
  Params extends ParamsType = ParamsType,
  ValueType = 'text',
>({
  columns,
  indexColumn = true,
  actionColumn,
  searchFormItems,
  request,
  search,
  form,
  pagination,
  options,
  scroll,
  ...props
}: PortalTableProps<DataType, Params, ValueType>) => {
  const t = useT();

  const finalColumns = useMemo(() => {
    const indexColumns: ProColumns<DataType, ValueType>[] =
      indexColumn === false
        ? []
        : [
            {
              title: t('table.index'),
              dataIndex: '__index',
              width: 56,
              align: 'center',
              search: false,
              render: (_dom, _entity, index, action) =>
                index + 1 + ((action?.pageInfo?.current ?? 1) - 1) * (action?.pageInfo?.pageSize ?? 0),
              ...(typeof indexColumn === 'object' ? (indexColumn as ProColumns<DataType, ValueType>) : {}),
            },
          ];

    const searchColumns: ProColumns<DataType, ValueType>[] = (searchFormItems ?? []).map(
      ({ formItemProps, renderFormItem, hideInForm }) =>
        ({
          formItemProps,
          renderFormItem,
          hideInForm,
          hideInTable: true,
          hideInSetting: true,
        }) as ProColumns<DataType, ValueType>,
    );

    const actionColumns: ProColumns<DataType, ValueType>[] = actionColumn
      ? [
          {
            title: t('action.actions'),
            valueType: 'option',
            width: 120,
            fixed: 'right',
            render: (_dom, entity, index, action) => (
              <PortalTableActionButton buttons={actionColumn.renderButtons?.(entity, index, action)} />
            ),
            ...(actionColumn as ProColumns<DataType, ValueType>),
          },
        ]
      : [];

    const dataColumns = (columns ?? []).map(column => ({ search: false, ...column }) as ProColumns<DataType, ValueType>);

    return [...indexColumns, ...dataColumns, ...searchColumns, ...actionColumns];
  }, [columns, indexColumn, actionColumn, searchFormItems, t]);

  return (
    <ProTable<DataType, Params, ValueType>
      rowKey="id"
      cardBordered
      columns={finalColumns}
      search={search === false ? false : { labelWidth: 'auto', defaultCollapsed: false, ...search }}
      form={{ resetText: t('button.reset'), searchText: t('button.search'), ...form }}
      options={options ?? { fullScreen: true, reload: true, setting: true, density: false }}
      pagination={
        pagination === false
          ? false
          : { showSizeChanger: true, defaultPageSize: 50, pageSizeOptions: [10, 20, 50, 100, 200], ...pagination }
      }
      scroll={{ x: 'max-content', ...scroll }}
      dateFormatter="string"
      request={
        request
          ? async (...args) => {
              try {
                return await request(...args);
              } catch {
                // Lỗi API đã được HttpClient thông báo; bảng hiện rỗng thay vì treo loading.
                return { data: [], total: 0, success: false };
              }
            }
          : undefined
      }
      {...props}
    />
  );
};

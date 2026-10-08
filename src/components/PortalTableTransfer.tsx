import type { ColProps, FormProps, TableColumnsType, TableProps, TransferProps } from 'antd';
import type { TransferDirection } from 'antd/es/transfer';
import type { Key, ReactNode } from 'react';

import { Col, Flex, Form, InputNumber, Row, Table, Transfer } from 'antd';
import { useMemo, useState } from 'react';

import { useT } from '../core/hooks';
import { getByPath } from '../utils/string';

/** Bộ lọc cho từng bên của bảng chuyển (giống Kit cũ). */
export interface TransferSideFilter<T> {
  formProps?: Omit<FormProps, 'form' | 'onValuesChange'>;
  formItemSpan?: ColProps;
  formItems: { name: string; label?: ReactNode; render: () => ReactNode }[];
  onFilter: (filterParams: Record<string, any>, item: T) => boolean;
}

export type TransferFilter<T> = Record<TransferDirection, TransferSideFilter<T>>;

const FilterForm = <T,>({
  config,
  onChange,
}: {
  config: TransferSideFilter<T>;
  onChange: (values: Record<string, any>) => void;
}) => {
  const [form] = Form.useForm();

  return (
    <Form
      layout="inline"
      {...config.formProps}
      form={form}
      onValuesChange={() => onChange(form.getFieldsValue())}
      style={{ width: '100%', padding: '8px 0' }}
    >
      <Row style={{ width: '100%' }} gutter={[8, 8]}>
        {config.formItems.map(({ name, label, render }) => (
          <Col key={name} span={8} {...config.formItemSpan}>
            <Form.Item name={name} label={label} style={{ margin: 0 }}>
              {render()}
            </Form.Item>
          </Col>
        ))}
      </Row>
    </Form>
  );
};

/** Lọc + hiện bảng cho 1 bên của Transfer. */
const useSideFilters = <T,>(filter?: TransferFilter<T>) => {
  const [params, setParams] = useState<Record<TransferDirection, Record<string, any>>>({ left: {}, right: {} });

  const apply = <R extends T>(direction: TransferDirection, items: R[]): R[] =>
    filter ? items.filter(item => filter[direction].onFilter(params[direction], item)) : items;

  const renderForm = (direction: TransferDirection) =>
    filter ? (
      <FilterForm
        config={filter[direction]}
        onChange={values => setParams(prev => ({ ...prev, [direction]: values }))}
      />
    ) : null;

  return { apply, renderForm };
};

export interface PortalTableTransferProps<T> extends Omit<
  TransferProps<any>,
  'rowKey' | 'dataSource' | 'targetKeys' | 'onChange' | 'children'
> {
  dataSource: T[];
  leftColumns: TableColumnsType<T>;
  rightColumns: TableColumnsType<T>;
  filter?: TransferFilter<T>;
  /** Có thì `value` là mảng object (map theo `valueItems`), không thì là mảng key. */
  valueFormatter?: { rowKey?: string; valueItems: { dataIndex: string; name?: string }[] };
  value?: any[];
  onChange?: (value: any[]) => void;
  rowKey: string;
}

/** Chuyển bản ghi giữa 2 bảng, vd gán người dùng vào nhóm (giống PortalTableTransfer bên Kit cũ). */
export const PortalTableTransfer = <T extends object>({
  dataSource,
  leftColumns,
  rightColumns,
  filter,
  valueFormatter,
  value,
  onChange,
  rowKey,
  ...props
}: PortalTableTransferProps<T>) => {
  const { apply, renderForm } = useSideFilters(filter);

  const targetKeys = useMemo<Key[]>(
    () => (value ?? []).map(item => (valueFormatter ? getByPath(item, valueFormatter.rowKey ?? rowKey) : item)),
    [value, valueFormatter, rowKey],
  );

  const handleChange = (nextKeys: Key[]) => {
    if (!valueFormatter) {
      onChange?.(nextKeys);

      return;
    }

    onChange?.(
      nextKeys.map(key => {
        const item = dataSource.find(row => getByPath(row, rowKey) === key);

        return Object.fromEntries(
          valueFormatter.valueItems.map(({ dataIndex, name }) => [name ?? dataIndex, getByPath(item, dataIndex)]),
        );
      }),
    );
  };

  return (
    <Transfer
      style={{ width: '100%' }}
      {...props}
      rowKey={record => getByPath(record, rowKey)}
      dataSource={dataSource as any[]}
      targetKeys={targetKeys}
      onChange={handleChange}
      showSelectAll={false}
    >
      {({ direction, filteredItems, onItemSelect, onItemSelectAll, selectedKeys, disabled }) => {
        const rowSelection: TableProps<T>['rowSelection'] = {
          getCheckboxProps: () => ({ disabled }),
          onChange: keys => onItemSelectAll(keys, 'replace'),
          selectedRowKeys: selectedKeys,
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
        };

        return (
          <Flex vertical style={{ width: '100%' }}>
            {renderForm(direction)}
            <Table<T>
              rowKey={record => getByPath(record, rowKey)}
              rowSelection={rowSelection}
              columns={direction === 'left' ? leftColumns : rightColumns}
              dataSource={apply(direction, filteredItems as T[])}
              size="small"
              pagination={false}
              scroll={{ y: 320 }}
              style={{ pointerEvents: disabled ? 'none' : undefined }}
              onRow={record => ({
                style: { cursor: 'pointer' },
                onClick: () => {
                  if (disabled) return;

                  const key = getByPath(record, rowKey);

                  onItemSelect(key, !selectedKeys.includes(key));
                },
              })}
            />
          </Flex>
        );
      }}
    </Transfer>
  );
};

type CountRow<T> = T & { _id: string; _max: number };

export interface PortalTableCountTransferProps<T> extends Omit<PortalTableTransferProps<T>, 'valueFormatter'> {
  valueFormatter: {
    /** Field khoá trong `value`. Mặc định `rowKey`. */
    valueKey?: string;
    valueItems: { dataIndex: string; name?: string }[];
    count: {
      /** Field số lượng tối đa trong `dataSource`. */
      maxKey: string;
      /** Field số lượng trong `value`. */
      name: string;
      title?: ReactNode;
    };
  };
}

/**
 * Chuyển theo số lượng, vd phân bổ thiết bị: mỗi dòng có tối đa N, chọn chuyển bao nhiêu
 * (giống PortalTableCountTransfer bên Kit cũ).
 */
export const PortalTableCountTransfer = <T extends object>({
  dataSource,
  leftColumns,
  rightColumns,
  filter,
  valueFormatter,
  value,
  onChange,
  rowKey,
  ...props
}: PortalTableCountTransferProps<T>) => {
  const t = useT();
  const { apply, renderForm } = useSideFilters(filter);
  const { count, valueItems } = valueFormatter;
  const valueKey = valueFormatter.valueKey ?? rowKey;
  /** Số lượng đang nhập để chuyển, theo `_id` của dòng. */
  const [pending, setPending] = useState<Record<string, number>>({});

  const allocated = useMemo(() => {
    const map = new Map<string, number>();

    (value ?? []).forEach(item => map.set(String(getByPath(item, valueKey)), Number(getByPath(item, count.name)) || 0));

    return map;
  }, [value, valueKey, count.name]);

  const rows = useMemo<CountRow<T>[]>(() => {
    const left = dataSource.flatMap(item => {
      const id = String(getByPath(item, rowKey));
      const available = (Number(getByPath(item, count.maxKey)) || 0) - (allocated.get(id) ?? 0);

      return available > 0 ? [{ ...item, _id: id, _max: available }] : [];
    });
    const right = [...allocated.entries()].map(([id, amount]) => {
      const item = dataSource.find(row => String(getByPath(row, rowKey)) === id) ?? ({} as T);

      return { ...item, _id: `right-${id}`, _max: amount };
    });

    return [...left, ...right];
  }, [dataSource, allocated, rowKey, count.maxKey]);

  const targetKeys = rows.filter(row => row._id.startsWith('right-')).map(row => row._id);
  const selectedKeys = Object.keys(pending).filter(key => pending[key] > 0);

  const toggle = (row: CountRow<T>) => setPending(prev => ({ ...prev, [row._id]: prev[row._id] > 0 ? 0 : row._max }));

  const handleChange = (_next: Key[], direction: TransferDirection, moveKeys: Key[]) => {
    const next = new Map(allocated);

    moveKeys.forEach(key => {
      const rowId = String(key);
      const id = rowId.replace(/^right-/, '');
      const amount = pending[rowId] ?? 0;
      const current = next.get(id) ?? 0;
      const updated = direction === 'right' ? current + amount : current - amount;

      if (updated > 0) next.set(id, updated);
      else next.delete(id);
    });

    const existing = new Map((value ?? []).map(item => [String(getByPath(item, valueKey)), item]));

    onChange?.(
      [...next.entries()].map(([id, amount]) => {
        const base =
          existing.get(id) ??
          (() => {
            const item = dataSource.find(row => String(getByPath(row, rowKey)) === id);

            return {
              [valueKey]: getByPath(item, rowKey),
              ...Object.fromEntries(
                valueItems.map(({ dataIndex, name }) => [name ?? dataIndex, getByPath(item, dataIndex)]),
              ),
            };
          })();

        return { ...base, [count.name]: amount };
      }),
    );
    setPending({});
  };

  return (
    <Transfer
      style={{ width: '100%' }}
      {...props}
      rowKey={record => record._id}
      dataSource={rows}
      targetKeys={targetKeys}
      selectedKeys={selectedKeys}
      onChange={handleChange}
      showSelectAll={false}
    >
      {({ direction, filteredItems, disabled }) => {
        const sideRows = apply(direction, filteredItems as CountRow<T>[]);
        const columns: TableColumnsType<CountRow<T>> = [
          ...((direction === 'left' ? leftColumns : rightColumns) as TableColumnsType<CountRow<T>>),
          {
            title: count.title ?? t('transfer.quantity'),
            dataIndex: '_max',
            width: 130,
            render: (max: number, row) => (
              <div onClick={event => event.stopPropagation()}>
                <InputNumber
                  size="small"
                  style={{ width: '100%' }}
                  min={0}
                  max={max}
                  value={pending[row._id] ?? 0}
                  formatter={val => `${val ?? 0}/${max}`}
                  parser={val => Number(String(val ?? '').split('/')[0]) || 0}
                  onChange={val => setPending(prev => ({ ...prev, [row._id]: Number(val) || 0 }))}
                />
              </div>
            ),
          },
        ];

        return (
          <Flex vertical style={{ width: '100%' }}>
            {renderForm(direction)}
            <Table<CountRow<T>>
              rowKey="_id"
              columns={columns}
              dataSource={sideRows}
              size="small"
              pagination={false}
              scroll={{ y: 320 }}
              style={{ pointerEvents: disabled ? 'none' : undefined }}
              rowSelection={{
                selectedRowKeys: selectedKeys,
                getCheckboxProps: row => ({ disabled: disabled || row._max === 0 }),
                onSelect: toggle,
                onSelectAll: selected =>
                  setPending(prev => ({
                    ...prev,
                    ...Object.fromEntries(sideRows.map(row => [row._id, selected ? row._max : 0])),
                  })),
              }}
              onRow={row => ({ style: { cursor: 'pointer' }, onClick: () => !disabled && toggle(row) })}
            />
          </Flex>
        );
      }}
    </Transfer>
  );
};

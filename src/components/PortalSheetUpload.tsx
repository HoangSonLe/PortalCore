import type { PortalTableProps } from './PortalTable';
import type { UploadProps } from 'antd';

import { InboxOutlined } from '@ant-design/icons';
import { Flex, Typography, Upload } from 'antd';
import { useState } from 'react';

import { useT } from '../core/hooks';
import { PortalButton } from './PortalButton';
import { PortalDownloadButton } from './PortalDownloadButton';
import { PortalTable } from './PortalTable';

/** Phần tối thiểu của thư viện SheetJS mà component cần (`import * as XLSX from 'xlsx'`). */

export interface XlsxModule {
  read: (data: any, options: any) => { SheetNames: string[]; Sheets: Record<string, any> };
  utils: { sheet_to_json: (sheet: any, options?: any) => any[] };
}

export interface SheetColumnField {
  /** Tên cột đọc từ sheet (theo thứ tự cột A, B, C...). */
  dataIndex: string;
  /** Tên field trong giá trị trả ra. Bỏ trống = cột chỉ để hiển thị. */
  name?: string;
}

type SheetRow = Record<string, unknown> & { __row: number };

export interface PortalSheetUploadProps {
  /** Danh sách dòng đã chọn, đã map theo `columnFieldItems[].name`. */
  value?: Record<string, unknown>[];
  onChange?: (rows?: Record<string, unknown>[]) => void;
  /**
   * Thư viện SheetJS. Cài bản từ trang SheetJS (bản `xlsx` trên npm đã cũ, có lỗ hổng):
   * `npm i https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz` rồi `xlsx={XLSX}`.
   */
  xlsx: XlsxModule;
  columnFieldItems: SheetColumnField[];
  /** Cột hiển thị trong bảng xem trước. */
  tableProps?: Partial<PortalTableProps<SheetRow>>;
  /** Số dòng tiêu đề cần bỏ qua. Mặc định 1. */
  headerRows?: number;
  templateUrl?: string;
  templateFilename?: string;
  containerClassName?: string;
}

const ACCEPT = '.xls,.xlsx,.csv';

/** Nhập dữ liệu từ Excel: kéo thả file → xem trước → chọn dòng (giống PortalSheetUpload bên Kit cũ). */
export const PortalSheetUpload = ({
  onChange,
  xlsx,
  columnFieldItems,
  tableProps = {},
  headerRows = 1,
  templateUrl,
  templateFilename,
  containerClassName,
}: PortalSheetUploadProps) => {
  const t = useT();
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
  const [reading, setReading] = useState(false);

  const emit = (keys: number[], source: SheetRow[] = rows) => {
    setSelectedKeys(keys);
    onChange?.(
      source
        .filter(row => keys.includes(row.__row))
        .map(row =>
          Object.fromEntries(
            columnFieldItems.filter(field => field.name).map(field => [field.name!, row[field.dataIndex]]),
          ),
        ),
    );
  };

  const readFile: UploadProps['beforeUpload'] = async file => {
    setReading(true);

    try {
      const workbook = xlsx.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = (
        xlsx.utils.sheet_to_json(sheet, {
          header: columnFieldItems.map(field => field.dataIndex),
          range: headerRows,
          defval: '',
        }) as Record<string, unknown>[]
      ).map((row, index) => ({ ...row, __row: index + 1 }));

      setRows(data);
      emit(
        data.map(row => row.__row),
        data,
      );
    } finally {
      setReading(false);
    }

    return false;
  };

  const clear = () => {
    setRows([]);
    setSelectedKeys([]);
    onChange?.(undefined);
  };

  if (rows.length === 0) {
    return (
      <div className={containerClassName}>
        <Upload.Dragger
          accept={ACCEPT}
          multiple={false}
          showUploadList={false}
          beforeUpload={readFile}
          disabled={reading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {t('sheet.drop')} <Typography.Link>{t('sheet.choose')}</Typography.Link>
          </p>
          <p className="ant-upload-hint">{t('sheet.hint')}</p>
          {templateUrl && (
            <div style={{ marginTop: 12 }} onClick={event => event.stopPropagation()}>
              <PortalDownloadButton
                url={templateUrl}
                filename={templateFilename}
                buttonProps={{ type: 'default', children: t('sheet.template') }}
              />
            </div>
          )}
        </Upload.Dragger>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <PortalTable<SheetRow>
        rowKey="__row"
        dataSource={rows}
        loading={reading}
        search={false}
        options={false}
        pagination={false}
        tableAlertRender={false}
        columnEmptyText=""
        headerTitle={
          <Typography.Text type="secondary">
            {t('sheet.selected', { count: selectedKeys.length, total: rows.length })}
          </Typography.Text>
        }
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: keys => emit(keys as number[]) }}
        toolBarRender={() => [
          <Flex key="actions" gap={8}>
            <Upload accept={ACCEPT} multiple={false} showUploadList={false} beforeUpload={readFile}>
              <PortalButton actionType="upload">{t('sheet.reupload')}</PortalButton>
            </Upload>
            <PortalButton actionType="cancel" danger onClick={clear}>
              {t('sheet.clear')}
            </PortalButton>
          </Flex>,
        ]}
        {...tableProps}
      />
    </div>
  );
};

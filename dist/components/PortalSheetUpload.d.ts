import { PortalTableProps } from './PortalTable';
/** Phần tối thiểu của thư viện SheetJS mà component cần (`import * as XLSX from 'xlsx'`). */
export interface XlsxModule {
    read: (data: any, options: any) => {
        SheetNames: string[];
        Sheets: Record<string, any>;
    };
    utils: {
        sheet_to_json: (sheet: any, options?: any) => any[];
    };
}
export interface SheetColumnField {
    /** Tên cột đọc từ sheet (theo thứ tự cột A, B, C...). */
    dataIndex: string;
    /** Tên field trong giá trị trả ra. Bỏ trống = cột chỉ để hiển thị. */
    name?: string;
}
type SheetRow = Record<string, unknown> & {
    __row: number;
};
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
/** Nhập dữ liệu từ Excel: kéo thả file → xem trước → chọn dòng (giống PortalSheetUpload bên Kit cũ). */
export declare const PortalSheetUpload: ({ onChange, xlsx, columnFieldItems, tableProps, headerRows, templateUrl, templateFilename, containerClassName, }: PortalSheetUploadProps) => import("react").JSX.Element;
export {};

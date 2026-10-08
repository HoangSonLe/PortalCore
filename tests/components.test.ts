import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import { getDateFormat, normalizeRange } from '../src/components/PortalDatePicker';
import { transformText } from '../src/components/PortalInput';
import { formatThousands } from '../src/components/PortalNumberInput';
import { hasRequiredParams, toList } from '../src/components/PortalSelect';
import { mergeTrees, pickSelectedBranches, toTreeNodes } from '../src/components/PortalTreeSelect';
import { filenameFromDisposition } from '../src/utils/file';
import { getByPath, includesText, removeVietnameseTones } from '../src/utils/string';

describe('string utils', () => {
  it('bỏ dấu tiếng Việt, gộp khoảng trắng', () => {
    expect(removeVietnameseTones('  Người   Dùng Đà Nẵng ')).toBe('nguoi dung da nang');
    expect(includesText('Phòng Kinh doanh', 'kinh DOANH')).toBe(true);
    expect(includesText(undefined, 'a')).toBe(false);
  });

  it('getByPath đọc đường dẫn lồng nhau', () => {
    expect(getByPath({ a: { b: { c: 1 } } }, 'a.b.c')).toBe(1);
    expect(getByPath({ a: null }, 'a.b')).toBeUndefined();
  });
});

describe('PortalInput.transformText', () => {
  it.each([
    ['uppercase', '30a-123', '30A-123'],
    ['lowercase', 'ABC', 'abc'],
    ['uppercaseFirstLetter', 'xin chào', 'Xin chào'],
    ['capitalize', 'nguyễn văn an', 'Nguyễn Văn An'],
  ] as const)('%s', (type, input, expected) => {
    expect(transformText(input, type)).toBe(expected);
  });
});

describe('PortalNumberInput.formatThousands', () => {
  it('chỉ nhóm phần nguyên (Kit cũ nhóm cả phần thập phân)', () => {
    expect(formatThousands(1234567)).toBe('1,234,567');
    expect(formatThousands('1234.5678')).toBe('1,234.5678');
    expect(formatThousands(1234567, '.')).toBe('1.234.567');
    expect(formatThousands(undefined)).toBe('');
  });
});

describe('PortalDatePicker', () => {
  it('định dạng kiểu Việt Nam theo picker', () => {
    expect(getDateFormat(undefined)).toBe('DD/MM/YYYY');
    expect(getDateFormat('date', true)).toBe('HH:mm:ss DD/MM/YYYY');
    expect(getDateFormat('month')).toBe('MM/YYYY');
  });

  it('kéo khoảng ngày về đầu/cuối đơn vị', () => {
    const [start, end] = normalizeRange(dayjs('2026-03-05T10:00:00'), dayjs('2026-03-09T08:00:00'), undefined);

    expect(start.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-03-05 00:00:00');
    expect(end.format('YYYY-MM-DD HH:mm:ss.SSS')).toBe('2026-03-09 23:59:59.999');

    const [monthStart, monthEnd] = normalizeRange(dayjs('2026-02-10'), dayjs('2026-02-10'), 'month');

    expect(monthStart.format('YYYY-MM-DD')).toBe('2026-02-01');
    expect(monthEnd.format('YYYY-MM-DD')).toBe('2026-02-28');
  });
});

describe('PortalSelect helpers', () => {
  it('toList đọc nhiều dạng response', () => {
    expect(toList([1, 2])).toEqual([1, 2]);
    expect(toList({ data: [1] })).toEqual([1]);
    expect(toList({ value: [2] })).toEqual([2]);
    expect(toList(undefined)).toEqual([]);
  });

  it('hasRequiredParams chặn gọi API khi thiếu tham số bắt buộc', () => {
    expect(hasRequiredParams(undefined, undefined)).toBe(true);
    expect(hasRequiredParams({ pathVars: { id: undefined } }, { pathVars: ['id'] })).toBe(false);
    expect(hasRequiredParams({ pathVars: { id: 3 }, params: { type: 'a' } }, { pathVars: ['id'], params: ['type'] })).toBe(true);
  });
});

describe('PortalTreeSelect helpers', () => {
  const key = { label: 'name', value: 'id', children: { key: 'units', value: { label: 'name', value: 'id' } } };
  const raw = [{ id: 'A', name: 'Khối A', units: [{ id: 'A1', name: 'Phòng A1' }, { id: 'A2', name: 'Phòng A2' }] }];

  it('map dữ liệu thô sang cây', () => {
    expect(toTreeNodes(raw, key)).toEqual([
      {
        label: 'Khối A',
        value: 'A',
        children: [
          { label: 'Phòng A1', value: 'A1' },
          { label: 'Phòng A2', value: 'A2' },
        ],
      },
    ]);
  });

  it('giữ nhánh đã chọn khi kết quả tìm kiếm không còn chứa nó', () => {
    const tree = toTreeNodes(raw, key);
    const kept = pickSelectedBranches(tree, new Set(['A2']));
    const searchResult = [{ label: 'Khối B', value: 'B', children: [{ label: 'Phòng B1', value: 'B1' }] }];

    expect(kept).toEqual([{ label: 'Khối A', value: 'A', children: [{ label: 'Phòng A2', value: 'A2', children: undefined }] }]);
    expect(mergeTrees(kept, searchResult).map(node => node.value)).toEqual(['A', 'B']);
  });
});

describe('file utils', () => {
  it('đọc tên file từ Content-Disposition', () => {
    expect(filenameFromDisposition(`attachment; filename*=UTF-8''b%C3%A1o-c%C3%A1o.xlsx`)).toBe('báo-cáo.xlsx');
    expect(filenameFromDisposition('attachment; filename="report.csv"')).toBe('report.csv');
    expect(filenameFromDisposition(undefined)).toBeUndefined();
  });
});

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PortalButton } from '../src/components/PortalButton';
import { PortalInput } from '../src/components/PortalInput';
import { PortalSelect } from '../src/components/PortalSelect';
import { ErrorBoundary, isChunkLoadError } from '../src/core/ErrorBoundary';
import { Can } from '../src/permission/Can';
import { renderWithPortal } from './renderWithPortal';

describe('PortalButton', () => {
  it('actionType có sẵn nhãn tiếng Việt', () => {
    renderWithPortal(<PortalButton actionType="approve" />);

    expect(screen.getByRole('button', { name: 'Phê duyệt' })).toBeTruthy();
  });

  it('thiếu permissionCode thì không render', () => {
    renderWithPortal(
      <>
        <PortalButton actionType="add" permissionCode="user.create" />
        <PortalButton actionType="view" permissionCode="user.view" />
      </>,
      { permissions: ['user.view'] },
    );

    expect(screen.queryByRole('button', { name: 'Thêm mới' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Xem chi tiết' })).toBeTruthy();
  });

  it('onClick trả Promise thì nút loading tới khi xong', async () => {
    let resolve!: () => void;
    const onClick = vi.fn(() => new Promise<void>(r => (resolve = r)));

    renderWithPortal(<PortalButton actionType="save" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Lưu' });

    fireEvent.click(button);
    await waitFor(() => expect(button.className).toContain('ant-btn-loading'));

    await act(async () => resolve());
    await waitFor(() => expect(button.className).not.toContain('ant-btn-loading'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('popConfirm: chỉ chạy onClick sau khi bấm Đồng ý', async () => {
    const onClick = vi.fn();

    renderWithPortal(<PortalButton actionType="delete" popConfirm={{ title: 'Xoá thật?' }} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));

    expect(await screen.findByText('Xoá thật?')).toBeTruthy();
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Đồng ý' }));
    await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
  });

  it('rê chuột thì icon đổi sang bản đặc', () => {
    renderWithPortal(<PortalButton actionType="edit" />);
    const button = screen.getByRole('button', { name: 'Chỉnh sửa' });
    const before = button.querySelector('svg')!.innerHTML;

    fireEvent.mouseEnter(button);

    expect(button.querySelector('svg')!.innerHTML).not.toBe(before);
  });

  it('hiddenChildren: chỉ hiện icon nhưng vẫn có tên cho trình đọc màn hình', () => {
    renderWithPortal(<PortalButton actionType="export" hiddenChildren />);
    const button = screen.getByRole('button', { name: 'Kết xuất' });

    expect(button.textContent).toBe('');
  });
});

describe('PortalInput', () => {
  const Controlled = (props: Parameters<typeof PortalInput>[0]) => {
    const [value, setValue] = useState('');

    return (
      <PortalInput
        {...props}
        value={value}
        onChange={next => {
          setValue(next);
          props.onChange?.(next);
        }}
      />
    );
  };

  it('textType=uppercase báo ra ngoài chữ hoa ngay khi gõ', async () => {
    const onChange = vi.fn();

    renderWithPortal(<Controlled textType="uppercase" onChange={onChange} placeholder="bien-so" />);
    await userEvent.type(screen.getByPlaceholderText('bien-so'), '30a');

    expect((screen.getByPlaceholderText('bien-so') as HTMLInputElement).value).toBe('30A');
    expect(onChange).toHaveBeenLastCalledWith('30A');
  });

  it('regexRule chặn ký tự không hợp lệ', async () => {
    renderWithPortal(<Controlled regexRule={/^[0-9]*$/} placeholder="sdt" />);
    await userEvent.type(screen.getByPlaceholderText('sdt'), '09a1');

    expect((screen.getByPlaceholderText('sdt') as HTMLInputElement).value).toBe('091');
  });
});

describe('PortalSelect', () => {
  it('gọi request kèm requestParams và hiện option theo labelKey/valueKey', async () => {
    const request = vi.fn(async () => ({ data: [{ id: 1, info: { name: 'Hà Nội' } }] }));

    renderWithPortal(
      <PortalSelect
        request={request}
        requestParams={{ params: { type: 'city' } }}
        labelKey="info.name"
        valueKey="id"
        open
      />,
    );

    expect(await screen.findByText('Hà Nội')).toBeTruthy();
    expect(request).toHaveBeenCalledWith({ pathVars: undefined, params: { type: 'city' } });
  });

  it('thiếu tham số bắt buộc thì không gọi API', async () => {
    const request = vi.fn(async () => []);

    renderWithPortal(
      <PortalSelect
        request={request}
        requestParams={{ pathVars: { id: undefined } }}
        requiredParamKeys={{ pathVars: ['id'] }}
        labelKey="name"
        valueKey="id"
      />,
    );
    await new Promise(r => setTimeout(r, 50));

    expect(request).not.toHaveBeenCalled();
  });

  it('customValue trả object thay vì id', async () => {
    const onChange = vi.fn();

    renderWithPortal(
      <PortalSelect
        request={async () => [{ id: 7, name: 'An' }]}
        labelKey="name"
        valueKey="id"
        customValue={item => ({ userId: item.id, fullName: item.name })}
        onChange={onChange}
        open
      />,
    );
    fireEvent.click(await screen.findByText('An'));

    expect(onChange).toHaveBeenCalledWith({ userId: 7, fullName: 'An' });
  });
});

describe('Can', () => {
  it('ẩn nội dung khi thiếu quyền, hiện fallback', () => {
    renderWithPortal(
      <Can permission="setting.manage" fallback={<span>không có quyền</span>}>
        <span>bí mật</span>
      </Can>,
      { permissions: ['user.view'] },
    );

    expect(screen.queryByText('bí mật')).toBeNull();
    expect(screen.getByText('không có quyền')).toBeTruthy();
  });
});

describe('ErrorBoundary', () => {
  const Boom = (): never => {
    throw new Error('hỏng');
  };

  it('lỗi render hiện trang lỗi thay vì trắng màn hình', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderWithPortal(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Trang gặp lỗi')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tải lại trang' })).toBeTruthy();
  });

  it('nhận diện lỗi tải file JS sau deploy', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /assets/a.js'))).toBe(true);
    expect(isChunkLoadError(new Error('x is undefined'))).toBe(false);
  });
});

import { useCallback, useState } from 'react';

/**
 * State mở/đóng cho Modal/Drawer, kèm dữ liệu đi theo (vd bản ghi đang sửa).
 *
 * ```tsx
 * const editor = useDisclosure<User>();
 * <Button onClick={() => editor.show(record)} />
 * <UserModal open={editor.open} user={editor.data} onClose={editor.hide} />
 * ```
 */
export const useDisclosure = <T = undefined>(initialOpen = false) => {
  const [state, setState] = useState<{ open: boolean; data?: T }>({ open: initialOpen });

  const show = useCallback((data?: T) => setState({ open: true, data }), []);
  const hide = useCallback(() => setState(prev => ({ ...prev, open: false })), []);

  return { open: state.open, data: state.data, show, hide };
};

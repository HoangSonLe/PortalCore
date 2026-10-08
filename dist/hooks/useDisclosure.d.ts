/**
 * State mở/đóng cho Modal/Drawer, kèm dữ liệu đi theo (vd bản ghi đang sửa).
 *
 * ```tsx
 * const editor = useDisclosure<User>();
 * <Button onClick={() => editor.show(record)} />
 * <UserModal open={editor.open} user={editor.data} onClose={editor.hide} />
 * ```
 */
export declare const useDisclosure: <T = undefined>(initialOpen?: boolean) => {
    open: boolean;
    data: T | undefined;
    show: (data?: T) => void;
    hide: () => void;
};

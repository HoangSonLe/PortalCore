export interface UseRequestOptions<TData, TArgs extends unknown[]> {
    /** true: không tự chạy khi mount, gọi `run()` thủ công (vd submit form). */
    manual?: boolean;
    /** Tham số cho lần chạy tự động. */
    defaultArgs?: TArgs;
    /** Đổi giá trị trong mảng này thì tự chạy lại (khi không `manual`). */
    deps?: unknown[];
    onSuccess?: (data: TData, args: TArgs) => void;
    onError?: (error: unknown, args: TArgs) => void;
}
/**
 * Gọi API kèm state loading/data/error. Kết quả của lần gọi cũ về muộn sẽ bị bỏ qua.
 *
 * ```ts
 * const { data, loading, refresh } = useRequest(() => userApi.detail(id), { deps: [id] });
 * const { run: save, loading: saving } = useRequest(userApi.update, { manual: true });
 * ```
 */
export declare const useRequest: <TData, TArgs extends unknown[] = []>(service: (...args: TArgs) => Promise<TData>, options?: UseRequestOptions<TData, TArgs>) => {
    data: TData | undefined;
    error: unknown;
    loading: boolean;
    run: (...args: TArgs) => Promise<TData | undefined>;
    refresh: () => Promise<TData | undefined>;
    setData: import('react').Dispatch<import('react').SetStateAction<TData | undefined>>;
};

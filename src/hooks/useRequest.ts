import { useCallback, useEffect, useRef, useState } from 'react';

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
export const useRequest = <TData, TArgs extends unknown[] = []>(
  service: (...args: TArgs) => Promise<TData>,
  options: UseRequestOptions<TData, TArgs> = {},
) => {
  const { manual = false, defaultArgs, deps = [] } = options;
  const [data, setData] = useState<TData>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(!manual);

  const serviceRef = useRef(service);
  const optionsRef = useRef(options);
  const lastArgsRef = useRef<TArgs>((defaultArgs ?? []) as TArgs);
  const callIdRef = useRef(0);

  serviceRef.current = service;
  optionsRef.current = options;

  const run = useCallback(async (...args: TArgs): Promise<TData | undefined> => {
    const callId = ++callIdRef.current;

    lastArgsRef.current = args;
    setLoading(true);
    setError(undefined);

    try {
      const result = await serviceRef.current(...args);

      if (callId === callIdRef.current) {
        setData(result);
        optionsRef.current.onSuccess?.(result, args);
      }

      return result;
    } catch (err) {
      if (callId === callIdRef.current) {
        setError(err);
        optionsRef.current.onError?.(err, args);
      }

      throw err;
    } finally {
      if (callId === callIdRef.current) setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => run(...lastArgsRef.current), [run]);

  useEffect(() => {
    if (!manual) run(...((defaultArgs ?? []) as TArgs)).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manual, ...deps]);

  return { data, error, loading, run, refresh, setData };
};

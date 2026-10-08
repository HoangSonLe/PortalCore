import { useState, useRef, useCallback, useEffect } from "react";
const useRequest = (service, options = {}) => {
  const { manual = false, defaultArgs, deps = [] } = options;
  const [data, setData] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(!manual);
  const serviceRef = useRef(service);
  const optionsRef = useRef(options);
  const lastArgsRef = useRef(defaultArgs ?? []);
  const callIdRef = useRef(0);
  serviceRef.current = service;
  optionsRef.current = options;
  const run = useCallback(async (...args) => {
    const callId = ++callIdRef.current;
    lastArgsRef.current = args;
    setLoading(true);
    setError(void 0);
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
    if (!manual) run(...defaultArgs ?? []).catch(() => void 0);
  }, [manual, ...deps]);
  return { data, error, loading, run, refresh, setData };
};
export {
  useRequest
};
//# sourceMappingURL=useRequest.js.map

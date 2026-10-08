import { useState, useCallback } from "react";
const useDisclosure = (initialOpen = false) => {
  const [state, setState] = useState({ open: initialOpen });
  const show = useCallback((data) => setState({ open: true, data }), []);
  const hide = useCallback(() => setState((prev) => ({ ...prev, open: false })), []);
  return { open: state.open, data: state.data, show, hide };
};
export {
  useDisclosure
};
//# sourceMappingURL=useDisclosure.js.map

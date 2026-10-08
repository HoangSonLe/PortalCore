import { jsx } from "react/jsx-runtime";
import { Tabs } from "antd";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router";
const PortalTabs = ({ mode = "path", paramName, onChange, activeKey, items, ...props }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const name = paramName ?? (mode === "path" ? "tabKey" : "tab");
  const current = mode === "path" ? params[name] : searchParams.get(name) ?? void 0;
  const handleChange = (key) => {
    onChange?.(key);
    if (mode === "query") {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(name, key);
          return next;
        },
        { replace: true }
      );
      return;
    }
    const base = current ? pathname.slice(0, pathname.lastIndexOf("/")) : pathname.replace(/\/$/, "");
    navigate(`${base}/${key}`, { replace: true });
  };
  return /* @__PURE__ */ jsx(Tabs, { ...props, items, activeKey: activeKey ?? current ?? items?.[0]?.key, onChange: handleChange });
};
export {
  PortalTabs
};
//# sourceMappingURL=PortalTabs.js.map

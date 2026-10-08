import { jsx } from "react/jsx-runtime";
import { useHttp } from "../core/hooks.js";
import { filenameFromDisposition, saveBlob } from "../utils/file.js";
import { PortalButton } from "./PortalButton.js";
const PortalDownloadButton = ({
  url,
  filename,
  params,
  method = "get",
  body,
  buttonProps = {}
}) => {
  const http = useHttp();
  const { onClick, ...rest } = buttonProps;
  const handleClick = async (event) => {
    event.stopPropagation();
    onClick?.(event);
    const response = await http.raw(method, url, { params, body, responseType: "blob" });
    const name = filename ?? filenameFromDisposition(response.headers?.["content-disposition"]) ?? "download";
    saveBlob(response.data, name);
  };
  return /* @__PURE__ */ jsx(PortalButton, { type: "primary", actionType: "download", ...rest, onClick: handleClick });
};
export {
  PortalDownloadButton
};
//# sourceMappingURL=PortalDownloadButton.js.map

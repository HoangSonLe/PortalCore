import { jsx } from "react/jsx-runtime";
import { Image } from "antd";
import { useState, useEffect } from "react";
import { useHttp } from "../core/hooks.js";
const NO_IMAGE = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><rect width="160" height="120" fill="#f0f0f0"/><g fill="none" stroke="#bfbfbf" stroke-width="3"><rect x="55" y="38" width="50" height="40" rx="4"/><circle cx="70" cy="51" r="5"/><path d="M57 74l15-14 10 9 8-6 13 11"/></g></svg>'
);
const PortalBlobImage = ({
  imageUrl,
  noImageUrl = NO_IMAGE,
  withAuth = true,
  preview,
  ...props
}) => {
  const http = useHttp();
  const [blobUrl, setBlobUrl] = useState();
  useEffect(() => {
    let objectUrl;
    let cancelled = false;
    setBlobUrl(void 0);
    if (!imageUrl) return void 0;
    const load = async () => {
      try {
        const blob = withAuth ? (await http.raw("get", imageUrl, { responseType: "blob", notify: { error: false } })).data : await (await fetch(imageUrl)).blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setBlobUrl(void 0);
      }
    };
    void load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [http, imageUrl, withAuth]);
  return /* @__PURE__ */ jsx(Image, { ...props, src: blobUrl ?? noImageUrl, fallback: noImageUrl, preview: blobUrl ? preview : false });
};
export {
  NO_IMAGE,
  PortalBlobImage
};
//# sourceMappingURL=PortalBlobImage.js.map

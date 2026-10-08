import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { Upload, Image, App } from "antd";
import { useState, createElement } from "react";
import { useT } from "../core/hooks.js";
import { readAsDataURL } from "../utils/file.js";
const PortalUpload = ({
  maxCount = 8,
  uploadButton,
  fileList: controlled,
  onChange,
  ...props
}) => {
  const t = useT();
  const [innerList, setInnerList] = useState([]);
  const [preview, setPreview] = useState();
  const fileList = controlled ?? innerList;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Upload,
      {
        listType: "picture-card",
        accept: "image/*",
        maxCount,
        ...props,
        fileList,
        onPreview: async (file) => {
          setPreview(
            file.url ?? file.thumbUrl ?? (file.originFileObj ? await readAsDataURL(file.originFileObj) : void 0)
          );
        },
        onChange: (info) => {
          if (!controlled) setInnerList(info.fileList);
          onChange?.(info);
        },
        children: fileList.length >= maxCount ? null : uploadButton ?? /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(PlusOutlined, {}),
          /* @__PURE__ */ jsx("div", { style: { marginTop: 8 }, children: t("upload.button") })
        ] })
      }
    ),
    preview && /* @__PURE__ */ jsx(
      Image,
      {
        wrapperStyle: { display: "none" },
        src: preview,
        preview: { visible: true, onVisibleChange: (visible) => !visible && setPreview(void 0) }
      }
    )
  ] });
};
const PortalUploadAvatar = ({
  value,
  onChange,
  upload,
  width = 100,
  height = 100,
  maxSizeMB = 10,
  accept = ["image/jpeg", "image/png"],
  imgCrop,
  cropProps = { rotationSlider: true }
}) => {
  const t = useT();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const uploader = /* @__PURE__ */ jsx(
    Upload,
    {
      name: "avatar",
      listType: "picture-card",
      showUploadList: false,
      maxCount: 1,
      accept: accept.join(","),
      beforeUpload: (file) => {
        if (!accept.includes(file.type)) {
          message.error(t("upload.avatar.invalidType"));
          return Upload.LIST_IGNORE;
        }
        if (file.size / 1024 / 1024 >= maxSizeMB) {
          message.error(t("upload.avatar.tooLarge", { size: maxSizeMB }));
          return Upload.LIST_IGNORE;
        }
        return true;
      },
      customRequest: async ({ file, onSuccess, onError }) => {
        setLoading(true);
        try {
          const url = await upload(file);
          onSuccess?.(url);
          onChange?.(url);
        } catch (error) {
          onError?.(error);
        } finally {
          setLoading(false);
        }
      },
      children: /* @__PURE__ */ jsx(
        "div",
        {
          style: { width, height, display: "grid", placeItems: "center", overflow: "hidden", borderRadius: "inherit" },
          children: value && !loading ? /* @__PURE__ */ jsx("img", { src: value, alt: "avatar", style: { width: "100%", height: "100%", objectFit: "cover" } }) : /* @__PURE__ */ jsxs("div", { children: [
            loading ? /* @__PURE__ */ jsx(LoadingOutlined, {}) : /* @__PURE__ */ jsx(PlusOutlined, {}),
            /* @__PURE__ */ jsx("div", { style: { marginTop: 8 }, children: t("upload.button") })
          ] })
        }
      )
    }
  );
  return imgCrop ? createElement(imgCrop, cropProps, uploader) : uploader;
};
export {
  PortalUpload,
  PortalUploadAvatar
};
//# sourceMappingURL=PortalUpload.js.map

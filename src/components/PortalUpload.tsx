import type { ComponentType, ReactNode } from 'react';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Image, Upload } from 'antd';
import { createElement, useState } from 'react';

import { useT } from '../core/hooks';
import { readAsDataURL } from '../utils/file';

export interface PortalUploadProps extends Omit<UploadProps, 'children'> {
  /** Số ảnh tối đa (ẩn nút thêm khi đủ). Mặc định 8 như Kit. */
  maxCount?: number;
  /** Nội dung nút thêm. Mặc định icon + "Tải lên". */
  uploadButton?: ReactNode;
}

/** Upload nhiều ảnh dạng thẻ, bấm vào để xem lớn (giống PortalUpload bên Kit cũ). */
export const PortalUpload = ({
  maxCount = 8,
  uploadButton,
  fileList: controlled,
  onChange,
  ...props
}: PortalUploadProps) => {
  const t = useT();
  const [innerList, setInnerList] = useState<UploadFile[]>([]);
  const [preview, setPreview] = useState<string>();
  const fileList = controlled ?? innerList;

  return (
    <>
      <Upload
        listType="picture-card"
        accept="image/*"
        maxCount={maxCount}
        {...props}
        fileList={fileList}
        onPreview={async file => {
          setPreview(
            file.url ?? file.thumbUrl ?? (file.originFileObj ? await readAsDataURL(file.originFileObj) : undefined),
          );
        }}
        onChange={info => {
          if (!controlled) setInnerList(info.fileList);
          onChange?.(info);
        }}
      >
        {fileList.length >= maxCount
          ? null
          : (uploadButton ?? (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>{t('upload.button')}</div>
              </div>
            ))}
      </Upload>
      {preview && (
        <Image
          wrapperStyle={{ display: 'none' }}
          src={preview}
          preview={{ visible: true, onVisibleChange: visible => !visible && setPreview(undefined) }}
        />
      )}
    </>
  );
};

export interface PortalUploadAvatarProps {
  /** URL ảnh hiện tại. */
  value?: string;
  onChange?: (url: string) => void;
  /** Upload file lên server, trả về URL ảnh. Vd `file => fileApi.upload(file).then(r => r.url)`. */
  upload: (file: RcFile) => Promise<string>;
  width?: number | string;
  height?: number | string;
  /** Dung lượng tối đa (MB). Mặc định 10. */
  maxSizeMB?: number;
  accept?: string[];
  /**
   * Muốn cắt ảnh trước khi tải: cài `antd-img-crop` rồi truyền `imgCrop={ImgCrop}`.
   * Core không phụ thuộc thư viện này.
   */
  imgCrop?: ComponentType<any>;
  cropProps?: Record<string, unknown>;
}

/** Ô ảnh đại diện: chọn ảnh → (cắt) → upload → trả URL (giống PortalUploadAvatar bên Kit cũ). */
export const PortalUploadAvatar = ({
  value,
  onChange,
  upload,
  width = 100,
  height = 100,
  maxSizeMB = 10,
  accept = ['image/jpeg', 'image/png'],
  imgCrop,
  cropProps = { rotationSlider: true },
}: PortalUploadAvatarProps) => {
  const t = useT();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const uploader = (
    <Upload
      name="avatar"
      listType="picture-card"
      showUploadList={false}
      maxCount={1}
      accept={accept.join(',')}
      beforeUpload={file => {
        if (!accept.includes(file.type)) {
          message.error(t('upload.avatar.invalidType'));

          return Upload.LIST_IGNORE;
        }

        if (file.size / 1024 / 1024 >= maxSizeMB) {
          message.error(t('upload.avatar.tooLarge', { size: maxSizeMB }));

          return Upload.LIST_IGNORE;
        }

        return true;
      }}
      customRequest={async ({ file, onSuccess, onError }) => {
        setLoading(true);

        try {
          const url = await upload(file as RcFile);

          onSuccess?.(url);
          onChange?.(url);
        } catch (error) {
          onError?.(error as Error);
        } finally {
          setLoading(false);
        }
      }}
    >
      <div
        style={{ width, height, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 'inherit' }}
      >
        {value && !loading ? (
          <img src={value} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>{t('upload.button')}</div>
          </div>
        )}
      </div>
    </Upload>
  );

  return imgCrop ? createElement(imgCrop, cropProps, uploader) : uploader;
};

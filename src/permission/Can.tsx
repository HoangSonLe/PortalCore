import type { PermissionMode, PermissionRequirement } from './permission';
import type { ComponentType, ReactNode } from 'react';

import { usePermission } from '../core/hooks';
import { ForbiddenPage } from '../pages/ErrorPages';

export interface CanProps {
  permission: PermissionRequirement;
  mode?: PermissionMode;
  /** Hiện khi không có quyền. Mặc định không hiện gì. */
  fallback?: ReactNode;
  children: ReactNode;
}

/** `<Can permission="user.create"><Button>Thêm</Button></Can>` */
export const Can = ({ permission, mode, fallback = null, children }: CanProps) => {
  const can = usePermission();

  return can(permission, mode) ? children : fallback;
};

/** Bọc cả component/trang theo quyền. Mặc định thiếu quyền thì hiện trang 403. */
export const withPermission =
  <P extends object>(
    Component: ComponentType<P>,
    permission: PermissionRequirement,
    options: { mode?: PermissionMode; fallback?: ReactNode } = {},
  ) =>
  (props: P) => (
    <Can permission={permission} mode={options.mode} fallback={options.fallback ?? <ForbiddenPage />}>
      <Component {...props} />
    </Can>
  );

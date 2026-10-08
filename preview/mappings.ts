import { createMapping } from '@hoangsonle/portal-core';

export const userStatus = createMapping([
  { value: 'ACTIVE', label: 'status.active', color: 'success' },
  { value: 'PENDING', label: 'status.pending', color: 'processing' },
  { value: 'LOCKED', label: 'status.locked', color: 'error' },
] as const);

export const userRole = createMapping([
  { value: 'ADMIN', label: 'role.admin', color: 'magenta' },
  { value: 'EDITOR', label: 'role.editor', color: 'blue' },
  { value: 'VIEWER', label: 'role.viewer', color: 'default' },
] as const);

/**
 * Backend giả chạy ngay trong trình duyệt (axios adapter) để chạy preview không cần server.
 * Mô phỏng đủ: login/refresh/logout, phân quyền, CRUD user có phân trang/lọc/sắp xếp.
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { AxiosError } from 'axios';

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'PENDING';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

const accounts: Record<string, { password: string; userId: number; permissions: string[] }> = {
  admin: { password: 'admin', userId: 1, permissions: ['*'] },
  editor: {
    password: 'editor',
    userId: 2,
    permissions: ['dashboard.view', 'user.view', 'user.create', 'user.update'],
  },
  viewer: { password: 'viewer', userId: 3, permissions: ['dashboard.view', 'user.view'] },
};

const firstNames = ['An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hà', 'Khánh', 'Linh', 'Minh', 'Nam', 'Phương', 'Quân'];
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi'];
const statuses: UserStatus[] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'LOCKED', 'PENDING'];
const roles: Role[] = ['EDITOR', 'VIEWER', 'VIEWER'];

const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/\s+/g, '.');

let users: User[] = [
  { id: 1, name: 'Quản trị viên', username: 'admin', email: 'admin@demo.local', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-01-02T08:00:00Z' },
  { id: 2, name: 'Biên tập viên', username: 'editor', email: 'editor@demo.local', role: 'EDITOR', status: 'ACTIVE', createdAt: '2026-01-05T08:00:00Z' },
  { id: 3, name: 'Người xem', username: 'viewer', email: 'viewer@demo.local', role: 'VIEWER', status: 'ACTIVE', createdAt: '2026-01-09T08:00:00Z' },
  ...Array.from({ length: 42 }, (_, i): User => {
    const name = `${lastNames[i % lastNames.length]} ${firstNames[(i * 5) % firstNames.length]}`;
    const username = `${slug(name)}${i + 4}`;

    return {
      id: i + 4,
      name,
      username,
      email: `${username}@demo.local`,
      role: roles[i % roles.length],
      status: statuses[i % statuses.length],
      createdAt: new Date(Date.UTC(2026, 1, 1) + i * 86_400_000 * 3).toISOString(),
    };
  }),
];
let nextId = users.length + 1;

// ---- Danh mục cho trang Component mẫu ----
const units = [
  {
    id: 'HQ',
    name: 'Trụ sở chính',
    children: [
      { id: 'HQ-IT', name: 'Phòng CNTT', children: [] },
      { id: 'HQ-HR', name: 'Phòng Nhân sự', children: [] },
      { id: 'HQ-FIN', name: 'Phòng Tài chính', children: [] },
    ],
  },
  {
    id: 'HCM',
    name: 'Chi nhánh TP.HCM',
    children: [
      { id: 'HCM-SALE', name: 'Phòng Kinh doanh', children: [] },
      { id: 'HCM-OPS', name: 'Phòng Vận hành', children: [] },
    ],
  },
  { id: 'DN', name: 'Chi nhánh Đà Nẵng', children: [{ id: 'DN-SALE', name: 'Phòng Kinh doanh ĐN', children: [] }] },
];

const provinces = [
  { id: 1, name: 'Hà Nội', districts: ['Ba Đình', 'Hoàn Kiếm', 'Cầu Giấy', 'Đống Đa'] },
  { id: 2, name: 'TP. Hồ Chí Minh', districts: ['Quận 1', 'Quận 3', 'Bình Thạnh', 'Thủ Đức'] },
  { id: 3, name: 'Đà Nẵng', districts: ['Hải Châu', 'Sơn Trà', 'Ngũ Hành Sơn'] },
];

const devices = [
  { id: 'CAM', name: 'Camera IP', stock: 12 },
  { id: 'NVR', name: 'Đầu ghi NVR', stock: 4 },
  { id: 'SW', name: 'Switch PoE', stock: 8 },
  { id: 'UPS', name: 'Bộ lưu điện', stock: 3 },
];

/** Trả file: mockAdapter sẽ gửi Blob + header Content-Disposition. */
class FileResult {
  constructor(
    readonly blob: Blob,
    readonly filename: string,
  ) {}
}

const avatarSvg = (name: string, hue: number) =>
  new Blob(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160"><rect width="240" height="160" fill="hsl(${hue} 45% 45%)"/><text x="120" y="96" font-family="Arial" font-size="56" font-weight="700" fill="#fff" text-anchor="middle">${name}</text></svg>`,
    ],
    { type: 'image/svg+xml' },
  );

// ---- Token ----
const ACCESS_TTL = 5 * 60_000;
const accessTokens = new Map<string, { username: string; expiresAt: number }>();
const refreshTokens = new Map<string, string>();
let tokenSeq = 0;

// ---- Lưu "database" giả vào localStorage để F5 không mất dữ liệu/phiên (giống backend thật) ----
const DB_KEY = 'portal-core-preview:mock-db';

const loadDb = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DB_KEY) ?? 'null');

    if (!saved) return;

    users = saved.users;
    nextId = saved.nextId;
    tokenSeq = saved.tokenSeq;
    saved.accessTokens.forEach(([key, value]: [string, { username: string; expiresAt: number }]) =>
      accessTokens.set(key, value),
    );
    saved.refreshTokens.forEach(([key, value]: [string, string]) => refreshTokens.set(key, value));
  } catch {
    localStorage.removeItem(DB_KEY);
  }
};

const saveDb = () => {
  try {
    localStorage.setItem(
      DB_KEY,
      JSON.stringify({ users, nextId, tokenSeq, accessTokens: [...accessTokens], refreshTokens: [...refreshTokens] }),
    );
  } catch {
    // bỏ qua khi trình duyệt chặn storage
  }
};

/** Xoá dữ liệu giả, quay về dữ liệu mẫu ban đầu. */
export const resetMockDb = () => {
  localStorage.removeItem(DB_KEY);
  location.reload();
};

loadDb();

export const mockStats = { refreshCalls: 0, requests: 0, userListRequests: 0 };

const issueTokens = (username: string) => {
  tokenSeq += 1;
  const accessToken = `at.${username}.${tokenSeq}`;
  const refreshToken = `rt.${username}.${tokenSeq}`;

  accessTokens.set(accessToken, { username, expiresAt: Date.now() + ACCESS_TTL });
  refreshTokens.set(refreshToken, username);

  return { accessToken, refreshToken, expiresAt: Date.now() + ACCESS_TTL };
};

class HttpStatus extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const requireAccount = (config: InternalAxiosRequestConfig) => {
  const header = String(config.headers?.Authorization ?? '');
  const token = header.replace(/^Bearer\s+/, '');
  const record = accessTokens.get(token);

  if (!record || record.expiresAt < Date.now()) throw new HttpStatus(401, 'Phiên đăng nhập đã hết hạn');

  return { username: record.username, ...accounts[record.username] };
};

const requirePermission = (config: InternalAxiosRequestConfig, permission: string) => {
  const account = requireAccount(config);

  if (!account.permissions.includes('*') && !account.permissions.includes(permission)) {
    throw new HttpStatus(403, 'Bạn không có quyền thực hiện thao tác này');
  }

  return account;
};

const validateUser = (input: Partial<User>, ignoreId?: number) => {
  if (!input.name?.trim()) throw new HttpStatus(400, 'Họ tên không được để trống');
  if (!input.email?.includes('@')) throw new HttpStatus(400, 'Email không hợp lệ');
  if (users.some(u => u.email === input.email && u.id !== ignoreId)) throw new HttpStatus(400, 'Email đã tồn tại');
  if (users.some(u => u.username === input.username && u.id !== ignoreId)) {
    throw new HttpStatus(400, 'Tên đăng nhập đã tồn tại');
  }
};

// ---- Routes ----
type Ctx = { config: InternalAxiosRequestConfig; params: Record<string, any>; body: any; pathVars: Record<string, string> };
type RouteHandler = (ctx: Ctx) => unknown;

const routes: [string, string, RouteHandler][] = [
  [
    'post',
    '/auth/login',
    ({ body }) => {
      const account = accounts[body?.username];

      if (!account || account.password !== body?.password) throw new HttpStatus(401, 'Sai tên đăng nhập hoặc mật khẩu');

      return issueTokens(body.username);
    },
  ],
  [
    'post',
    '/auth/refresh',
    ({ body }) => {
      mockStats.refreshCalls += 1;
      const username = refreshTokens.get(body?.refreshToken);

      if (!username) throw new HttpStatus(401, 'Refresh token không hợp lệ');

      refreshTokens.delete(body.refreshToken); // xoay vòng refresh token

      return issueTokens(username);
    },
  ],
  ['post', '/auth/logout', ({ config }) => void accessTokens.delete(String(config.headers?.Authorization).slice(7))],
  ['post', '/auth/forgot-password', () => ({ sent: true })],
  [
    'get',
    '/auth/me',
    ({ config }) => {
      const account = requireAccount(config);
      const user = users.find(u => u.id === account.userId)!;

      return { user: { id: user.id, name: user.name, username: user.username, email: user.email }, permissions: account.permissions };
    },
  ],
  [
    'get',
    '/dashboard/summary',
    ({ config }) => {
      requirePermission(config, 'dashboard.view');

      const count = (status?: UserStatus) => users.filter(u => !status || u.status === status).length;
      // Đường xu hướng 12 kỳ, điểm cuối = số hiện tại (giả lập, cố định theo seed).
      const trend = (end: number, seed: number) =>
        Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round(end * (0.55 + 0.45 * (i / 11)) + Math.sin(i * 1.7 + seed) * end * 0.08)));

      return {
        total: { value: count(), delta: 12.4, trend: trend(count(), 1) },
        active: { value: count('ACTIVE'), delta: 8.1, trend: trend(count('ACTIVE'), 2) },
        pending: { value: count('PENDING'), delta: -4.2, trend: trend(count('PENDING'), 3).reverse() },
        locked: { value: count('LOCKED'), delta: 2.0, trend: trend(count('LOCKED'), 4) },
        roles: (['ADMIN', 'EDITOR', 'VIEWER'] as Role[]).map(role => ({ role, count: users.filter(u => u.role === role).length })),
      };
    },
  ],
  [
    'get',
    '/activity',
    ({ config }) => {
      requireAccount(config);
      const actions = [
        { type: 'create', text: 'đã thêm người dùng' },
        { type: 'update', text: 'đã cập nhật vai trò của' },
        { type: 'lock', text: 'đã khoá tài khoản' },
        { type: 'login', text: 'đăng nhập từ thiết bị mới' },
        { type: 'update', text: 'đã đổi email của' },
      ];

      return Array.from({ length: 7 }, (_, i) => {
        const actor = users[(i * 7) % Math.min(users.length, 12)];
        const target = users[(i * 11 + 5) % users.length];
        const action = actions[i % actions.length];

        return {
          id: i + 1,
          at: new Date(Date.now() - (i * 47 + 6) * 60_000).toISOString(),
          actor: actor.name,
          type: action.type,
          text: action.text,
          target: action.type === 'login' ? undefined : target.name,
        };
      });
    },
  ],
  ['get', '/roles', () => [
    { id: 'ADMIN', name: 'Quản trị' },
    { id: 'EDITOR', name: 'Biên tập' },
    { id: 'VIEWER', name: 'Chỉ xem' },
  ]],
  [
    'get',
    '/users',
    ({ config, params }) => {
      requirePermission(config, 'user.view');
      const { current = 1, pageSize = 10, keyword, status, role, sortField, sortOrder } = params;
      const kw = String(keyword ?? '').trim().toLowerCase();
      let list = users.filter(
        u =>
          (!kw || u.name.toLowerCase().includes(kw) || u.email.includes(kw) || u.username.includes(kw)) &&
          (!status || u.status === status) &&
          (!role || u.role === role),
      );

      if (sortField) {
        const dir = sortOrder === 'descend' ? -1 : 1;

        list = [...list].sort((a, b) => String(a[sortField as keyof User]).localeCompare(String(b[sortField as keyof User])) * dir);
      }

      const start = (Number(current) - 1) * Number(pageSize);

      // Cố tình dùng format khác `{data,total}` để thấy chỗ map response trong userApi.
      return { items: list.slice(start, start + Number(pageSize)), totalItems: list.length };
    },
  ],
  [
    'get',
    '/users/search',
    ({ params }) => {
      const kw = String(params.keyword ?? '').toLowerCase();

      return users.filter(u => u.name.toLowerCase().includes(kw)).slice(0, 10);
    },
  ],
  [
    'get',
    '/users/:id',
    ({ config, pathVars }) => {
      requirePermission(config, 'user.view');
      const user = users.find(u => u.id === Number(pathVars.id));

      if (!user) throw new HttpStatus(404, 'Không tìm thấy người dùng');

      return user;
    },
  ],
  [
    'post',
    '/users',
    ({ config, body }) => {
      requirePermission(config, 'user.create');
      validateUser(body);
      const user: User = { status: 'PENDING', role: 'VIEWER', ...body, id: nextId++, createdAt: new Date().toISOString() };

      users = [user, ...users];

      return user;
    },
  ],
  [
    'put',
    '/users/:id',
    ({ config, body, pathVars }) => {
      requirePermission(config, 'user.update');
      const id = Number(pathVars.id);

      validateUser(body, id);
      users = users.map(u => (u.id === id ? { ...u, ...body, id } : u));

      return users.find(u => u.id === id);
    },
  ],
  [
    'delete',
    '/users/:id',
    ({ config, pathVars }) => {
      requirePermission(config, 'user.delete');
      const id = Number(pathVars.id);

      if (id <= 3) throw new HttpStatus(400, 'Không được xoá tài khoản demo');

      users = users.filter(u => u.id !== id);

      return { id };
    },
  ],
  ['get', '/units', ({ config, params }) => {
    requireAccount(config);
    const kw = String(params.search ?? '').toLowerCase();

    if (!kw) return units;

    return units
      .map(unit => ({ ...unit, children: unit.children.filter(child => child.name.toLowerCase().includes(kw)) }))
      .filter(unit => unit.children.length || unit.name.toLowerCase().includes(kw));
  }],
  ['get', '/provinces', () => provinces.map(({ id, name }) => ({ id, name }))],
  [
    'get',
    '/provinces/:id/districts',
    ({ pathVars }) =>
      (provinces.find(item => item.id === Number(pathVars.id))?.districts ?? []).map((name, index) => ({
        id: `${pathVars.id}-${index + 1}`,
        name,
      })),
  ],
  ['get', '/devices', () => devices],
  [
    'get',
    '/reports/users',
    ({ config }) => {
      requirePermission(config, 'user.view');
      const header = 'ID,Họ tên,Tài khoản,Email,Vai trò,Trạng thái';
      const lines = users.map(u => [u.id, u.name, u.username, u.email, u.role, u.status].join(','));

      return new FileResult(new Blob(['\uFEFF' + [header, ...lines].join('\n')], { type: 'text/csv' }), 'danh-sach-nguoi-dung.csv');
    },
  ],
  [
    'get',
    '/files/user-template',
    () =>
      new FileResult(
        new Blob(['\uFEFFHọ tên,Tài khoản,Email\nNguyễn Văn Mẫu,nguyen.van.mau,mau@demo.local\nTrần Thị Thử,tran.thi.thu,thu@demo.local\n'], {
          type: 'text/csv',
        }),
        'mau-nhap-nguoi-dung.csv',
      ),
  ],
  [
    'get',
    '/files/avatar/:id',
    ({ config, pathVars }) => {
      requireAccount(config);
      const user = users.find(u => u.id === Number(pathVars.id)) ?? users[0];

      return new FileResult(avatarSvg(user.name.split(' ').pop()!.charAt(0), (user.id * 47) % 360), `avatar-${user.id}.svg`);
    },
  ],
  // Công cụ demo: làm mọi access token hết hạn ngay lập tức.
  ['post', '/dev/expire-tokens', () => accessTokens.forEach(record => (record.expiresAt = 0))],
  ['get', '/dev/stats', () => ({ ...mockStats })],
];

const matchRoute = (method: string, url: string) => {
  for (const [routeMethod, pattern, handler] of routes) {
    if (routeMethod !== method) continue;

    const names: string[] = [];
    const regex = new RegExp(
      `^${pattern.replace(/:(\w+)/g, (_, name: string) => {
        names.push(name);

        return '([^/]+)';
      })}$`,
    );
    const match = url.match(regex);

    if (match) {
      return { handler, pathVars: Object.fromEntries(names.map((name, i) => [name, decodeURIComponent(match[i + 1])])) };
    }
  }

  return undefined;
};

export const mockAdapter: AxiosAdapter = async config => {
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  mockStats.requests += 1;

  const method = (config.method ?? 'get').toLowerCase();
  const url = (config.url ?? '').split('?')[0];

  if (method === 'get' && url === '/users') mockStats.userListRequests += 1;
  const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : config.data;
  const respond = (status: number, data: unknown, headers: Record<string, string> = {}): AxiosResponse => ({
    data,
    status,
    statusText: String(status),
    headers,
    config,
    request: {},
  });

  const route = matchRoute(method, url);

  try {
    if (!route) throw new HttpStatus(404, `Mock API không có ${method.toUpperCase()} ${url}`);

    const data = route.handler({ config, params: config.params ?? {}, body, pathVars: route.pathVars }) ?? null;

    saveDb();

    if (data instanceof FileResult) {
      return respond(200, data.blob, {
        'content-type': data.blob.type,
        'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(data.filename)}`,
      });
    }

    return respond(200, data);
  } catch (error) {
    const status = error instanceof HttpStatus ? error.status : 500;
    const response = respond(status, { message: error instanceof Error ? error.message : 'Lỗi mock server' });

    throw new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', config, {}, response);
  }
};

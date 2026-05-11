/**
 * WordNote API Client
 * Spring Boot 백엔드 (localhost:8080) 연동
 * Clinical Brutalism Design System
 */

// 로컬 개발: Spring Boot 백엔드 (localhost:8080)
// 배포 시: 실제 서버 URL로 변경
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BoardType = 'ROUTINE' | 'EVENT';
export type BoxState = 'READY' | 'IN_PROGRESS' | 'DONE';
export type AlarmType = 'NONE' | 'AT_TIME' | 'BEFORE_10' | 'BEFORE_30';

export interface Task {
  taskId: number;
  name: string;
}

export interface BoxTask {
  taskId: number;
  taskName: string;
  boxTaskId: number;
  sortIndex: number;
  isDone?: boolean;
}

export interface Box {
  boxId: number;
  name: string;
  state: BoxState;
  bookmark: boolean;
  sortIndex: number;
  alarmType: AlarmType;
  expireTime: string | null;
  createdAt: string;
  tasks: BoxTask[];
}

export interface Board {
  boardId: number;
  type: BoardType;
  boxes: Box[];
}

export interface Member {
  nickname: string;
  email: string;
  role: string;
  boardIds: number[];
  profileUri: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

let authToken: string | null = localStorage.getItem('wn_token');

export function setToken(token: string) {
  authToken = token;
  localStorage.setItem('wn_token', token);
}

export function clearToken() {
  authToken = null;
  localStorage.removeItem('wn_token');
}

export function getToken() {
  return authToken;
}

// ─── Fetch Helper ─────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken?: string }>(
      'POST', '/auth/login', { email, password }
    ),
  signup: (name: string, nickname: string, email: string, password: string) =>
    request<Member>('POST', '/member/signup', { name, nickname, email, password }),
};

// ─── Member API ───────────────────────────────────────────────────────────────

export const memberApi = {
  mypage: () => request<Member>('GET', '/member/mypage'),
  update: (data: { nickname?: string; email?: string; password?: string }) =>
    request<Member>('PATCH', '/member', data),
  delete: () => request<void>('DELETE', '/member'),
};

// ─── Board API ────────────────────────────────────────────────────────────────

export const boardApi = {
  getAll: (type?: BoardType) =>
    request<Board[]>('GET', `/board${type ? `?type=${type}` : ''}`),
  getById: (boardId: number) =>
    request<Board>('GET', `/board/${boardId}`),
  create: (type: BoardType) =>
    request<Board>('POST', '/board', { type }),
  update: (boardId: number, type: BoardType) =>
    request<Board>('PATCH', `/board/${boardId}`, { type }),
  delete: (boardId: number) =>
    request<void>('DELETE', `/board/${boardId}`),
};

// ─── Box API ──────────────────────────────────────────────────────────────────

export const boxApi = {
  create: (boardId: number, taskIds: number[]) =>
    request<Box>('POST', '/boxs', { boardId, taskIds }),
  getById: (boxId: number) =>
    request<Box>('GET', `/box/${boxId}`),
  changeState: (boxId: number, status: BoxState) =>
    request<Box>('PATCH', `/box/${boxId}/state`, { status }),
  changeOption: (boxId: number, opts: {
    bookmark?: boolean;
    sortIndex?: number;
    alarmType?: AlarmType;
    expireTime?: string;
  }) =>
    request<Box>('PATCH', `/box/${boxId}/option`, { boxId, ...opts }),
  delete: (boxId: number) =>
    request<void>('DELETE', `/box/${boxId}`),
};

// ─── Task API ─────────────────────────────────────────────────────────────────

export const taskApi = {
  getAll: () => request<Task[]>('GET', '/task'),
  create: (name: string) =>
    request<Task>('POST', '/task', { name }),
  update: (taskId: number, name: string) =>
    request<Task>('PATCH', `/task/${taskId}`, { name }),
  delete: (taskId: number) =>
    request<void>('DELETE', `/task/${taskId}`),
};

// ─── BoxTask API ──────────────────────────────────────────────────────────────

export const boxTaskApi = {
  updateState: (boxTaskId: number, isDone: boolean, name?: string) =>
    request<void>('PATCH', `/boxTask/${boxTaskId}/state`, { name, isDone }),
  move: (boxTaskId: number, boxId: number, targetIndex: number) =>
    request<void>('PUT', `/boxTask/${boxTaskId}/move`, { boxId, targetIndex }),
};

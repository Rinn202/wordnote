import type {
    Board,
    Box,
    CreateBoxRequest,
    LoginRequest,
    LoginResponse,
    Member,
    MoveBoxTaskRequest,
    PatchBoxOptionRequest,
    PatchBoxStateRequest,
    ReorderBoxRequest,
    Task,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function authHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
    };
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: authHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
    if (res.status === 204) return undefined as T;
    // 바디가 없는 200 응답 처리 (content-type 없거나 빈 경우)
    const ct = res.headers.get('content-type');
    if (!ct || !ct.includes('application/json')) return undefined as T;
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
}

// ─── Board ────────────────────────────────────────────────────────────────────
// POST   /board              → 201 CREATED
// GET    /board?currentBoardId={id} → 200 OK
// GET    /board/{boardId}    → 200 OK
// PATCH  /board/{boardId}    → 200 OK
// PUT    /board/{boardId}/reset → 204
// PUT    /board/{boardId}/boxesOrder → 200
// DELETE /board/{boardId}    → 204
export const boardApi = {
    create: () => req<Board>('POST', '/board'),
    // api.ts (또는 boardApi 정의된 곳)
    getAll: (currentBoardId: number) => req<Board[]>('GET', `/board?currentBoardId=${currentBoardId}`),
    getById: (id: number) => req<Board>('GET', `/board/${id}`),
    update: (id: number, body: Partial<Board>) => req<Board>('PATCH', `/board/${id}`, body),
    reset: (id: number) => req<void>('PUT', `/board/${id}/reset`),
    delete: (id: number) => req<void>('DELETE', `/board/${id}`),
    reorderBox: (boardId: number, body: ReorderBoxRequest) =>
        req<void>('PUT', `/board/${boardId}/boxesOrder`, body),
};

// ─── Box ──────────────────────────────────────────────────────────────────────
// POST   /box                       → 201 CREATED
// GET    /box/{id}                  → 200 OK
// PATCH  /box/{boxId}/state         → 200 OK  body: { state: "DONE|IN_PROGRESS|READY" }
// PATCH  /box/{boxId}/option        → 200 OK  body: { bookmark, alarmType, expireTime }
// DELETE /box/{boxId}               → 204
export const boxApi = {
    create: (body: CreateBoxRequest) => req<Box>('POST', '/box', body),
    getById: (id: number) => req<Box>('GET', `/box/${id}`),
    patchState: (id: number, body: PatchBoxStateRequest) =>
        req<Box>('PATCH', `/box/${id}/state`, body),
    patchOption: (id: number, body: PatchBoxOptionRequest) =>
        req<Box>('PATCH', `/box/${id}/option`, body),
    delete: (id: number) => req<void>('DELETE', `/box/${id}`),
};

// ─── Task ─────────────────────────────────────────────────────────────────────
// GET    /task                              → 200 OK
// POST   /task          { name }            → 200 OK  (명세상 200, 201 아님)
// PATCH  /task/{id}     { name }            → 200 OK
// DELETE /task/{id}                         → 204
//
// PATCH  boxTask/{boxTaskId}/done  → body 없음
// PUT    boxTask/{boxTaskId}/move  → 200 OK  body: { boxId, targetIndex }
export const taskApi = {
    getAll: () => req<Task[]>('GET', '/task'),
    create: (name: string) => req<Task>('POST', '/task', {name}),
    update: (id: number, name: string) => req<Task>('PATCH', `/task/${id}`, {name}),
    delete: (id: number) => req<void>('DELETE', `/task/${id}`),

    // ✅ PATCH /boxTask/{boxTaskId}/done  (바디 없음)
    done: (boxTaskId: number) =>
        req<void>('PATCH', `/boxTask/${boxTaskId}/done`),

    // PUT /boxTask/{boxTaskId}/move
    move: (boxTaskId: number, body: MoveBoxTaskRequest) =>
        req<void>('PUT', `/boxTask/${boxTaskId}/move`, body),
};

// ─── Member / Auth ────────────────────────────────────────────────────────────
// POST   /member/signup   { name, nickname, email, password } → 201
// GET    /member/mypage                                        → 200
// GET    /member                                               → 200 (전체조회, 관리자용)
// PATCH  /member          { nickname, email }                  → 200
// PATCH  /member/password { password }                         → 200
// DELETE /member                                               → 204 (탈퇴)
// POST   /auth/login      { email, password }                  → 200  { accessToken, refreshToken, nickname }
export const memberApi = {
    login: (body: LoginRequest) => req<LoginResponse>('POST', '/auth/login', body),
    signup: (body: unknown) => req<Member>('POST', '/member/signup', body),
    mypage: () => req<Member>('GET', '/member/mypage'),
    getAll: () => req<Member[]>('GET', '/member'),
    update: (body: unknown) => req<Member>('PATCH', '/member', body),
    updatePassword: (password: string) => req<void>('PATCH', '/member/password', {password}),
    withdraw: () => req<void>('DELETE', '/member'),
};
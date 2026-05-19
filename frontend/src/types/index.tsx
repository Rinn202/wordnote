// ─── Board ────────────────────────────────────────────────────────────────────
export type BoardType = 'ROUTINE' | 'EVENT';
export type BoxState = 'READY' | 'IN_PROGRESS' | 'DONE';
export type BoxType = 'ROUTINE' | 'EVENT';
export type AlarmType = 'NONE' | 'AT_TIME' | 'TEN_MINUTES_BEFORE' | 'THIRTY_MINUTES_BEFORE' | 'ONE_HOUR_BEFORE';
export type TabType = 'ALL' | 'ACTIVE' | 'DONE' | 'BOOKMARK';

// ─── Task ─────────────────────────────────────────────────────────────────────
export interface Task {
    taskId: number;
    name: string;
    memberId: number | null;
    category: string | null;
}

// ─── BoxTask ──────────────────────────────────────────────────────────────────
export interface BoxTask {
    taskId: number;
    taskName?: string;
    name?: string;
    boxTaskId: number;
    sortIndex: number;
    isDone?: boolean;
}

// ─── Box ──────────────────────────────────────────────────────────────────────
export interface Box {
    boxId: number;
    name: string;
    state: BoxState;
    boxType: BoardType;
    type?: BoxType;
    bookmark: boolean;
    alarmType: AlarmType;
    expireTime: string | null;
    sortIndex: number;
    createdAt: string;
    taskIds?: number[];
    tasks: BoxTask[];
    taskList?: BoxTask[];
}

// ─── Board ────────────────────────────────────────────────────────────────────
export interface Board {
    boardId: number;
    boxes: Box[];
}

// ─── BoxOption ────────────────────────────────────────────────────────────────
export interface BoxOption {
    bookmark: boolean;
    alarmType: AlarmType;
    expireTime: string | null;
}

// ─── API Request / Response DTOs ──────────────────────────────────────────────
export interface CreateBoxRequest {
    boardId: number;
    name: string;
    boxType: BoardType;
    taskIds: number[];
}

export interface PatchBoxStateRequest {
    state: BoxState;
}

export interface PatchBoxOptionRequest {
    bookmark?: boolean;
    alarmType?: AlarmType;
    expireTime?: string | null;
}

export interface ReorderBoxRequest {
    boxId: number;
    targetIndex: number;
}

export interface PatchBoxTaskStateRequest {
    name?: string | null;
    isDone: boolean;
}

export interface MoveBoxTaskRequest {
    boxId: number;
    targetIndex: number;
}

// ─── Member ───────────────────────────────────────────────────────────────────
export interface Member {
    nickname: string;
    email: string;
    role: 'BASIC' | 'ADMIN';
    boardIds: number[];
    profileUri: string;
    createdAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    nickname: string;
}

export interface RefreshResponse {
    accessToken: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────
export interface NormalizedTask {
    id: number;
    name: string;
}

export interface ConfirmState {
    message: string;
    onConfirm: () => void;
}

export interface DragState {
    draggingBoxId: number | null;
    overIndex: number | null;
    boardType: BoardType | null;
}

// ─── Time-of-day character ────────────────────────────────────────────────────
export type TimeOfDay = 'day' | 'evening' | 'night';

export function getTimeOfDay(hour: number): TimeOfDay {
    if (hour >= 6 && hour < 14) return 'day';
    if (hour >= 14 && hour < 21) return 'evening';
    return 'night';
}
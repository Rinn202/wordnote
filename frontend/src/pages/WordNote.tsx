export type BoxState = 'READY' | 'IN_PROGRESS' | 'DONE';
export type BoxType = 'ROUTINE' | 'EVENT';
export type AlarmType = 'NONE' | 'AT_TIME' | 'TEN_MINUTES_BEFORE' | 'THIRTY_MINUTES_BEFORE' | 'ONE_HOUR_BEFORE';
export type TabType = 'TODO' | 'DONE';

export interface Task {
    taskId: number;
    name: string;
}

export interface BoxTask {
    taskId: number;
    taskName?: string;
    name?: string;
}

export interface Box {
    boxId: number;
    name: string;
    state: BoxState;
    boxType: BoxType;
    type?: BoxType;
    bookmark: boolean;
    alarmType: AlarmType;
    expireTime: string | null;
    taskIds?: number[];
    tasks?: BoxTask[];
    taskList?: BoxTask[];
}

export interface Board {
    boardId: number;
    boxes?: Box[];
}

export interface BoxOption {
    bookmark: boolean;
    alarmType: AlarmType;
    expireTime: string | null;
}

export interface NormalizedTask {
    id: number;
    name: string;
}

export interface ConfirmState {
    message: string;
    onConfirm: () => void;
}
// 상태 열거형
export enum BoxState {
  READY = "READY",
  PROGRESS = "PROGRESS",
  DONE = "DONE",
}

export enum BoardType {
  ROUTINE = "ROUTINE",
  EVENT = "EVENT",
}

export enum TabType {
  TODO = "TODO", // READY + PROGRESS
  DONE = "DONE",
}

export enum AlarmType {
  NONE = "NONE",
  TEN_MINUTES_BEFORE = "TEN_MINUTES_BEFORE",
  THIRTY_MINUTES_BEFORE = "THIRTY_MINUTES_BEFORE",
  ONE_HOUR_BEFORE = "ONE_HOUR_BEFORE",
  AT_TIME = "AT_TIME",
}

// 시간대별 이미지 타입
export enum TimeOfDay {
  DAY = "DAY", // 06~14시 - 참새
  EVENING = "EVENING", // 14~21시 - 까치
  NIGHT = "NIGHT", // 21~06시 - 부엉이
}

// Task 타입
export interface Task {
  id: string;
  name: string;
  category: string; // 사용자 정의 그룹명 (아침, 점심, 저녁 등)
  isDone?: boolean; // 완료 여부
}

// Box 내 Task (isDone 포함)
export interface BoxTask extends Task {
  isDone?: boolean;
}

// Box 타입
export interface Box {
  id: string;
  name: string;
  state: BoxState;
  tasks: BoxTask[];
  alarmType: AlarmType;
  expireTime?: number; // 타임스탬
  isBookmarked: boolean;
  createdAt: number;
}

// Board 타입
export interface Board {
  id: string;
  type: BoardType;
  boxes: Box[];
  createdAt: number;
  updatedAt: number;
}

// 보드 페어 (루틴 + 이벤트)
export interface BoardPair {
  routine: Board;
  event: Board;
}

// 사용자 타입
export interface User {
  id: string;
  nickname: string;
  email: string;
  profileImage?: string;
  createdAt: number;
}

// 앱 상태
export interface AppState {
  user: User | null;
  boardPair: BoardPair | null;
  currentBoardType: BoardType;
  currentTab: TabType;
  tasks: Task[]; // 좌측 하단 전체 태스크 목록
  selectedTaskCategory?: string;
}

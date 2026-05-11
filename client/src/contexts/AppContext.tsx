import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  AppState,
  Board,
  BoardPair,
  BoardType,
  Box,
  BoxState,
  TabType,
  Task,
  User,
  AlarmType,
} from "@/types";

interface AppContextType {
  state: AppState;
  // 보드 관련
  loadBoard: (boardPair: BoardPair) => void;
  saveBoard: () => void;
  switchBoardType: (type: BoardType) => void;
  switchTab: (tab: TabType) => void;
  // 박스 관련
  addBox: (tasks: Task[], boxName?: string, targetBoardType?: BoardType) => void;
  updateBoxState: (boxId: string, state: BoxState) => void;
  deleteBox: (boxId: string) => void;
  moveBox: (boxId: string, fromIndex: number, toIndex: number) => void;
  updateBoxAlarm: (boxId: string, alarmType: AlarmType) => void;
  updateBoxExpireTime: (boxId: string, expireTime?: number) => void;
  updateBoxBookmark: (boxId: string, isBookmarked: boolean) => void;
  // 태스크 관련
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setTasks: (tasks: Task[]) => void;
  // 사용자 관련
  setUser: (user: User | null) => void;
  // 완료 처리
  completeDay: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    boardPair: null,
    currentBoardType: BoardType.ROUTINE,
    currentTab: TabType.TODO,
    tasks: [],
  });

  useEffect(() => {
    const savedBoardPair = localStorage.getItem("boardPair");
    if (savedBoardPair) {
      try {
        const boardPair: BoardPair = JSON.parse(savedBoardPair);
        setState((prev) => ({ ...prev, boardPair }));
      } catch (e) {
        console.error("Failed to load board pair", e);
        initializeNewBoardPair();
      }
    } else {
      initializeNewBoardPair();
    }

    const sampleTasks: Task[] = [
      { id: "t1", name: "이메일 확인", category: "아침" },
      { id: "t2", name: "회의 준비", category: "아침" },
      { id: "t3", name: "점심 먹기", category: "점심" },
      { id: "t4", name: "프로젝트 검토", category: "점심" },
      { id: "t5", name: "저녁 운동", category: "저녁" },
      { id: "t6", name: "일일 정리", category: "저녁" },
    ];
    setState((prev) => ({ ...prev, tasks: sampleTasks }));
  }, []);

  const initializeNewBoardPair = () => {
    const newBoardPair: BoardPair = {
      routine: {
        id: "routine-" + Date.now(),
        type: BoardType.ROUTINE,
        boxes: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      event: {
        id: "event-" + Date.now(),
        type: BoardType.EVENT,
        boxes: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };
    setState((prev) => ({ ...prev, boardPair: newBoardPair }));
  };

  const loadBoard = useCallback((boardPair: BoardPair) => {
    setState((prev) => ({ ...prev, boardPair }));
    localStorage.setItem("boardPair", JSON.stringify(boardPair));
  }, []);

  const saveBoard = useCallback(() => {
    if (state.boardPair) {
      localStorage.setItem("boardPair", JSON.stringify(state.boardPair));
    }
  }, [state.boardPair]);

  const switchBoardType = useCallback((type: BoardType) => {
    setState((prev) => ({ ...prev, currentBoardType: type, currentTab: TabType.TODO }));
  }, []);

  const switchTab = useCallback((tab: TabType) => {
    setState((prev) => ({ ...prev, currentTab: tab }));
  }, []);

  const getCurrentBoard = (): Board | null => {
    if (!state.boardPair) return null;
    return state.currentBoardType === BoardType.ROUTINE
      ? state.boardPair.routine
      : state.boardPair.event;
  };

  const addBox = useCallback(
    (tasks: Task[], boxName?: string, targetBoardType?: BoardType) => {
      setState((prev) => {
        if (!prev.boardPair) return prev;
        const updatedBoardPair = { ...prev.boardPair };
        const board =
          (targetBoardType || prev.currentBoardType) === BoardType.ROUTINE
            ? updatedBoardPair.routine
            : updatedBoardPair.event;

        const newBox: Box = {
          id: "box-" + Date.now(),
          name: boxName || (tasks.length === 1 ? "" : `Box ${board.boxes.length + 1}`),
          state: BoxState.READY,
          tasks,
          alarmType: AlarmType.NONE,
          isBookmarked: false,
          createdAt: Date.now(),
        };

        board.boxes.push(newBox);
        board.updatedAt = Date.now();
        return { ...prev, boardPair: updatedBoardPair };
      });
    },
    []
  );

  const updateBoxState = useCallback(
    (boxId: string, newState: BoxState) => {
      setState((prev) => {
        if (!prev.boardPair) return prev;
        const updatedBoardPair = { ...prev.boardPair };
        const board =
          prev.currentBoardType === BoardType.ROUTINE
            ? updatedBoardPair.routine
            : updatedBoardPair.event;

        const boxIndex = board.boxes.findIndex((b) => b.id === boxId);
        if (boxIndex !== -1) {
          board.boxes[boxIndex].state = newState;
          board.updatedAt = Date.now();
        }
        return { ...prev, boardPair: updatedBoardPair };
      });
    },
    [state.currentBoardType]
  );

  const deleteBox = useCallback(
    (boxId: string) => {
      setState((prev) => {
        if (!prev.boardPair) return prev;
        const updatedBoardPair = { ...prev.boardPair };
        const board =
          prev.currentBoardType === BoardType.ROUTINE
            ? updatedBoardPair.routine
            : updatedBoardPair.event;

        board.boxes = board.boxes.filter((b) => b.id !== boxId);
        board.updatedAt = Date.now();
        return { ...prev, boardPair: updatedBoardPair };
      });
    },
    [state.currentBoardType]
  );

  const moveBox = useCallback(
    (boxId: string, fromIndex: number, toIndex: number) => {
      setState((prev) => {
        if (!prev.boardPair) return prev;
        const updatedBoardPair = { ...prev.boardPair };
        const board =
          prev.currentBoardType === BoardType.ROUTINE
            ? updatedBoardPair.routine
            : updatedBoardPair.event;

        const box = board.boxes[fromIndex];
        if (box && box.id === boxId) {
          board.boxes.splice(fromIndex, 1);
          board.boxes.splice(toIndex, 0, box);
          board.updatedAt = Date.now();
        }
        return { ...prev, boardPair: updatedBoardPair };
      });
    },
    [state.currentBoardType]
  );

  const updateBoxAlarm = useCallback(
    (boxId: string, alarmType: AlarmType) => {
      setState((prev) => {
        if (!prev.boardPair) return prev;
        const updatedBoardPair = { ...prev.boardPair };
        const board =
          prev.currentBoardType === BoardType.ROUTINE
            ? updatedBoardPair.routine
            : updatedBoardPair.event;

        const box = board.boxes.find((b) => b.id === boxId);
        if (box) {
          box.alarmType = alarmType;
          board.updatedAt = Date.now();
        }
        return { ...prev, boardPair: updatedBoardPair };
      });
    },
    [state.currentBoardType]
  );

  const updateBoxExpireTime = useCallback(
    (boxId: string, expireTime?: number) => {
      setState((prev) => {
        if (!prev.boardPair) return prev;
        const updatedBoardPair = { ...prev.boardPair };
        const board =
          prev.currentBoardType === BoardType.ROUTINE
            ? updatedBoardPair.routine
            : updatedBoardPair.event;

        const box = board.boxes.find((b) => b.id === boxId);
        if (box) {
          box.expireTime = expireTime;
          board.updatedAt = Date.now();
        }
        return { ...prev, boardPair: updatedBoardPair };
      });
    },
    [state.currentBoardType]
  );

  const updateBoxBookmark = useCallback(
    (boxId: string, isBookmarked: boolean) => {
      setState((prev) => {
        if (!prev.boardPair) return prev;
        const updatedBoardPair = { ...prev.boardPair };
        const board =
          prev.currentBoardType === BoardType.ROUTINE
            ? updatedBoardPair.routine
            : updatedBoardPair.event;

        const box = board.boxes.find((b) => b.id === boxId);
        if (box) {
          box.isBookmarked = isBookmarked;
          board.updatedAt = Date.now();
        }
        return { ...prev, boardPair: updatedBoardPair };
      });
    },
    [state.currentBoardType]
  );

  const addTask = useCallback((task: Task) => {
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task],
    }));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  }, []);

  const setTasks = useCallback((tasks: Task[]) => {
    setState((prev) => ({ ...prev, tasks }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const completeDay = useCallback(() => {
    if (!state.boardPair) return;

    const updatedBoardPair = { ...state.boardPair };

    updatedBoardPair.routine.boxes.forEach((box) => {
      box.state = BoxState.READY;
    });

    updatedBoardPair.event.boxes = [];

    updatedBoardPair.routine.updatedAt = Date.now();
    updatedBoardPair.event.updatedAt = Date.now();

    setState((prev) => ({
      ...prev,
      boardPair: updatedBoardPair,
      currentBoardType: BoardType.ROUTINE,
      currentTab: TabType.TODO,
    }));

    localStorage.setItem("boardPair", JSON.stringify(updatedBoardPair));
  }, [state.boardPair]);

  const value: AppContextType = {
    state,
    loadBoard,
    saveBoard,
    switchBoardType,
    switchTab,
    addBox,
    updateBoxState,
    deleteBox,
    moveBox,
    updateBoxAlarm,
    updateBoxExpireTime,
    updateBoxBookmark,
    addTask,
    removeTask,
    setTasks,
    setUser,
    completeDay,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

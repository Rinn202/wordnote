import {useCallback, useState} from 'react';
import type {Board, BoardType, Box, BoxState} from '../types';
import {boardApi, boxApi, taskApi} from '../api';

const LAST_BOARD_KEY = 'lastBoardId';

export function useBoard() {
    const [board, setBoard] = useState<Board | null>(null);
    const [loading, setLoading] = useState(true);

    const loadBoard = useCallback(async (boardId: number) => {
        setLoading(true);
        try {
            // 현재 보드가 비어있으면 삭제
            if (board && board.boxes.length === 0) {
                await boardApi.delete(board.boardId);
            }
            const b = await boardApi.getById(boardId);
            localStorage.setItem(LAST_BOARD_KEY, String(boardId));
            setBoard(b);
        } finally {
            setLoading(false);
        }
    }, [board]);

    const initBoard = useCallback(async () => {
        const lastId = localStorage.getItem(LAST_BOARD_KEY);
        if (!lastId) {
            setLoading(false); // lastId 없을 때 로딩 종료
            return;
        }
        setLoading(true);
        try {
            const b = await boardApi.getById(Number(lastId));
            setBoard(b);
        } catch (error: any) {
            setLoading(false); // ← 추가
            const status = error?.response?.status;
            if (status !== 401) {
                localStorage.removeItem(LAST_BOARD_KEY);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const createNewBoard = useCallback(async () => {
        setLoading(true);
        try {
            const b = await boardApi.create();
            localStorage.setItem(LAST_BOARD_KEY, String(b.boardId));
            setBoard(b);
        } finally {
            setLoading(false);
        }
    }, []);

    const resetBoard = useCallback(async () => {
        if (!board) return;
        await boardApi.reset(board.boardId);
        const fresh = await boardApi.getById(board.boardId);
        setBoard(fresh);
    }, [board]);

    const patchBoxState = useCallback(async (boxId: number, state: BoxState) => {
        const updated = await boxApi.patchState(boxId, {state});
        setBoard(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                boxes: prev.boxes.map(b => b.boxId === boxId ? updated : b),
            };
        });
    }, []);

    const removeBox = useCallback((boxId: number) => {
        setBoard(prev => {
            if (!prev) return prev;
            return {...prev, boxes: prev.boxes.filter(b => b.boxId !== boxId)};
        });
    }, []);

    const reorderBox = useCallback(async (
        boxId: number,
        targetIndex: number,
        boardType: BoardType,
    ) => {
        if (!board) return;

        setBoard(prev => {
            if (!prev) return prev;
            const typed = prev.boxes.filter(b => b.boxType === boardType);
            const others = prev.boxes.filter(b => b.boxType !== boardType);
            const from = typed.findIndex(b => b.boxId === boxId);
            if (from === -1) return prev;
            const reordered = [...typed];
            const [item] = reordered.splice(from, 1);
            reordered.splice(targetIndex, 0, item);
            const merged = boardType === 'ROUTINE'
                ? [...reordered, ...others]
                : [...others, ...reordered];
            return {...prev, boxes: merged};
        });

        const allBoxes = board.boxes;
        const typedBoxes = allBoxes.filter(b => b.boxType === boardType);
        const otherBoxes = allBoxes.filter(b => b.boxType !== boardType);
        const targetBox = typedBoxes[targetIndex];
        const globalTargetIndex = targetBox
            ? allBoxes.findIndex(b => b.boxId === targetBox.boxId)
            : boardType === 'ROUTINE'
                ? typedBoxes.length - 1
                : otherBoxes.length + typedBoxes.length - 1;

        await boardApi.reorderBox(board.boardId, {boxId, targetIndex: globalTargetIndex});
    }, [board]);

    const updateBoxLocal = useCallback((updated: Box) => {
        setBoard(prev => {
            if (!prev) return prev;
            return {...prev, boxes: prev.boxes.map(b => b.boxId === updated.boxId ? updated : b)};
        });
    }, []);

    const addBox = useCallback((box: Box) => {
        setBoard(prev => {
            if (!prev) return prev;
            return {...prev, boxes: [...prev.boxes, box]};
        });
    }, []);

    const reorderTask = useCallback(async (
        boxId: number,
        boxTaskId: number,
        targetIndex: number,
    ) => {
        if (!board) return;

        // 낙관적 업데이트
        setBoard(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                boxes: prev.boxes.map(b => {
                    if (b.boxId !== boxId) return b;
                    const tasks = [...b.tasks];
                    const from = tasks.findIndex(t => t.boxTaskId === boxTaskId);
                    if (from === -1) return b;
                    const [item] = tasks.splice(from, 1);
                    tasks.splice(targetIndex, 0, item);
                    return {...b, tasks};
                }),
            };
        });

        await taskApi.move(boxTaskId, {boxId, targetIndex});
    }, [board]);

    return {
        board, loading,
        initBoard, loadBoard, createNewBoard, resetBoard,
        patchBoxState, removeBox, reorderBox,
        updateBoxLocal, addBox, reorderTask,
    };
}
import { useCallback, useState } from 'react';
import type { Board, BoardType, Box, BoxState } from '../types';
import { boardApi, boxApi, taskApi } from '../api';

const LAST_BOARD_KEY = 'lastBoardId';

export function useBoard() {
    const [board, setBoard] = useState<Board | null>(null);
    const [loading, setLoading] = useState(true);

const loadBoard = useCallback(async (boardId: number) => {
    setLoading(true);
    try {
        // 🗑️ 빈 보드 삭제 로직 제거 - createNewBoard 이후 샘플 보드가 삭제되는 원인
        // if (board && board.boxes.length === 0) await boardApi.delete(board.boardId);
        const b = await boardApi.getById(boardId);
        localStorage.setItem(LAST_BOARD_KEY, String(boardId));
        setBoard(b);
    } finally {
        setLoading(false);
    }
}, [board]);

    // const loadBoard = useCallback(async (boardId: number) => {
    //     setLoading(true);
    //     try {
    //         if (board && board.boxes.length === 0) await boardApi.delete(board.boardId);
    //         const b = await boardApi.getById(boardId);
    //         localStorage.setItem(LAST_BOARD_KEY, String(boardId));
    //         setBoard(b);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [board]);

    
    const initBoard = useCallback(async () => {
        const lastId = localStorage.getItem(LAST_BOARD_KEY);
        if (!lastId) { setLoading(false); return; }
        setLoading(true);
        try {
            setBoard(await boardApi.getById(Number(lastId)));
        } catch (error: unknown) {
            const status = (error as any)?.response?.status;
            if (status !== 401) localStorage.removeItem(LAST_BOARD_KEY);
        } finally {
            setLoading(false);
        }
    }, []);

    // const createNewBoard = useCallback(async () => {
    //     setLoading(true);
    //     try {
    //         const b = await boardApi.create();
    //         localStorage.setItem(LAST_BOARD_KEY, String(b.boardId));
    //         setBoard(b);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);

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

const applySample = useCallback(async () => {
    if (!board) return;
    setLoading(true);
    try {
        const b = await boardApi.createSample(board.boardId);
        setBoard(b);
    } finally {
        setLoading(false);
    }
}, [board]);


    const resetBoard = useCallback(async () => {
        if (!board) return;
        await boardApi.reset(board.boardId);
        setBoard(await boardApi.getById(board.boardId));
    }, [board]);

    const patchBoxState = useCallback(async (boxId: number, state: BoxState) => {
        const updated = await boxApi.patchState(boxId, { state });
        setBoard(prev => prev ? { ...prev, boxes: prev.boxes.map(b => b.boxId === boxId ? updated : b) } : prev);
    }, []);

    const removeBox = useCallback((boxId: number) => {
        setBoard(prev => prev ? { ...prev, boxes: prev.boxes.filter(b => b.boxId !== boxId) } : prev);
    }, []);

    const reorderBox = useCallback(async (boxId: number, targetIndex: number, boardType: BoardType) => {
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
            const merged = boardType === 'ROUTINE' ? [...reordered, ...others] : [...others, ...reordered];
            return { ...prev, boxes: merged };
        });

        const typedBoxes = board.boxes.filter(b => b.boxType === boardType);
        const otherBoxes = board.boxes.filter(b => b.boxType !== boardType);
        const targetBox = typedBoxes[targetIndex];
        const globalTargetIndex = targetBox
            ? board.boxes.findIndex(b => b.boxId === targetBox.boxId)
            : boardType === 'ROUTINE' ? typedBoxes.length - 1 : otherBoxes.length + typedBoxes.length - 1;

        await boardApi.reorderBox(board.boardId, { boxId, targetIndex: globalTargetIndex });
    }, [board]);

    const updateBoxLocal = useCallback((updated: Box) => {
        setBoard(prev => prev ? { ...prev, boxes: prev.boxes.map(b => b.boxId === updated.boxId ? updated : b) } : prev);
    }, []);

    const addBox = useCallback((box: Box) => {
        setBoard(prev => prev ? { ...prev, boxes: [...prev.boxes, box] } : prev);
    }, []);

    const reorderTask = useCallback(async (boxId: number, boxTaskId: number, targetIndex: number) => {
        if (!board) return;

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
                    return { ...b, tasks };
                }),
            };
        });

        await taskApi.move(boxTaskId, { boxId, targetIndex });
    }, [board]);

    return {
        board, loading,
        initBoard, loadBoard, createNewBoard, resetBoard,
        patchBoxState, removeBox, reorderBox, 
        updateBoxLocal, addBox, reorderTask, applySample,
    };
}
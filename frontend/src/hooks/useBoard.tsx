import {useCallback, useRef, useState} from 'react';
import type {Board, BoardType, Box, BoxState} from '../types';
import {boardApi, boxApi} from '../api';

const LAST_BOARD_KEY = 'lastBoardId';

export function useBoard() {
    const [board, setBoard] = useState<Board | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initialized = useRef(false);

    const initBoard = useCallback(async () => {
        if (initialized.current) return;
        initialized.current = true;

        setLoading(true);
        try {
            const lastId = localStorage.getItem(LAST_BOARD_KEY);
            if (lastId) {
                const b = await boardApi.getById(Number(lastId));
                setBoard(b);
            } else {
                const b = await boardApi.create();
                localStorage.setItem(LAST_BOARD_KEY, String(b.boardId));
                setBoard(b);
            }
        } catch (e) {
            setError('보드를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadBoard = useCallback(async (boardId: number) => {
        setLoading(true);
        try {
            const b = await boardApi.getById(boardId);
            localStorage.setItem(LAST_BOARD_KEY, String(boardId));
            setBoard(b);
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

    return {
        board, loading, error,
        initBoard, loadBoard, createNewBoard, resetBoard,
        patchBoxState, removeBox, reorderBox,
        updateBoxLocal, addBox,
    };
}
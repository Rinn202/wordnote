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
            const b = await boardApi.getById(boardId);
            localStorage.setItem(LAST_BOARD_KEY, String(boardId));
            setBoard(b);
        } finally {
            setLoading(false);
        }
    }, []);

const initBoard = useCallback(async () => {
    setLoading(true);
    try {
        const boards = await boardApi.getAll();
        
        if (boards.length === 0) {
            // 보드 자체가 없음 → "첫 보드" 화면
            return;
        }

        const lastId = localStorage.getItem(LAST_BOARD_KEY);
        const lastBoard = lastId && boards.find(b => b.boardId === Number(lastId));

        if (lastBoard) {
            // lastBoardId가 유효하면 바로 로드
            setBoard(await boardApi.getById(Number(lastId)));
        } else {
            // lastBoardId 없거나 삭제된 보드면 모달
            localStorage.removeItem(LAST_BOARD_KEY);
            return boards;
        }
    } catch (error: unknown) {
        const status = (error as any)?.response?.status;
        if (status !== 401) localStorage.removeItem(LAST_BOARD_KEY);
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

    // 박스 상태 변경 낙관적 업데이트
    const patchBoxState = useCallback(async (boxId: number, state: BoxState) => {
        // 1. 에러 대비 현재 상태 스냅샷 저장
        let rollbackBoard: Board | null = null;

        setBoard(prev => {
            if (!prev) return prev;
            rollbackBoard = prev; // 백업
            return {
                ...prev,
                boxes: prev.boxes.map(b => b.boxId === boxId ? {...b, state} : b)
            };
        });

        try {
            // 2. 서버에는 백그라운드로 요청
            const updated = await boxApi.patchState(boxId, {state});

            // 3. 서버 응답이 오면 혹시 모를 누락 데이터(id, 서버 타임스탬프 등) 동기화
            setBoard(prev => prev ? {...prev, boxes: prev.boxes.map(b => b.boxId === boxId ? updated : b)} : prev);
        } catch (error) {
            console.error("상태 변경 실패, 복구합니다.", error);
            // 4. 실패 시 백업본으로 롤백
            if (rollbackBoard) setBoard(rollbackBoard);
        }
    }, []);

    const removeBox = useCallback((boxId: number) => {
        setBoard(prev => prev ? {...prev, boxes: prev.boxes.filter(b => b.boxId !== boxId)} : prev);
    }, []);

    const reorderBox = useCallback(async (boxId: number, targetIndex: number, boardType: BoardType) => {
        if (!board) return;
        const rollbackBoard = board; // 스냅샷 백업

        // 화면 선반영
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
            return {...prev, boxes: merged};
        });

        try {
            const typedBoxes = board.boxes.filter(b => b.boxType === boardType);
            const otherBoxes = board.boxes.filter(b => b.boxType !== boardType);
            const targetBox = typedBoxes[targetIndex];
            const globalTargetIndex = targetBox
                ? board.boxes.findIndex(b => b.boxId === targetBox.boxId)
                : boardType === 'ROUTINE' ? typedBoxes.length - 1 : otherBoxes.length + typedBoxes.length - 1;

            await boardApi.reorderBox(board.boardId, {boxId, targetIndex: globalTargetIndex});
        } catch (error) {
            console.error("순서 변경 실패, 복구합니다.", error);
            setBoard(rollbackBoard); // 롤백
        }
    }, [board]);

    const updateBoxLocal = useCallback((updated: Box) => {
        setBoard(prev => prev ? {...prev, boxes: prev.boxes.map(b => b.boxId === updated.boxId ? updated : b)} : prev);
    }, []);

    const addBox = useCallback((box: Box) => {
        setBoard(prev => prev ? {...prev, boxes: [...prev.boxes, box]} : prev);
    }, []);

    // 태스크 순서 변경 실패 시 롤백
    const reorderTask = useCallback(async (boxId: number, boxTaskId: number, targetIndex: number) => {
        if (!board) return;
        const rollbackBoard = board; // 스냅샷 백업

        // 화면 선반영
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

        try {
            await taskApi.move(boxTaskId, {boxId, targetIndex});
        } catch (error) {
            console.error("태스크 이동 실패, 복구합니다.", error);
            setBoard(rollbackBoard); // 롤백
        }
    }, [board]);

    return {
        board, loading,
        initBoard, loadBoard, createNewBoard, resetBoard,
        patchBoxState, removeBox, reorderBox,
        updateBoxLocal, addBox, reorderTask, applySample,
    };
}
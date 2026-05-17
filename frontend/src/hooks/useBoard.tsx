import {useCallback, useRef, useState} from 'react';
import type {Board, BoardType, Box, BoxState, TabType} from '../types';
import {boardApi, boxApi} from '../api';

const LAST_BOARD_KEY = 'lastBoardId';

export function useBoard() {
    const [board, setBoard] = useState<Board | null>(null);
    const [tab, setTab] = useState<TabType>('ACTIVE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── 보드 초기화 ─────────────────────────────────────────────────────────────
    const initBoard = useCallback(async () => {
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

    // ── 특정 보드 불러오기 ────────────────────────────────────────────────────
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

    // ── 새 보드 생성 ──────────────────────────────────────────────────────────
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

    // ── 보드 리셋 (전체 READY + task isDone:false) ────────────────────────────
    const resetBoard = useCallback(async () => {
        if (!board) return;
        await boardApi.reset(board.boardId);
        const fresh = await boardApi.getById(board.boardId);
        setBoard(fresh);
    }, [board]);

    // ── 박스 상태 변경 ────────────────────────────────────────────────────────
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

    // ── 박스 삭제 (task 없어진 경우 포함) ────────────────────────────────────
    const removeBox = useCallback((boxId: number) => {
        setBoard(prev => {
            if (!prev) return prev;
            return {...prev, boxes: prev.boxes.filter(b => b.boxId !== boxId)};
        });
    }, []);

    // ── 박스 순서 변경 ────────────────────────────────────────────────────────
    const reorderBox = useCallback(async (
        boxId: number,
        targetIndex: number,  // 타입별 필터링 배열 기준 index
        boardType: BoardType,
    ) => {
        if (!board) return;

        // ✅ 서버 전송용 계산은 현재 board 상태 기준으로 먼저 수행
        const allBoxes = board.boxes;
        const typedBoxes = allBoxes.filter(b => b.boxType === boardType);
        const otherBoxes = allBoxes.filter(b => b.boxType !== boardType);

        const fromIndex = typedBoxes.findIndex(b => b.boxId === boxId);
        if (fromIndex === -1) return;

        // 타입별 배열에서 reorder 수행
        const reordered = [...typedBoxes];
        const [item] = reordered.splice(fromIndex, 1);
        reordered.splice(targetIndex, 0, item);

        // 전체 배열로 병합 (순서: ROUTINE → EVENT)
        const merged = boardType === 'ROUTINE'
            ? [...reordered, ...otherBoxes]
            : [...otherBoxes, ...reordered];

        // ✅ 전체 배열에서 해당 boxId의 새 위치를 계산
        const globalTargetIndex = merged.findIndex(b => b.boxId === boxId);

        // 낙관적 업데이트 (이미 계산된 merged 사용)
        setBoard(prev => prev ? {...prev, boxes: merged} : prev);

        // 서버 전송
        await boardApi.reorderBox(board.boardId, {
            boxId,
            targetIndex: globalTargetIndex,
        });
    }, [board]);

    // ── 박스 옵션 패치 후 로컬 반영 ──────────────────────────────────────────
    const updateBoxLocal = useCallback((updated: Box) => {
        setBoard(prev => {
            if (!prev) return prev;
            return {...prev, boxes: prev.boxes.map(b => b.boxId === updated.boxId ? updated : b)};
        });
    }, []);

    // ── 박스 추가 ─────────────────────────────────────────────────────────────
    const addBox = useCallback((box: Box) => {
        setBoard(prev => {
            if (!prev) return prev;
            return {...prev, boxes: [...prev.boxes, box]};
        });
    }, []);

    // ── 탭별 박스 필터 ────────────────────────────────────────────────────────
    const filterBoxes = useCallback((boxes: Box[], type: BoardType) => {
        const byType = boxes.filter(b => b.boxType === type);
        if (tab === 'DONE') return byType.filter(b => b.state === 'DONE');
        return byType.filter(b => b.state !== 'DONE');
    }, [tab]);


    // 🚨 드래그 중인 박스의 인덱스나 ID를 기억할 useRef 활성화!
    const dragItemIndex = useRef<number | null>(null);
    const dragOverItemIndex = useRef<number | null>(null);

    // ── 드래그 시작 ──────────────────────────────────────────────────────────
    const handleDragStart = useCallback((index: number) => {
        dragItemIndex.current = index; // 리렌더링 없이 값만 쏙 저장
    }, []);

    // ── 드래그 중 (어떤 아이템 위로 지나가는 중) ──────────────────────────────────
    const handleDragEnter = useCallback((index: number) => {
        dragOverItemIndex.current = index;
    }, []);

    // ── 드래그 끝 (마우스를 뗐을 때 실제 순서 변경) ───────────────────────────────
    const handleDragEnd = useCallback((boardType: BoardType) => {
        if (dragItemIndex.current === null || dragOverItemIndex.current === null) return;
        if (!board) return;

        const boxId = board.boxes.filter(b => b.boxType === boardType)[dragItemIndex.current].boxId;
        const targetIndex = dragOverItemIndex.current;

        // 아까 만들어두신 순서 변경 함수 실행!
        reorderBox(boxId, targetIndex, boardType);

        // 드래그가 끝났으니 주머니 비우기
        dragItemIndex.current = null;
        dragOverItemIndex.current = null;
    }, [board, reorderBox]);

    return {
        board,
        tab,
        setTab,
        loading,
        error,
        initBoard,
        loadBoard,
        createNewBoard,
        resetBoard,
        patchBoxState,
        removeBox,
        reorderBox,
        updateBoxLocal,
        addBox,
        filterBoxes,

        // 드래그 관련 상태와 함수
        dragItemIndex,
        handleDragStart,
        handleDragEnter,
        handleDragEnd
    };
}
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBoard } from './useBoard';
import { useBoards } from './useBoards';
import type { AlarmToast } from './useAlarm';
import { useAlarm } from './useAlarm';
import { useClock } from './useClock';
import type { Box } from '../types';

// useBoardApp.ts
export function useBoardApp() {
    const { board: currentBoard, ...boardActions } = useBoard();
    const { clockStr, dateStr } = useClock();

    const [optionBox, setOptionBox] = useState<Box | null>(null);
    const [newBoardConfirmOpen, setNewBoardConfirmOpen] = useState(false);
    const [sampleConfirmOpen, setSampleConfirmOpen] = useState(false); // 추가
    const [alarmToasts, setAlarmToasts] = useState<AlarmToast[]>([]);
    const [isTaskDragging, setIsTaskDragging] = useState(false);
    const [taskDraggingBoxId, setTaskDraggingBoxId] = useState<number | null>(null);

    const allBoxes = useMemo(() => currentBoard?.boxes ?? [], [currentBoard?.boxes]);
    const boards = useBoards(currentBoard?.boardId, boardActions.createNewBoard);

    const handleAlarm = useCallback((toast: AlarmToast) => {
        setAlarmToasts(prev => [...prev, toast]);
    }, []);

    const { stopAudio } = useAlarm(allBoxes, handleAlarm);

    const handleCloseToast = useCallback((boxId: number) => {
        setAlarmToasts(prev => {
            const next = prev.filter(t => t.boxId !== boxId);
            if (next.length === 0) stopAudio();
            return next;
        });
    }, [stopAudio]);

    const handleTaskDragChange = useCallback((v: boolean, boxId?: number) => {
        setIsTaskDragging(v);
        setTaskDraggingBoxId(v && boxId != null ? boxId : null);
    }, []);

    const handleNewBoardClick = useCallback(() => {
        if (!currentBoard || currentBoard.boxes.length === 0) return;
        setNewBoardConfirmOpen(true);
    }, [currentBoard]);

    // START 버튼 핸들러 추가
    const handleStart = useCallback(async () => {
        await boardActions.createNewBoard();
        setSampleConfirmOpen(true);
    }, [boardActions]);

    const usedTaskIds = useMemo(
        () => allBoxes.flatMap(b => b.tasks.map(t => t.taskId)),
        [allBoxes]
    );

    const allBoxesStats = useMemo(() => ({
        todo: allBoxes.filter(b => b.state === 'READY').length,
        prog: allBoxes.filter(b => b.state === 'IN_PROGRESS').length,
        done: allBoxes.filter(b => b.state === 'DONE').length,
        alarm: allBoxes.filter(b => b.alarmType && b.alarmType !== 'NONE' && b.state !== 'DONE').length,
    }), [allBoxes]);

    useEffect(() => {
        boardActions.initBoard();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (currentBoard?.boardId) boards.loadAllBoards(currentBoard.boardId);
    }, [currentBoard?.boardId]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        currentBoard,
        boardActions,
        boards,
        clockStr,
        dateStr,
        optionBox, setOptionBox,
        newBoardConfirmOpen, setNewBoardConfirmOpen,
        sampleConfirmOpen, setSampleConfirmOpen, // 추가
        alarmToasts,
        allBoxes,
        allBoxesStats,
        handleAlarm,
        handleCloseToast,
        handleNewBoardClick,
        handleStart, // 추가
        usedTaskIds,
        isTaskDragging,
        taskDraggingBoxId,
        handleTaskDragChange,
    };
}
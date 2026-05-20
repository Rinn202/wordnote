import {useCallback, useEffect, useMemo, useState} from 'react';
import {useBoard} from './useBoard';
import {useBoards} from './useBoards';
import type {AlarmToast} from './useAlarm';
import {useAlarm} from './useAlarm';
import {useClock} from './useClock';
import type {Box} from '../types';

export function useBoardApp() {
    const {board: currentBoard, ...boardActions} = useBoard();
    const {clockStr, dateStr} = useClock();

    const [optionBox, setOptionBox] = useState<Box | null>(null);
    const [newBoardConfirmOpen, setNewBoardConfirmOpen] = useState(false);
    const [alarmToasts, setAlarmToasts] = useState<AlarmToast[]>([]);
    const [isTaskDragging, setIsTaskDragging] = useState(false);
    const [taskDraggingBoxId, setTaskDraggingBoxId] = useState<number | null>(null);

    const allBoxes = useMemo(() => currentBoard?.boxes ?? [], [currentBoard?.boxes]);
    const boards = useBoards(currentBoard?.boardId, boardActions.createNewBoard);

    const handleAlarm = useCallback((toast: AlarmToast) => {
        setAlarmToasts(prev => [...prev, toast]);
    }, []);

    const {stopAudio} = useAlarm(allBoxes, handleAlarm);

    const handleCloseToast = useCallback((boxId: number) => {
        setAlarmToasts(prev => {
            const next = prev.filter(t => t.boxId !== boxId);
            if (next.length === 0) stopAudio();
            return next;
        });
    }, [stopAudio]);

    // boxId를 함께 받아 어느 박스에서 task 드래그가 일어나는지 추적
    const handleTaskDragChange = useCallback((v: boolean, boxId?: number) => {
        setIsTaskDragging(v);
        setTaskDraggingBoxId(v && boxId != null ? boxId : null);
    }, []);

    useEffect(() => {
        boardActions.initBoard();
    }, []);

    const handleNewBoardClick = () => {
        const isEmpty = (currentBoard?.boxes.length ?? 0) === 0;
        if (currentBoard && isEmpty) return;
        if ((currentBoard?.boxes.length ?? 0) > 0) setNewBoardConfirmOpen(true);
        else boardActions.createNewBoard();
    };

    const usedTaskIds = useMemo(
        () => allBoxes.flatMap((b: Box) => b.tasks.map(t => t.taskId)),
        [allBoxes]
    );

    useEffect(() => {
        if (currentBoard?.boardId) {
            boards.loadAllBoards(currentBoard.boardId);
        }
    }, [currentBoard?.boardId]);

    const allBoxesStats = {
        todo: allBoxes.filter((b: Box) => b.state === 'READY').length,
        prog: allBoxes.filter((b: Box) => b.state === 'IN_PROGRESS').length,
        done: allBoxes.filter((b: Box) => b.state === 'DONE').length,
        alarm: allBoxes.filter((b: Box) => b.alarmType && b.alarmType !== 'NONE' && b.state !== 'DONE').length,
    };

    return {
        currentBoard,
        boardActions,
        boards,
        clockStr,
        dateStr,
        optionBox, setOptionBox,
        newBoardConfirmOpen, setNewBoardConfirmOpen,
        alarmToasts,
        allBoxes,
        allBoxesStats,
        handleAlarm,
        handleCloseToast,
        handleNewBoardClick,
        usedTaskIds,
        isTaskDragging,
        taskDraggingBoxId,
        handleTaskDragChange,
    };
}
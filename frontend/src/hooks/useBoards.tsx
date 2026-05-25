import {type MouseEvent, useCallback, useState} from 'react';
import type {Board} from '../types';
import {boardApi} from '../api';

export function useBoards(
    currentBoardId: number | undefined,
    onNewBoard: () => Promise<void>,
) {
    const [allBoards, setAllBoards] = useState<Board[]>([]);
    const [loadModalOpen, setLoadModalOpen] = useState(false);
    const [deletingBoardId, setDeletingBoardId] = useState<number | null>(null);

    const loadAllBoards = useCallback(async (boardId: number) => {
        setAllBoards(await boardApi.getAll(boardId));
    }, []);

    const handleLoadClick = useCallback(async () => {
        if (!currentBoardId) return;
        await loadAllBoards(currentBoardId);
        setLoadModalOpen(true);
    }, [currentBoardId, loadAllBoards]);

    const handleDeleteBoard = useCallback(async (boardId: number, e: MouseEvent) => {
        e.stopPropagation();
        setDeletingBoardId(boardId);
        try {
            await boardApi.delete(boardId);
            setAllBoards(prev => prev.filter(b => b.boardId !== boardId));
            if (currentBoardId === boardId) {
                await onNewBoard();
                setLoadModalOpen(false);
            }
        } finally {
            setDeletingBoardId(null);
        }
    }, [currentBoardId, onNewBoard]);

return {
    allBoards,
    setAllBoards,
    loadModalOpen,
    setLoadModalOpen,
    deletingBoardId,
    loadAllBoards,
    handleLoadClick,
    handleDeleteBoard,
};
}
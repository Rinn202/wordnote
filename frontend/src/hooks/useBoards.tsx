import {useState} from 'react';
import type {Board} from '../types';
import {boardApi} from '../api';

export function useBoards(
    currentBoardId: number | undefined,
    onNewBoard: () => Promise<void>,
) {
    const [allBoards, setAllBoards] = useState<Board[]>([]);
    const [loadModalOpen, setLoadModalOpen] = useState(false);
    const [deletingBoardId, setDeletingBoardId] = useState<number | null>(null);

    const handleLoadClick = async () => {
        if (!currentBoardId) return;
        const boards = await boardApi.getAll(currentBoardId);
        setAllBoards(boards);
        setLoadModalOpen(true);
    };

    const handleDeleteBoard = async (boardId: number, e: React.MouseEvent) => {
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
    };

    return {
        allBoards,
        loadModalOpen,
        setLoadModalOpen,
        deletingBoardId,
        handleLoadClick,
        handleDeleteBoard,
    };
}
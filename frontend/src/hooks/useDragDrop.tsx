import {useCallback, useRef, useState} from 'react';
import type {BoardType} from '../types';

export function useDragDrop(
    onReorder: (boxId: number, targetIndex: number, boardType: BoardType) => Promise<void>,
    boardType: BoardType,
) {
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const dragIndex = useRef<number>(-1);

    const onDragStart = useCallback((boxId: number, index: number) => {
        setDraggingId(boxId);
        dragIndex.current = index;
    }, []);

    const onDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        setOverIndex(index);
    }, []);

    const onDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        if (draggingId === null || overIndex === null) return;
        if (overIndex !== dragIndex.current) {
            await onReorder(draggingId, overIndex, boardType);
        }
        setDraggingId(null);
        setOverIndex(null);
        dragIndex.current = -1;
    }, [draggingId, overIndex, boardType, onReorder]);

    const onDragEnd = useCallback(() => {
        setDraggingId(null);
        setOverIndex(null);
        dragIndex.current = -1;
    }, []);

    return {draggingId, overIndex, onDragStart, onDragOver, onDrop, onDragEnd};
}
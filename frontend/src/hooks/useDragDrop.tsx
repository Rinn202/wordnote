import {useCallback, useRef, useState} from 'react';
import type {BoardType} from '../types';

export function useDragDrop(
    onReorder: (boxId: number, targetIndex: number, boardType: BoardType) => Promise<void>,
    boardType: BoardType,
    onDragActiveChange?: (active: boolean) => void, 
) {
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const dragIndex = useRef<number>(-1);

    const onDragStart = useCallback((boxId: number, index: number) => {
        dragIndex.current = index;
        requestAnimationFrame(() => {
            setDraggingId(boxId);
            onDragActiveChange?.(true);  // 추가
        });
    }, [onDragActiveChange]);;

    const onDragOver = useCallback((e: React.DragEvent<HTMLElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const relY = e.clientY - rect.top;
        const ratio = relY / rect.height;

        const topThreshold = index === 0 ? 0.1 : 0.05;

        let next: number | null = null;
        if (ratio < topThreshold) {
            next = index;
        } else if (ratio > 0.75) {
            next = index + 1;
        } else {
            return; // 중간 구간은 아무것도 안 함
        }

        setOverIndex(prev => prev === next ? prev : next);
    }, []);

    const onDrop = useCallback(async (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();

        const currentDraggingId = draggingId;
        const currentOverIndex = overIndex;

        // 먼저 상태 초기화 → UI 즉시 복구
        setDraggingId(null);
        setOverIndex(null);
        dragIndex.current = -1;
         onDragActiveChange?.(false);

        if (currentDraggingId === null || currentOverIndex === null) return;
        if (currentOverIndex !== dragIndex.current) {
            await onReorder(currentDraggingId, currentOverIndex, boardType);
        }
    }, [draggingId, overIndex, boardType, onReorder]);

    const onDragEnd = useCallback(() => {
        setDraggingId(null);
        setOverIndex(null);
        dragIndex.current = -1;
    }, []);

    // useDragDrop.tsx
    const onDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDraggingId(null);
            setOverIndex(null);
            dragIndex.current = -1;
            onDragActiveChange?.(false);
        }
    }, []);

    return {draggingId, overIndex, onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave};
}
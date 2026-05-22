import React, { useState } from 'react';
import type { Box, BoxState, TabType } from '../../types';
import BoardType from '../box/BoxCard';
import { useDragDrop } from '../../hooks/useDragDrop';
import { filterBoxes, DropZone } from './boardUtils';

type BoardType = 'EVENT' | 'ROUTINE';

interface Props {
    boardType: BoardType;
    boxes: Box[];
    onStateChange: (boxId: number, state: BoxState) => Promise<void>;
    onDelete: (boxId: number) => void;
    onUpdate: (box: Box) => void;
    onOpenOption: (box: Box) => void;
    onReorder: (boxId: number, targetIndex: number, boardType: BoardType) => Promise<void>;
    onReorderTask: (boxId: number, boxTaskId: number, targetIndex: number) => Promise<void>;
    isTaskDragging: boolean;
    taskDraggingBoxId: number | null;
    onTaskDragChange: (v: boolean, boxId: number) => void;
}

export default function BoardColumn({
    boardType, boxes, onReorderTask, onStateChange, onDelete, onUpdate,
    onOpenOption, onReorder, isTaskDragging, taskDraggingBoxId, onTaskDragChange,
}: Props) {
    const [tab, setTab] = useState<TabType>('ACTIVE');
    const { draggingId, overIndex, onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave } =
        useDragDrop(onReorder as any, boardType);

    const filtered = filterBoxes(boxes, tab);

    return (
        <div className={`board-col ${boardType === 'EVENT' ? 'event-col' : ''}`}>
            <div className="col-header">
                <div className="col-header-top">
                    {/* TODO: 인라인 스타일 → board.css로 이동 권장 */}
                    <span style={{
                        fontFamily: 'PyeongchangPeace, sans-serif',
                        fontWeight: 700, fontSize: 28,
                        color: 'rgba(0,0,0,0.07)', letterSpacing: '.04em',
                        lineHeight: 1, marginLeft: 'auto', userSelect: 'none',
                    }}>{boardType}</span>
                </div>
                <div className="col-tabs">
                    {(['ALL', 'ACTIVE', 'DONE', 'BOOKMARK'] as TabType[]).map(t => (
                        <button key={t} className={`col-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t === 'ALL' ? '전체' : t === 'ACTIVE' ? '할 일' : t === 'DONE' ? '완료'
                                : <i className="ti ti-bookmark" aria-hidden="true" />}
                        </button>
                    ))}
                    <span className="col-count">{filtered.length}개</span>
                </div>
            </div>

            <div className="boxes-list" onDrop={onDrop} onDragLeave={onDragLeave}>
                {filtered.map((box, index) => (
                    <React.Fragment key={box.boxId}>
                        {!isTaskDragging && overIndex === index && draggingId !== box.boxId && <DropZone />}
                        {draggingId !== box.boxId && (
                            <BoardType
                                box={box}
                                onStateChange={onStateChange}
                                onDelete={onDelete}
                                onUpdate={onUpdate}
                                onOpenOption={onOpenOption}
                                onReorderTask={onReorderTask}
                                taskDraggingBoxId={taskDraggingBoxId}
                                isDragging={draggingId === box.boxId}
                                onDragStart={() => onDragStart(box.boxId, index)}
                                onDragOver={e => onDragOver(e, index)}
                                onDragEnd={onDragEnd}
                                onTaskDragChange={onTaskDragChange}
                            />
                        )}
                    </React.Fragment>
                ))}
                {!isTaskDragging && overIndex === filtered.length && draggingId !== null && <DropZone />}
                {filtered.length === 0 && (
                    <div className="empty-board">
                        <i className={`ti ${boardType === 'EVENT' ? 'ti-calendar-event' : 'ti-layout-list'}`} aria-hidden="true" />
                        <p>{boardType === 'EVENT' ? '이벤트' : '루틴'} 박스가 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}
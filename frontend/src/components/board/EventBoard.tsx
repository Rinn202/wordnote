import React from 'react';
import type {Box, BoxState} from '../../types';
import BoxCard from './BoxCard';
import {useDragDrop} from '../../hooks/useDragDrop';

interface Props {
    boxes: Box[];
    onStateChange: (boxId: number, state: BoxState) => Promise<void>;
    onDelete: (boxId: number) => void;
    onUpdate: (box: Box) => void;
    onOpenOption: (box: Box) => void;
    onReorder: (boxId: number, targetIndex: number, boardType: 'EVENT') => Promise<void>;
}

export default function EventBoard({
    boxes, onStateChange, onDelete, onUpdate, onOpenOption, onReorder,
}: Props) {
    const {draggingId, overIndex, onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave} =
        useDragDrop(onReorder as any, 'EVENT');

    return (
        <div className="board-col event-col">
            <div className="col-header">
                <span className="col-label event">EVENT</span>
                <span className="col-count">{boxes.length}개</span>
            </div>
            <div className="boxes-list" onDrop={onDrop} onDragLeave={onDragLeave}>
                {boxes.map((box, index) => (
                    <React.Fragment key={box.boxId}>
                        {overIndex === index && draggingId !== box.boxId && (
                            <div
                                className="drop-zone"
                                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                            >
                                <i className="ti ti-arrow-down" aria-hidden="true"/>
                            </div>
                        )}
                        {draggingId !== box.boxId && (
                            <div
                                draggable
                                onDragStart={() => onDragStart(box.boxId, index)}
                                onDragOver={e => onDragOver(e, index)}
                                onDragEnd={onDragEnd}
                            >
                                <BoxCard
                                    box={box}
                                    onStateChange={onStateChange}
                                    onDelete={onDelete}
                                    onUpdate={onUpdate}
                                    onOpenOption={onOpenOption}
                                    isDragging={false}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
                {overIndex === boxes.length && draggingId !== null && (
                    <div
                        className="drop-zone"
                        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    >
                        <i className="ti ti-arrow-down" aria-hidden="true"/>
                    </div>
                )}
                {boxes.length === 0 && (
                    <div className="empty-board">
                        <i className="ti ti-calendar-event" aria-hidden="true"/>
                        <p>이벤트 박스가 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}
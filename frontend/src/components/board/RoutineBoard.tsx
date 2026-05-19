import React, {useState} from 'react';
import type {Box, BoxState, TabType} from '../../types';
import BoxCard from '../box/BoxCard';
import {useDragDrop} from '../../hooks/useDragDrop';

interface Props {
    boxes: Box[];
    onStateChange: (boxId: number, state: BoxState) => Promise<void>;
    onDelete: (boxId: number) => void;
    onUpdate: (box: Box) => void;
    onOpenOption: (box: Box) => void;
    onReorder: (boxId: number, targetIndex: number, boardType: 'ROUTINE') => Promise<void>;
}

export default function RoutineBoard({
                                         boxes, onStateChange, onDelete, onUpdate, onOpenOption, onReorder,
                                     }: Props) {
    const [tab, setTab] = useState<TabType>('ACTIVE');
    const {draggingId, overIndex, onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave} =
        useDragDrop(onReorder as any, 'ROUTINE');

    const filtered = tab === 'ALL' ? boxes
        : tab === 'DONE' ? boxes.filter(b => b.state === 'DONE')
            : boxes.filter(b => b.state !== 'DONE');

    return (
        <div className="board-col">
            <div className="col-header">
                <div className="col-header-top">
                    <span className="col-label routine">ROUTINE</span>
                    <span className="col-count">{filtered.length}개</span>
                </div>
                <div className="col-tabs">
                    {(['ALL', 'ACTIVE', 'DONE'] as TabType[]).map(t => (
                        <button
                            key={t}
                            className={`col-tab ${tab === t ? 'active' : ''}`}
                            onClick={() => setTab(t)}
                        >
                            {t === 'ALL' ? '전체' : t === 'ACTIVE' ? '할 일' : '완료'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="boxes-list" onDrop={onDrop} onDragLeave={onDragLeave}>
                {filtered.map((box, index) => (
                    <React.Fragment key={box.boxId}>
                        {overIndex === index && draggingId !== box.boxId && (
                            <div
                                className="drop-zone"
                                onDragOver={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
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
                {overIndex === filtered.length && draggingId !== null && (
                    <div
                        className="drop-zone"
                        onDragOver={e => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <i className="ti ti-arrow-down" aria-hidden="true"/>
                    </div>
                )}
                {filtered.length === 0 && (
                    <div className="empty-board">
                        <i className="ti ti-layout-list" aria-hidden="true"/>
                        <p>루틴 박스가 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}
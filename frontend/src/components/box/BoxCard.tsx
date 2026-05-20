import React, {useState} from 'react';
import {Box, BoxState} from '../../types';
import {boxApi, taskApi} from '../../api';

interface Props {
    box: Box;
    onStateChange: (boxId: number, state: BoxState) => Promise<void>;
    onDelete: (boxId: number) => void;
    onUpdate: (box: Box) => void;
    onOpenOption: (box: Box) => void;
    onReorderTask: (boxId: number, boxTaskId: number, targetIndex: number) => Promise<void>;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent<HTMLElement>) => void;
    onDragEnd: () => void;
    onTaskDragChange: (v: boolean, boxId: number) => void;
    taskDraggingBoxId: number | null;
    isDragging?: boolean;
}

function isExpired(expireTime: string | null): boolean {
    if (!expireTime) return false;
    const [h, m] = expireTime.split(':').map(Number);
    const now = new Date();
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

function getTaskStateClass(state: BoxState) {
    if (state === 'IN_PROGRESS') return 'prog';
    if (state === 'DONE') return 'done';
    return '';
}

export default function BoxCard({
                                    box, onStateChange, onDelete, onUpdate, onOpenOption,
                                    onReorderTask, onDragStart, onDragOver, onDragEnd, onTaskDragChange,
                                    taskDraggingBoxId, isDragging,
                                }: Props) {
    const [removing, setRemoving] = useState(false);
    const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const expired = isExpired(box.expireTime) && box.state !== 'DONE';

    // 현재 박스가 task 드래그의 주체인지 여부
    const isThisBoxTaskDragging = taskDraggingBoxId === box.boxId;

    const handleTaskToggle = async (e: React.MouseEvent, boxTaskId: number) => {
        e.stopPropagation();
        if (draggingTaskId !== null) return;
        await taskApi.done(boxTaskId);
        const updated = await boxApi.getById(box.boxId);
        const allDone = updated.tasks.every(t => t.isDone);
        if (allDone) {
            await onStateChange(box.boxId, 'DONE');
        } else {
            onUpdate(updated);
        }
    };

    const handleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await boxApi.patchOption(box.boxId, {
            bookmark: !box.bookmark,
            alarmType: box.alarmType,
            expireTime: box.expireTime,
        });
        const updated = await boxApi.getById(box.boxId);
        onUpdate(updated);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setRemoving(true);
        setTimeout(async () => {
            await boxApi.delete(box.boxId);
            onDelete(box.boxId);
        }, 300);
    };

    const handleTaskDragStart = (e: React.DragEvent, boxTaskId: number) => {
        e.stopPropagation();
        requestAnimationFrame(() => setDraggingTaskId(boxTaskId));
        onTaskDragChange(true, box.boxId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleTaskDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const ratio = (e.clientY - rect.top) / rect.height;
        const next = ratio < 0.5 ? idx : idx + 1;
        setDragOverIndex(prev => prev === next ? prev : next);
    };

    const handleTaskDragEnd = () => {
        setDraggingTaskId(null);
        setDragOverIndex(null);
        onTaskDragChange(false, box.boxId);
    };

    const handleTaskDrop = async (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        const id = draggingTaskId;
        setDraggingTaskId(null);
        setDragOverIndex(null);
        if (id === null) return;
        const currentIndex = box.tasks.findIndex(t => t.boxTaskId === id);
        if (currentIndex === targetIndex || currentIndex + 1 === targetIndex) return;
        await onReorderTask(box.boxId, id, targetIndex);
    };

    const renderTaskRow = (t: typeof box.tasks[0], idx: number) => {
        const isDraggingThis = t.boxTaskId === draggingTaskId;
        // 이 박스가 드래그 주체일 때만 drop-zone 표시
        const isDropTarget = isThisBoxTaskDragging && dragOverIndex === idx && !isDraggingThis;

        return (
            <React.Fragment key={t.boxTaskId}>
                {isDropTarget && (
                    <div
                        className="drop-zone task-drop-zone"
                        onDragOver={e => handleTaskDragOver(e, idx)}
                        onDrop={e => handleTaskDrop(e, idx)}
                    >
                        <i className="ti ti-arrow-down" aria-hidden="true"/>
                    </div>
                )}
                <div
                    className={['task-row', isDraggingThis ? 'task-dragging' : ''].filter(Boolean).join(' ')}
                    draggable
                    onDragStart={e => handleTaskDragStart(e, t.boxTaskId)}
                    onDragOver={e => handleTaskDragOver(e, idx)}
                    onDragEnd={handleTaskDragEnd}
                    onClick={e => handleTaskToggle(e, t.boxTaskId)}
                >
                    <div className={`task-check ${t.isDone ? 'done' : getTaskStateClass(box.state)}`}>
                        {t.isDone ? <i className="ti ti-check" aria-hidden="true"/> : null}
                    </div>
                    <span className={`task-txt ${t.isDone ? 'done' : ''}`}>{t.taskName}</span>
                </div>
            </React.Fragment>
        );
    };

    return (
        <div
            className={[
                'box-card',
                box.state === 'IN_PROGRESS' ? 'in-progress' : '',
                box.state === 'DONE' ? 'done-state' : '',
                expired ? 'expired' : '',
                isDragging ? 'dragging' : '',
                removing ? 'removing' : '',
                draggingTaskId !== null ? 'task-reordering' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onOpenOption(box)}
        >
            <div
                className="box-name-row"
                draggable
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                {box.tasks.length > 1 && (
                    <span className="box-name">[ {box.name} ]</span>
                )}
                {box.tasks.length === 1 && (
                    <>
                        <div
                            className="task-check-inline"
                            onClick={e => handleTaskToggle(e, box.tasks[0].boxTaskId)}
                        >
                            <div
                                className={`task-check ${box.tasks[0].isDone ? 'done' : getTaskStateClass(box.state)}`}>
                                {box.tasks[0].isDone ? <i className="ti ti-check" aria-hidden="true"/> : null}
                            </div>
                        </div>
                        <span
                            className={`box-single-task ${box.tasks[0].isDone ? 'done' : ''}`}
                            onClick={e => handleTaskToggle(e, box.tasks[0].boxTaskId)}
                        >
                            {box.tasks[0].taskName}
                        </span>
                    </>
                )}
                <div className="box-actions" onClick={e => e.stopPropagation()}>
                    <button
                        className={`act-btn ${box.alarmType !== 'NONE' ? 'alarmed' : ''}`}
                        title="알람 설정"
                        onClick={e => {
                            e.stopPropagation();
                            onOpenOption(box);
                        }}
                    >
                        <i className={`ti ${box.alarmType !== 'NONE' ? 'ti-bell-filled' : 'ti-bell'}`}
                           aria-hidden="true"/>
                    </button>
                    <button
                        className={`act-btn ${box.bookmark ? 'bookmarked' : ''}`}
                        title="즐겨찾기"
                        onClick={handleBookmark}
                    >
                        <i className={`ti ${box.bookmark ? 'ti-star-filled' : 'ti-star'}`} aria-hidden="true"/>
                    </button>
                    <button className="act-btn danger" title="삭제" onClick={handleDelete}>
                        <i className="ti ti-trash" aria-hidden="true"/>
                    </button>
                </div>
            </div>

            {box.tasks.length > 1 && (
                <>
                    {box.tasks.map((t, idx) => renderTaskRow(t, idx))}
                    {/* 맨 아래 tail drop-zone: 이 박스가 드래그 주체일 때만 표시 */}
                    {isThisBoxTaskDragging && dragOverIndex === box.tasks.length && draggingTaskId !== null && (
                        <div
                            className="drop-zone task-drop-zone"
                            onDragOver={e => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onDrop={e => handleTaskDrop(e, box.tasks.length)}
                        >
                            <i className="ti ti-arrow-down" aria-hidden="true"/>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
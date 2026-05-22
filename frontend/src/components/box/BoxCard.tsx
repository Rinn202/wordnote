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

const isExpired = (expireTime: string | null): boolean => {
    if (!expireTime) return false;
    const [h, m] = expireTime.split(':').map(Number);
    const now = new Date();
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
};

const getTaskStateClass = (state: BoxState) =>
    state === 'IN_PROGRESS' ? 'prog' : state === 'DONE' ? 'done' : '';

const cx = (...classes: (string | false | null | undefined)[]) =>
    classes.filter(Boolean).join(' ');

// task 1개일 때 단일 행 표시
function SingleTask({box, state, onToggle}: {
    box: Box;
    state: BoxState;
    onToggle: (e: React.MouseEvent, id: number) => void;
}) {
    const t = box.tasks[0];
    return (
        <div className="task-check-inline" onClick={e => onToggle(e, t.boxTaskId)}>
            <div className={`task-check ${t.isDone ? 'done' : getTaskStateClass(state)}`}>
                {t.isDone && <i className="ti ti-check" aria-hidden="true"/>}
            </div>
            <span className={`box-single-task ${t.isDone ? 'done' : ''}`}>{t.taskName}</span>
        </div>
    );
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
    const isThisBoxTaskDragging = taskDraggingBoxId === box.boxId;

    // 체크박스 낙관적 업데이트
    const handleTaskToggle = (e: React.MouseEvent, boxTaskId: number) => {
        e.stopPropagation();
        if (draggingTaskId !== null) return;

        const updatedTasks = box.tasks.map(t =>
            t.boxTaskId === boxTaskId ? {...t, isDone: !t.isDone} : t
        );
        const allDone = updatedTasks.every(t => t.isDone);

        const optimisticBox: Box = {
            ...box,
            tasks: updatedTasks,
            state: allDone ? 'DONE' : box.state
        };

        //API 비동기 처리
        onUpdate(optimisticBox);
        if (allDone && box.state !== 'DONE') {
            onStateChange(box.boxId, 'DONE');
        }

        // 전역 카운터 증가
        window.activeRequestsCount = (window.activeRequestsCount || 0) + 1;

        (async () => {
            const previousBox = box;
            try {
                await taskApi.done(boxTaskId);
                const serverUpdated = await boxApi.getById(box.boxId);

                onUpdate(serverUpdated);
                const serverAllDone = serverUpdated.tasks.every(t => t.isDone);
                if (serverAllDone && serverUpdated.state !== 'DONE') {
                    onStateChange(box.boxId, 'DONE');
                }
            } catch (error) {
                console.error("실패", error);
                onUpdate(previousBox);
            } finally {
                // 전역 카운터 감소
                window.activeRequestsCount = Math.max(0, (window.activeRequestsCount || 0) - 1);
            }
        })();
    };

    const handleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // 즐겨찾기
        const optimisticBox = {...box, bookmark: !box.bookmark};
        onUpdate(optimisticBox);

        try {
            await boxApi.patchOption(box.boxId, {
                bookmark: !box.bookmark,
                alarmType: box.alarmType,
                expireTime: box.expireTime,
            });
            onUpdate(await boxApi.getById(box.boxId));
        } catch (error) {
            onUpdate(box); // 롤백
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
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
        const next = (e.clientY - rect.top) / rect.height < 0.5 ? idx : idx + 1;
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
        const isDropTarget = isThisBoxTaskDragging && dragOverIndex === idx && !isDraggingThis;

        return (
            <React.Fragment key={t.boxTaskId}>
                {isDropTarget && (
                    <div className="drop-zone task-drop-zone"
                         onDragOver={e => handleTaskDragOver(e, idx)}
                         onDrop={e => handleTaskDrop(e, idx)}>
                        <i className="ti ti-arrow-down" aria-hidden="true"/>
                    </div>
                )}
                <div
                    className={cx('task-row', isDraggingThis && 'task-dragging')}
                    draggable
                    onDragStart={e => handleTaskDragStart(e, t.boxTaskId)}
                    onDragOver={e => handleTaskDragOver(e, idx)}
                    onDragEnd={handleTaskDragEnd}
                    onClick={e => handleTaskToggle(e, t.boxTaskId)}
                >
                    <div className={`task-check ${t.isDone ? 'done' : getTaskStateClass(box.state)}`}>
                        {t.isDone && <i className="ti ti-check" aria-hidden="true"/>}
                    </div>
                    <span className={`task-txt ${t.isDone ? 'done' : ''}`}>{t.taskName}</span>
                </div>
            </React.Fragment>
        );
    };

    return (
        <div
            className={cx(
                'box-card',
                box.state === 'IN_PROGRESS' && 'in-progress',
                box.state === 'DONE' && 'done-state',
                expired && 'expired',
                isDragging && 'dragging',
                removing && 'removing',
                draggingTaskId !== null && 'task-reordering',
            )}
            onClick={() => onOpenOption(box)}
        >
            <div className="box-name-row" draggable onDragStart={onDragStart} onDragOver={onDragOver}
                 onDragEnd={onDragEnd}>
                {box.tasks.length > 1
                    ? <span className="box-name">[ {box.name} ]</span>
                    : <SingleTask box={box} state={box.state} onToggle={handleTaskToggle}/>
                }
                <div className="box-actions" onClick={e => e.stopPropagation()}>
                    <button className={cx('act-btn', box.alarmType !== 'NONE' && 'alarmed')} title="알람 설정"
                            onClick={e => {
                                e.stopPropagation();
                                onOpenOption(box);
                            }}>
                        <i className={`ti ${box.alarmType !== 'NONE' ? 'ti-bell-filled' : 'ti-bell'}`}
                           aria-hidden="true"/>
                    </button>
                    <button className={cx('act-btn', box.bookmark && 'bookmarked')} title="즐겨찾기"
                            onClick={handleBookmark}>
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
                    {isThisBoxTaskDragging && dragOverIndex === box.tasks.length && draggingTaskId !== null && (
                        <div className="drop-zone task-drop-zone"
                             onDragOver={e => {
                                 e.preventDefault();
                                 e.stopPropagation();
                             }}
                             onDrop={e => handleTaskDrop(e, box.tasks.length)}>
                            <i className="ti ti-arrow-down" aria-hidden="true"/>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
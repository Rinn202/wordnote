import React, {useState} from 'react';
import {Box, BoxState} from '../../types';
import {boxApi, taskApi} from '../../api';

interface Props {
    box: Box;
    onStateChange: (boxId: number, state: BoxState) => Promise<void>;
    onDelete: (boxId: number) => void;
    onUpdate: (box: Box) => void;
    onOpenOption: (box: Box) => void;
    isDragging?: boolean;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const STATE_ORDER: BoxState[] = ['READY', 'IN_PROGRESS', 'DONE'];

function nextState(current: BoxState): BoxState {
    const i = STATE_ORDER.indexOf(current);
    return STATE_ORDER[(i + 1) % STATE_ORDER.length];
}

function isExpired(expireTime: string | null): boolean {
    if (!expireTime) return false;
    const [h, m] = expireTime.split(':').map(Number);
    const now = new Date();
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

export default function BoxCard({
    box, onStateChange, onDelete, onUpdate, onOpenOption, isDragging, dragHandleProps,
}: Props) {
    const [removing, setRemoving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const expired = isExpired(box.expireTime);
    const showName = box.tasks.length > 1;

    const handleStateClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const next = nextState(box.state);
        if (next === 'DONE') {
            setCompleting(true);
            await new Promise(res => setTimeout(res, 300));
            await onStateChange(box.boxId, next);
            return;
        }
        await onStateChange(box.boxId, next);
    };

    const handleTaskToggle = async (e: React.MouseEvent, boxTaskId: number) => {
        e.stopPropagation();
        await taskApi.done(boxTaskId);

        const remainingTasks = box.tasks.filter(t => t.boxTaskId !== boxTaskId && !t.isDone);
        if (remainingTasks.length === 0) {
            setCompleting(true);
            await new Promise(res => setTimeout(res, 300));
            onDelete(box.boxId);
        } else {
            const updated = await boxApi.getById(box.boxId);
            onUpdate(updated);
        }
    };

    const handleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = await boxApi.patchOption(box.boxId, {bookmark: !box.bookmark});
        onUpdate(updated as unknown as Box);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setRemoving(true);
        setTimeout(async () => {
            await boxApi.delete(box.boxId);
            onDelete(box.boxId);
        }, 300);
    };

    const stateLabel: Record<BoxState, string> = {
        READY: 'READY',
        IN_PROGRESS: 'IN PROG',
        DONE: 'DONE',
    };

    return (
        <div className={[
            'box-card',
            box.state === 'IN_PROGRESS' ? 'in-progress' : '',
            box.state === 'DONE' ? 'done-state' : '',
            expired ? 'expired' : '',
            isDragging ? 'dragging' : '',
            removing ? 'removing' : '',
            completing ? 'completing' : '',
        ].filter(Boolean).join(' ')}
            onClick={() => onOpenOption(box)}
        >
            <div className="box-grip" {...dragHandleProps} onClick={e => e.stopPropagation()}>
                <i className="ti ti-grip-vertical" aria-hidden="true"/>
            </div>
            <div className="box-body">
                {showName && <p className="box-name">{box.name}</p>}
                <div className="tasks-row">
                    {box.tasks.map(t => (
                        <span
                            key={t.boxTaskId}
                            className={`task-chip ${t.isDone ? 'done-task' : ''}`}
                            onClick={e => handleTaskToggle(e, t.boxTaskId)}
                        >
                            {t.taskName}
                        </span>
                    ))}
                </div>
            </div>
            <div className="box-actions" onClick={e => e.stopPropagation()}>
                <button
                    className={`act-btn ${box.alarmType !== 'NONE' ? 'alarmed' : ''}`}
                    title="알람"
                    onClick={() => onOpenOption(box)}
                >
                    <i className="ti ti-bell" aria-hidden="true"/>
                </button>
                <button
                    className={`act-btn ${box.bookmark ? 'bookmarked' : ''}`}
                    title="즐겨찾기"
                    onClick={handleBookmark}
                >
                    <i className={`ti ti-star${box.bookmark ? '-filled' : ''}`} aria-hidden="true"/>
                </button>
                <button className="act-btn danger" title="삭제" onClick={handleDelete}>
                    <i className="ti ti-trash" aria-hidden="true"/>
                </button>
                <button
                    className={`state-btn ${box.state === 'READY' ? 'ready' : box.state === 'IN_PROGRESS' ? 'in-progress' : 'done'}`}
                    onClick={handleStateClick}
                >
                    {stateLabel[box.state]}
                </button>
            </div>
        </div>
    );
}
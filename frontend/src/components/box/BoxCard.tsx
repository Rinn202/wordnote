import React, {useState} from 'react';
import {Box, BoxState} from '../../types';
import {boxApi, taskApi} from '../../api';

interface Props {
    box: Box;
    onStateChange: (boxId: number, state: BoxState) => Promise<void>; // ← 다시 추가
    onDelete: (boxId: number) => void;
    onUpdate: (box: Box) => void;
    onOpenOption: (box: Box) => void;
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
                                    box, onStateChange, onDelete, onUpdate, onOpenOption, isDragging,
                                }: Props) {
    const [removing, setRemoving] = useState(false);
    const [completing] = useState(false);
    const expired = isExpired(box.expireTime) && box.state !== 'DONE';

    /* 태스크 토글 */
    const handleTaskToggle = async (e: React.MouseEvent, boxTaskId: number) => {
        e.stopPropagation();
        await taskApi.done(boxTaskId);

        const updated = await boxApi.getById(box.boxId);
        const allDone = updated.tasks.every(t => t.isDone);

        if (allDone) {
            await onStateChange(box.boxId, 'DONE');
        } else {
            onUpdate(updated);
        }
    };

    /* 북마크 */
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

    /* 삭제 */
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setRemoving(true);
        setTimeout(async () => {
            await boxApi.delete(box.boxId);
            onDelete(box.boxId);
        }, 300);
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
                completing ? 'completing' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onOpenOption(box)}
        >

            <div className="box-name-row">
                {box.tasks.length > 1 && (
                    <span className="box-name">[ {box.name} ]</span>
                )}

                {box.tasks.length === 1 && (
                    <div className="task-check-inline" onClick={e => handleTaskToggle(e, box.tasks[0].boxTaskId)}>
                        <div className={`task-check ${box.tasks[0].isDone ? 'done' : getTaskStateClass(box.state)}`}>
                            {box.tasks[0].isDone ? (
                                <i className="ti ti-check" aria-hidden="true"/>
                            ) : null}
                        </div>
                    </div>
                )}

                {box.tasks.length === 1 && (
                    <span
                        className={`box-single-task ${box.tasks[0].isDone ? 'done' : ''}`}
                        onClick={e => handleTaskToggle(e, box.tasks[0].boxTaskId)}
                    >
                        {box.tasks[0].taskName}
                    </span>
                )}

                <div className="box-actions" onClick={e => e.stopPropagation()}>
                    <button
                        className={`act-btn ${box.alarmType !== 'NONE' ? 'alarmed' : ''}`}
                        title="알람 설정"
                        onClick={(e) => {
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
                    <button
                        className="act-btn danger"
                        title="삭제"
                        onClick={handleDelete}
                    >
                        <i className="ti ti-trash" aria-hidden="true"/>
                    </button>
                </div>
            </div>

            {/* 태스크 행 — 2개 이상일 때만 */}
            {box.tasks.length > 1 && box.tasks.map(t => (
                <div key={t.boxTaskId} className="task-row" onClick={e => handleTaskToggle(e, t.boxTaskId)}>
                    <div className={`task-check ${t.isDone ? 'done' : getTaskStateClass(box.state)}`}>
                        {t.isDone
                            ? <i className="ti ti-check" aria-hidden="true"/>
                            : null
                        }
                    </div>
                    <span className={`task-txt ${t.isDone ? 'done' : ''}`}>{t.taskName}</span>
                </div>
            ))}
        </div>
    );
}
import React, {useEffect, useState} from 'react';
import type {BoardType, Box, Task} from '../../types';
import {boxApi, taskApi} from '../../api';

interface Props {
    boardId: number;
    onBoxCreated: (box: Box) => void;
    usedTaskIds: number[];
}

export default function TaskPool({boardId, onBoxCreated, usedTaskIds}: Props) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [boxType, setBoxType] = useState<BoardType>('ROUTINE');
    const [boxName, setBoxName] = useState('');
    const [newTaskName, setNewTaskName] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editName, setEditName] = useState('');
    const [deleteWarning, setDeleteWarning] = useState(false);

    useEffect(() => {
        taskApi.getAll().then(setTasks).catch(console.error);
    }, []);

    const toggleTask = (id: number) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
        );
    };

    const selectedTask = selected.length === 1
        ? tasks.find(t => t.taskId === selected[0]) ?? null
        : null;
    const canEditDelete = selectedTask !== null && selectedTask.memberId !== null;

    const handleDelete = async () => {
        if (!selectedTask) return;
        if (isUsed) {
            setDeleteWarning(true);
            return;
        }
        setDeleteWarning(false);
        await taskApi.delete(selectedTask.taskId);
        setTasks(prev => prev.filter(t => t.taskId !== selectedTask.taskId));
        setSelected([]);
    };

    const handleEditConfirm = async () => {
        if (!editingTask || !editName.trim()) return;
        const updated = await taskApi.update(editingTask.taskId, editName.trim());
        setTasks(prev => prev.map(t => t.taskId === updated.taskId ? updated : t));
        setEditingTask(null);
        setEditName('');
    };

    const handleCreateBox = async () => {
        if (selected.length === 0) return;
        setLoading(true);
        try {
            const name = boxName.trim() || (selected.length === 1
                ? tasks.find(t => t.taskId === selected[0])?.name ?? 'Unnamed'
                : 'Unnamed');
            const box = await boxApi.create({boardId, name, boxType, taskIds: selected});
            onBoxCreated(box);
            setSelected([]);
            setBoxName('');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter' || !newTaskName.trim()) return;
        const task = await taskApi.create(newTaskName.trim());
        setTasks(prev => [...prev, task]);
        setNewTaskName('');
    };

    const defaultTasks = tasks.filter(t => t.memberId === null);
    const customTasks = tasks.filter(t => t.memberId !== null);

    const isUsed = selectedTask ? usedTaskIds.includes(selectedTask.taskId) : false;

    return (
        <div className="task-pool">
            <div className="task-pool-header">
                <div className="type-toggle">
                    {(['ROUTINE', 'EVENT'] as BoardType[]).map(t => (
                        <button
                            key={t}
                            className={`toggle-btn ${boxType === t ? 'active' : ''}`}
                            onClick={() => setBoxType(t)}
                        >
                            {t === 'ROUTINE' ? 'ROUTINE' : 'EVENT'}
                        </button>
                    ))}
                </div>

                {canEditDelete && (
                    <div style={{display: 'flex', gap: 4}}>
                        <button
                            className="act-btn"
                            onClick={() => {
                                setEditingTask(selectedTask);
                                setEditName(selectedTask.name);
                            }}
                            title="수정"
                        >
                            <i className="ti ti-pencil" aria-hidden="true"/>
                        </button>
                        <button
                            className="act-btn danger"
                            onClick={handleDelete}
                            title="삭제"
                        >
                            <i className="ti ti-trash" aria-hidden="true"/>
                        </button>

                    </div>
                )}
            </div>

            {editingTask && (
                <div style={{display: 'flex', gap: 6, marginBottom: 8}}>
                    <input
                        className="box-name-input"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleEditConfirm()}
                        autoFocus
                    />
                    <button className="act-btn" onClick={handleEditConfirm}>
                        <i className="ti ti-check" aria-hidden="true"/>
                    </button>
                    <button className="act-btn" onClick={() => setEditingTask(null)}>
                        <i className="ti ti-x" aria-hidden="true"/>
                    </button>
                </div>
            )}

            <div className="task-grid">
                {defaultTasks.map(t => (
                    <button
                        key={t.taskId}
                        className={['task-item', boxType === 'EVENT' ? 'event-type' : '', selected.includes(t.taskId) ? 'selected' : ''].filter(Boolean).join(' ')}
                        onClick={() => toggleTask(t.taskId)}
                    >
                        {t.name}
                    </button>
                ))}

                {customTasks.length > 0 && (
                    <div style={{width: '100%', borderTop: '1px dashed var(--border2)', margin: '4px 0'}}/>
                )}

                {customTasks.map(t => (
                    <button
                        key={t.taskId}
                        className={['task-item', boxType === 'EVENT' ? 'event-type' : '', selected.includes(t.taskId) ? 'selected' : ''].filter(Boolean).join(' ')}
                        onClick={() => toggleTask(t.taskId)}
                    >
                        {t.name}
                    </button>
                ))}

                <input
                    className="task-new-input"
                    placeholder="+ 새 태스크 입력 후 Enter"
                    value={newTaskName}
                    onChange={e => setNewTaskName(e.target.value)}
                    onKeyDown={handleAddTask}
                />
            </div>

            {selected.length > 0 && (
                <div className="create-row">
                    <input
                        className="box-name-input"
                        placeholder={
                            selected.length === 1
                                ? tasks.find(t => t.taskId === selected[0])?.name ?? '박스 이름 입력'
                                : '박스 이름 입력'
                        }
                        value={boxName}
                        onChange={e => setBoxName(e.target.value)}
                    />
                    <button className="create-box-btn" onClick={handleCreateBox} disabled={loading}>
                        <i className="ti ti-plus" aria-hidden="true"/>
                        add box
                    </button>

                    {deleteWarning && isUsed && selectedTask?.memberId !== null && (
                        <div style={{
                            fontSize: 12, color: 'var(--danger)',
                            padding: '6px 8px', marginTop: 4, fontFamily: 'GowunBatang, serif', lineHeight: 1.5,
                        }}>
                            사용 중인 태스크는 삭제할 수 없습니다.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
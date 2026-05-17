import React, {useEffect, useState} from 'react';
import type {BoardType, Box, Task} from '../../types';
import {boxApi, taskApi} from '../../api';

interface Props {
    boardId: number;
    onBoxCreated: (box: Box) => void;
}

export default function TaskPool({boardId, onBoxCreated}: Props) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [boxType, setBoxType] = useState<BoardType>('ROUTINE');
    const [boxName, setBoxName] = useState('');
    const [newTaskName, setNewTaskName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        taskApi.getAll().then(setTasks).catch(console.error);
    }, []);

    const toggleTask = (id: number) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
        );
    };

    const handleCreateBox = async () => {
        if (selected.length === 0) return;
        setLoading(true);
        try {
            const name = boxName.trim() || (selected.length === 1
                ? tasks.find(t => t.taskId === selected[0])?.name ?? 'Unnamed'
                : 'Unnamed');
            const box = await boxApi.create({
                boardId,
                name,
                boxType,
                taskIds: selected,
            });
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
                            {t === 'ROUTINE' ? '루틴' : '이벤트'}
                        </button>
                    ))}
                </div>
                <span className="pool-label">태스크 선택 후 박스 생성</span>
            </div>

            <div className="task-grid">
                {tasks.map(t => (
                    <button
                        key={t.taskId}
                        className={[
                            'task-item',
                            boxType === 'EVENT' ? 'event-type' : '',
                            selected.includes(t.taskId) ? 'selected' : '',
                        ].filter(Boolean).join(' ')}
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
                                ? '박스 이름 (비워두면 태스크명 사용)'
                                : '박스 이름 입력'
                        }
                        value={boxName}
                        onChange={e => setBoxName(e.target.value)}
                    />
                    <button
                        className="create-box-btn"
                        onClick={handleCreateBox}
                        disabled={loading}
                    >
                        <i className="ti ti-plus" aria-hidden="true"/>
                        박스 생성
                    </button>
                </div>
            )}
        </div>
    );
}
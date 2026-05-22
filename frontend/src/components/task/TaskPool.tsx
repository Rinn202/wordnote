import {type KeyboardEvent, useEffect, useRef, useState} from 'react';
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
    const [newTaskForm, setNewTaskForm] = useState({name: '', info: ''});
    const [loading, setLoading] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editName, setEditName] = useState('');
    const [deleteWarning, setDeleteWarning] = useState(false);
    const [openCats, setOpenCats] = useState<Set<string>>(new Set());

    const infoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        taskApi.getAll().then(setTasks).catch(console.error);
    }, []);

    const toggleTask = (id: number) =>
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const selectedTask = selected.length === 1 ? tasks.find(t => t.taskId === selected[0]) ?? null : null;
    const canEditDelete = selectedTask !== null && selectedTask.memberId !== null;
    const isUsed = selectedTask ? usedTaskIds.includes(selectedTask.taskId) : false;

    const taskClass = (t: Task) =>
        ['task-item', boxType === 'EVENT' ? 'event-type' : '', selected.includes(t.taskId) ? 'selected' : '']
            .filter(Boolean).join(' ');

    const handleDelete = async () => {
        if (!selectedTask) return;
        if (isUsed) {
            setDeleteWarning(true);
            return;
        }
        setDeleteWarning(false);

        const previousTasks = [...tasks];
        const previousSelected = [...selected];

        setTasks(prev => prev.filter(t => t.taskId !== selectedTask.taskId));
        setSelected([]);

        try {
            await taskApi.delete(selectedTask.taskId);
        } catch (error) {
            console.error(error);
            setTasks(previousTasks);
            setSelected(previousSelected);
            alert('태스크 삭제에 실패했습니다.');
        }
    };

    const handleEditConfirm = async () => {
        if (!editingTask || !editName.trim()) return;

        const targetId = editingTask.taskId;
        const nextName = editName.trim();
        const previousTasks = [...tasks];

        setTasks(prev => prev.map(t => t.taskId === targetId ? {...t, name: nextName} : t));
        setEditingTask(null);
        setEditName('');

        try {
            await taskApi.update(targetId, nextName);
        } catch (error) {
            console.error(error);
            setTasks(previousTasks);
            alert('태스크 수정에 실패했습니다.');
        }
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

    const handleAddTask = async () => {
        if (!newTaskForm.name.trim()) return;

        try {
            const task = await taskApi.create(
                newTaskForm.name.trim(),
                '커스텀',
                newTaskForm.info.trim() || undefined
            );

            const safeTask: Task = {
                ...task,
                info: task.info ?? null
            };

            setTasks(prev => [...prev, safeTask]);
            setNewTaskForm({name: '', info: ''});
            setOpenCats(prev => new Set([...prev, 'custom']));

        } catch (error) {
            console.error('태스크 생성 중 에러 발생:', error);
            alert('태스크 생성에 실패했습니다.');
        }
    };

    const handleNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter' || !newTaskForm.name.trim()) return;
        infoRef.current?.focus();
    };

    const handleInfoKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        handleAddTask();
    };

    const toggleCat = (cat: string) =>
        setOpenCats(prev => {
            if (prev.has(cat)) return new Set();
            return new Set([cat]);
        });

    const normalizeCategory = (cat: string) => cat.replace(/_상세$/, '');

    const grouped = tasks.reduce<Record<string, { main: Task[], sub: Task[] }>>((acc, t) => {
        const raw = t.category ?? 'custom';
        const parent = normalizeCategory(raw);
        const isSub = raw.endsWith('_상세');
        acc[parent] ??= {main: [], sub: []};
        (isSub ? acc[parent].sub : acc[parent].main).push(t);
        return acc;
    }, {});

    return (
        <div className="task-pool">
            <div className="task-pool-header">
                <div className="type-toggle">
                    {(['ROUTINE', 'EVENT'] as BoardType[]).map(t => (
                        <button key={t} className={`toggle-btn ${boxType === t ? 'active' : ''}`}
                                onClick={() => setBoxType(t)}>
                            {t}
                        </button>
                    ))}
                </div>

                {canEditDelete && (
                    <div style={{display: 'flex', gap: 4}}>
                        <button className="act-btn" onClick={() => {
                            setEditingTask(selectedTask);
                            setEditName(selectedTask!.name);
                        }} title="수정">
                            <i className="ti ti-pencil" aria-hidden="true"/>
                        </button>
                        <button className="act-btn danger" onClick={handleDelete} title="삭제">
                            <i className="ti ti-trash" aria-hidden="true"/>
                        </button>
                    </div>
                )}
            </div>

            <div className="task-new-form">
                <input
                    className="task-new-input"
                    placeholder="+ 태스크 이름 (Enter로 다음 단계)"
                    value={newTaskForm.name}
                    onChange={e => setNewTaskForm(p => ({...p, name: e.target.value}))}
                    onKeyDown={handleNameKeyDown}
                />
                <input
                    ref={infoRef}
                    className="task-new-input"
                    placeholder="상세설명 입력 후 Enter로 추가 (선택)"
                    value={newTaskForm.info}
                    onChange={e => setNewTaskForm(p => ({...p, info: e.target.value}))}
                    onKeyDown={handleInfoKeyDown}
                />
            </div>

            {selected.length > 0 && (
                <div className="create-row">
                    <input
                        className="box-name-input"
                        placeholder={selected.length === 1 ? tasks.find(t => t.taskId === selected[0])?.name ?? '박스 이름 입력' : '박스 이름 입력'}
                        value={boxName}
                        onChange={e => setBoxName(e.target.value)}
                    />
                    <button className="create-box-btn" onClick={handleCreateBox} disabled={loading}>
                        <i className="ti ti-plus" aria-hidden="true"/> add box
                    </button>

                    {deleteWarning && isUsed && (
                        <div style={{
                            fontSize: 12,
                            color: 'var(--danger)',
                            padding: '6px 8px',
                            marginTop: 4,
                            fontFamily: 'GowunBatang, serif',
                            lineHeight: 1.5
                        }}>
                            사용 중인 태스크는 삭제할 수 없습니다.
                        </div>
                    )}
                </div>
            )}

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

            <div className="task-group-list">
                {Object.entries(grouped).map(([cat, items]) => (
                    <div key={cat} className="task-group">
                        <button className="task-group-header" onClick={() => toggleCat(cat)}>
                            <i className={`ti ${openCats.has(cat) ? 'ti-chevron-down' : 'ti-chevron-right'}`}/>
                            {cat}
                            <span className="task-group-count">{items.main.length + items.sub.length}</span>
                        </button>
                        {openCats.has(cat) && (
                            <div className="task-grid">
                                {items.main.map(t => (
                                    <button key={t.taskId} className={taskClass(t)}
                                            onClick={() => toggleTask(t.taskId)}
                                            title={t.info ?? undefined}>
                                        {t.name}
                                    </button>
                                ))}
                                {items.sub.length > 0 && (
                                    <>
                                        <div className="task-group-divider"/>
                                        {items.sub.map(t => (
                                            <button key={t.taskId} className={taskClass(t)}
                                                    onClick={() => toggleTask(t.taskId)}
                                                    title={t.info ?? undefined}>
                                                {t.name}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedTask?.info && (
                <div className="task-info-box">
                    <i className="ti ti-info-circle" aria-hidden="true"/>
                    {selectedTask.info}
                </div>
            )}
        </div>
    );
}
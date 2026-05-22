import { useEffect, useState } from 'react';
import { noticeApi } from '../api/notice';
import { taskApi } from '../api/task';
import type { Notice, Task } from '../types';
import ConfirmModal from '../components/common/ConfirmModal';
import '../styles/admin-page.css';

type Tab = 'notice' | 'task';
type Mode = 'view' | 'create' | 'edit';

const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'notice', icon: 'ti-speakerphone', label: '공지사항' },
    { key: 'task',   icon: 'ti-checklist',    label: '태스크 관리' },
];

export default function AdminPage() {
    const [tab, setTab] = useState<Tab>('notice');
    const isAdmin = localStorage.getItem('role') === 'ADMIN';

    // ── 공지 상태 ──
    const [notices, setNotices] = useState<Notice[]>([]);
    const [selected, setSelected] = useState<Notice | null>(null);
    const [mode, setMode] = useState<Mode>('view');
    const [form, setForm] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    // ── 태스크 상태 ──
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskMode, setTaskMode] = useState<Mode>('view');
    const [taskForm, setTaskForm] = useState({ name: '', category: '' });
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskLoading, setTaskLoading] = useState(false);
    const [taskLoaded, setTaskLoaded] = useState(false);
    const [taskDeleteTarget, setTaskDeleteTarget] = useState<number | null>(null);

    useEffect(() => {
        noticeApi.getAll().then(setNotices).catch(console.error);
    }, []);

    useEffect(() => {
        if (tab === 'task' && !taskLoaded) {
            taskApi.getAll()
                .then(setTasks)
                .catch(console.error)
                .finally(() => setTaskLoaded(true));
        }
    }, [tab, taskLoaded]);

    // ── 공지 핸들러 ──
    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        setLoading(true);
        try {
            if (mode === 'create') {
                const created = await noticeApi.create(form);
                setNotices(prev => [created, ...prev]);
                setSelected(created);
            } else if (mode === 'edit' && selected) {
                const updated = await noticeApi.update(selected.noticeId, form);
                setNotices(prev => prev.map(n => n.noticeId === updated.noticeId ? updated : n));
                setSelected(updated);
            }
            setMode('view');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (deleteTarget === null) return;
        await noticeApi.delete(deleteTarget);
        setNotices(prev => prev.filter(n => n.noticeId !== deleteTarget));
        if (selected?.noticeId === deleteTarget) setSelected(null);
        setDeleteTarget(null);
        setMode('view');
    };

    // ── 태스크 핸들러 ──
    const handleTaskCreate = async () => {
        if (!taskForm.name.trim()) return;
        setTaskLoading(true);
        try {
            const created = await taskApi.create(taskForm.name, taskForm.category || undefined);
            setTasks(prev => [created, ...prev]);
            setSelectedTask(created);
            setTaskForm({ name: '', category: '' });
            setTaskMode('view');
        } finally {
            setTaskLoading(false);
        }
    };

    const handleTaskEdit = async () => {
        if (!editingTask?.name.trim()) return;
        setTaskLoading(true);
        try {
            const updated = await taskApi.update(editingTask.taskId, editingTask.name, editingTask.category ?? undefined);
            setTasks(prev => prev.map(t => t.taskId === updated.taskId ? updated : t));
            setSelectedTask(updated);
            setEditingTask(null);
            setTaskMode('view');
        } finally {
            setTaskLoading(false);
        }
    };

    const handleTaskDelete = async () => {
        if (taskDeleteTarget === null) return;
        await taskApi.delete(taskDeleteTarget);
        setTasks(prev => prev.filter(t => t.taskId !== taskDeleteTarget));
        if (selectedTask?.taskId === taskDeleteTarget) setSelectedTask(null);
        setTaskDeleteTarget(null);
        setTaskMode('view');
    };

    // ── edit 모드 input 헬퍼 ──
    const taskVal = (field: 'name' | 'category') =>
        taskMode === 'edit' ? editingTask?.[field] ?? '' : taskForm[field];

    const taskChange = (field: 'name' | 'category') => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (taskMode === 'edit') setEditingTask(prev => prev ? { ...prev, [field]: e.target.value } : prev);
        else setTaskForm(p => ({ ...p, [field]: e.target.value }));
    };

    return (
        <div className="notice-page">

            {/* ── 좌측 사이드바 ── */}
            <aside className="notice-list-panel">
                <div className="notice-list-header">
                    <span className="notice-list-title">관리자 페이지</span>
                    <button className="icon-btn" title="돌아가기" onClick={() => window.history.back()}>
                        <i className="ti ti-arrow-left" aria-hidden="true" />
                    </button>
                </div>
                <div className="admin-tab-list">
                    {TABS.map(({ key, icon, label }) => (
                        <button
                            key={key}
                            className={`admin-tab-item ${tab === key ? 'active' : ''}`}
                            onClick={() => setTab(key)}
                        >
                            <i className={`ti ${icon}`} aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>
            </aside>

            {/* ── 공지사항 탭 ── */}
            {tab === 'notice' && (
                <div className="admin-content-area">
                    <div className="admin-sub-panel">
                        <div className="notice-list-header">
                            <span className="notice-list-title">공지사항</span>
                            {isAdmin && (
                                <button className="icon-btn" title="새 공지 작성"
                                    onClick={() => { setSelected(null); setForm({ title: '', content: '' }); setMode('create'); }}>
                                    <i className="ti ti-plus" aria-hidden="true" />
                                </button>
                            )}
                        </div>
                        <div className="notice-table-header">
                            <span className="notice-col-title">제목</span>
                            <span className="notice-col-date">날짜</span>
                        </div>
                        <div className="notice-table-body">
                            {notices.length === 0
                                ? <div className="notice-empty">공지사항이 없습니다.</div>
                                : notices.map(n => (
                                    <button key={n.noticeId}
                                        className={`notice-table-row ${selected?.noticeId === n.noticeId ? 'active' : ''}`}
                                        onClick={() => { setSelected(n); setMode('view'); }}
                                    >
                                        <span className="notice-col-title">{n.title}</span>
                                        <span className="notice-col-date">{n.createdAt?.slice(0, 10)}</span>
                                    </button>
                                ))
                            }
                        </div>
                    </div>

                    <main className="notice-detail-panel">
                        {(mode === 'create' || mode === 'edit') && (
                            <div className="notice-form">
                                <div className="notice-form-header">
                                    <span>{mode === 'create' ? '새 공지 작성' : '공지 수정'}</span>
                                    <div className="notice-form-header-actions">
                                        <button className="icon-btn" title="저장" onClick={handleSubmit}
                                            disabled={loading || !form.title.trim() || !form.content.trim()}>
                                            <i className="ti ti-check" aria-hidden="true" />
                                        </button>
                                        <button className="icon-btn" title="닫기" onClick={() => setMode('view')}>
                                            <i className="ti ti-x" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                                <input className="notice-input" placeholder="제목" value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                                <textarea className="notice-textarea" placeholder="내용" value={form.content}
                                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
                            </div>
                        )}

                        {mode === 'view' && selected && (
                            <div className="notice-detail">
                                <div className="notice-detail-header">
                                    <h2 className="notice-detail-title">{selected.title}</h2>
                                    <span className="notice-detail-date">{selected.createdAt?.slice(0, 10)}</span>
                                </div>
                                <div className="notice-detail-body">{selected.content}</div>
                                {isAdmin && (
                                    <div className="notice-detail-actions">
                                        <button className="icon-btn" title="수정"
                                            onClick={() => { setForm({ title: selected.title, content: selected.content }); setMode('edit'); }}>
                                            <i className="ti ti-pencil" aria-hidden="true" />
                                        </button>
                                        <button className="icon-btn danger" title="삭제"
                                            onClick={() => setDeleteTarget(selected.noticeId)}>
                                            <i className="ti ti-trash" aria-hidden="true" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {mode === 'view' && !selected && (
                            <div className="notice-placeholder">
                                <i className="ti ti-speakerphone" aria-hidden="true" />
                                <span>공지를 선택해주세요</span>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {/* ── 태스크 탭 ── */}
            {tab === 'task' && (
                <div className="admin-content-area">
                    <div className="admin-sub-panel">
                        <div className="notice-list-header">
                            <span className="notice-list-title">태스크 관리</span>
                            <button className="icon-btn" title="새 태스크 추가"
                                onClick={() => { setSelectedTask(null); setTaskForm({ name: '', category: '' }); setTaskMode('create'); }}>
                                <i className="ti ti-plus" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="notice-table-header">
                            <span className="notice-col-title">태스크명</span>
                            <span className="notice-col-date">카테고리</span>
                        </div>
                        <div className="notice-table-body">
                            {tasks.length === 0
                                ? <div className="notice-empty">태스크가 없습니다.</div>
                                : tasks.map(t => (
                                    <button key={t.taskId}
                                        className={`notice-table-row ${selectedTask?.taskId === t.taskId ? 'active' : ''}`}
                                        onClick={() => { setSelectedTask(t); setTaskMode('view'); }}
                                    >
                                        <span className="notice-col-title">{t.name}</span>
                                        <span className="notice-col-date">{t.category ?? '기타'}</span>
                                    </button>
                                ))
                            }
                        </div>
                    </div>

                    <main className="notice-detail-panel">
                        {(taskMode === 'create' || taskMode === 'edit') && (
                            <div className="notice-form">
                                <div className="notice-form-header">
                                    <span>{taskMode === 'create' ? '새 태스크 추가' : '태스크 수정'}</span>
                                    <div className="notice-form-header-actions">
                                        <button className="icon-btn" title="저장" disabled={taskLoading}
                                            onClick={taskMode === 'create' ? handleTaskCreate : handleTaskEdit}>
                                            <i className="ti ti-check" aria-hidden="true" />
                                        </button>
                                        <button className="icon-btn" title="닫기" onClick={() => setTaskMode('view')}>
                                            <i className="ti ti-x" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                                <input className="notice-input" placeholder="태스크 이름"
                                    value={taskVal('name')} onChange={taskChange('name')} />
                                <input className="notice-input" placeholder="카테고리 (선택)"
                                    value={taskVal('category')} onChange={taskChange('category')} />
                            </div>
                        )}

                        {taskMode === 'view' && selectedTask && (
                            <div className="notice-detail">
                                <div className="notice-detail-header">
                                    <h2 className="notice-detail-title">{selectedTask.name}</h2>
                                    <span className="notice-detail-date">{selectedTask.category ?? '기타'}</span>
                                </div>
                                <div className="notice-detail-actions">
                                    <button className="icon-btn" title="수정"
                                        onClick={() => { setEditingTask(selectedTask); setTaskMode('edit'); }}>
                                        <i className="ti ti-pencil" aria-hidden="true" />
                                    </button>
                                    <button className="icon-btn danger" title="삭제"
                                        onClick={() => setTaskDeleteTarget(selectedTask.taskId)}>
                                        <i className="ti ti-trash" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {taskMode === 'view' && !selectedTask && (
                            <div className="notice-placeholder">
                                <i className="ti ti-checklist" aria-hidden="true" />
                                <span>태스크를 선택해주세요</span>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {/* ── 삭제 확인 모달 ── */}
            <ConfirmModal
                open={deleteTarget !== null}
                message="공지를 삭제할까요? 삭제하면 복구할 수 없습니다."
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
            <ConfirmModal
                open={taskDeleteTarget !== null}
                message="태스크를 삭제할까요? 삭제하면 복구할 수 없습니다."
                onConfirm={handleTaskDelete}
                onCancel={() => setTaskDeleteTarget(null)}
            />
        </div>
    );
}
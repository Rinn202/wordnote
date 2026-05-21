import { useEffect, useState } from 'react';
import { noticeApi } from '../api/noticeApi';
import type { Notice } from '../types';
import '../styles/noticePage.css';

export default function noticePage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [selected, setSelected] = useState<Notice | null>(null);
    const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
    const [form, setForm] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const isAdmin = localStorage.getItem('role') === 'ADMIN';

    useEffect(() => {
        noticeApi.getAll().then(setNotices).catch(console.error);
    }, []);

    const handleSelect = (notice: Notice) => {
        setSelected(notice);
        setMode('view');
    };

    const handleCreate = () => {
        setSelected(null);
        setForm({ title: '', content: '' });
        setMode('create');
    };

    const handleEdit = (notice: Notice) => {
        setForm({ title: notice.title, content: notice.content });
        setMode('edit');
    };

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

    return (
        <div className="notice-page">
            {/* 좌측 목록 */}
            <aside className="notice-list-panel">
                <div className="notice-list-header">
                    <span className="notice-list-title">공지사항</span>
                    {isAdmin && (
                        <button className="icon-btn" title="새 공지 작성" onClick={handleCreate}>
                            <i className="ti ti-plus" aria-hidden="true" />
                        </button>
                    )}
                </div>

                <div className="notice-list">
                    {notices.length === 0 && (
                        <div className="notice-empty">공지사항이 없습니다.</div>
                    )}
                    {notices.map(n => (
                        <button
                            key={n.noticeId}
                            className={`notice-item ${selected?.noticeId === n.noticeId ? 'active' : ''}`}
                            onClick={() => handleSelect(n)}
                        >
                            <span className="notice-item-title">{n.title}</span>
                            <span className="notice-item-date">
                                {n.createdAt?.slice(0, 10)}
                            </span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* 우측 본문 */}
            <main className="notice-detail-panel">
                {/* 작성/수정 폼 */}
                {(mode === 'create' || mode === 'edit') && (
                    <div className="notice-form">
                        <div className="notice-form-header">
                            <span>{mode === 'create' ? '새 공지 작성' : '공지 수정'}</span>
                            <button className="icon-btn" onClick={() => setMode('view')}>
                                <i className="ti ti-x" aria-hidden="true" />
                            </button>
                        </div>
                        <input
                            className="notice-input"
                            placeholder="제목"
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        />
                        <textarea
                            className="notice-textarea"
                            placeholder="내용"
                            value={form.content}
                            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                        />
                        <div className="notice-form-actions">
                            <button
                                className="create-box-btn"
                                onClick={handleSubmit}
                                disabled={loading || !form.title.trim() || !form.content.trim()}
                            >
                                <i className="ti ti-check" aria-hidden="true" />
                                {mode === 'create' ? '등록' : '저장'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 상세 보기 */}
                {mode === 'view' && selected && (
                    <div className="notice-detail">
                        <div className="notice-detail-header">
                            <h2 className="notice-detail-title">{selected.title}</h2>
                            <span className="notice-detail-date">
                                {selected.createdAt?.slice(0, 10)}
                            </span>
                        </div>
                        <div className="notice-detail-body">{selected.content}</div>

                        {isAdmin && (
                            <div className="notice-detail-actions">
                                <button className="notice-btn" onClick={() => handleEdit(selected)}>
                                    <i className="ti ti-pencil" aria-hidden="true" />
                                    수정
                                </button>
                                <button
                                    className="notice-btn danger"
                                    onClick={() => setDeleteTarget(selected.noticeId)}
                                >
                                    <i className="ti ti-trash" aria-hidden="true" />
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 빈 상태 */}
                {mode === 'view' && !selected && (
                    <div className="notice-placeholder">
                        <i className="ti ti-speakerphone" aria-hidden="true" />
                        <span>공지를 선택해주세요</span>
                    </div>
                )}
            </main>

            {/* 삭제 확인 모달 */}

{deleteTarget !== null && (
    <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
        <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">공지를 삭제할까요?</div>
            <div className="modal-desc">삭제하면 복구할 수 없습니다.</div>
            <div className="modal-actions">
                <button className="notice-btn" onClick={() => setDeleteTarget(null)}>취소</button>
                <button className="notice-btn danger" onClick={handleDelete}>삭제</button>
            </div>
        </div>
    </div>
)}
        </div>
    );
}
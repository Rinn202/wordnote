import React, {useCallback, useEffect, useRef, useState} from 'react';
import axios, {AxiosInstance} from 'axios';
import ClockOwl from '../components/ClockOwl';

// ─── 타입 정의 ─────────────────────────────────────────────────────────────────
type BoxState = 'READY' | 'IN_PROGRESS' | 'DONE';
type BoxType = 'ROUTINE' | 'EVENT';
type AlarmType = 'NONE' | 'AT_TIME' | 'TEN_MINUTES_BEFORE' | 'THIRTY_MINUTES_BEFORE' | 'ONE_HOUR_BEFORE';
type TabType = 'TODO' | 'DONE';

interface Task {
    taskId: number;
    name: string;
}

interface BoxTask {
    taskId: number;
    taskName?: string;
    name?: string;
}

interface Box {
    boxId: number;
    name: string;
    state: BoxState;
    boxType: BoxType;
    type?: BoxType;
    bookmark: boolean;
    alarmType: AlarmType;
    expireTime: string | null;
    taskIds?: number[];
    tasks?: BoxTask[];
    taskList?: BoxTask[];
}

interface Board {
    boardId: number;
    boxes?: Box[];
}

interface BoxOption {
    bookmark: boolean;
    alarmType: AlarmType;
    expireTime: string | null;
}

interface NormalizedTask {
    id: number;
    name: string;
}

interface ConfirmState {
    message: string;
    onConfirm: () => void;
}

// ─── API 설정 ──────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const api: AxiosInstance = axios.create({baseURL: API_BASE});
api.interceptors.request.use(cfg => {
    const t = localStorage.getItem('accessToken');
    if (t && cfg.headers) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});

// ─── 상수 ──────────────────────────────────────────────────────────────────────
const NEXT_STATE: Record<BoxState, BoxState> = {
    READY: 'IN_PROGRESS',
    IN_PROGRESS: 'DONE',
    DONE: 'READY',
};

const STATE_LABEL: Record<BoxState, string> = {
    READY: '대기',
    IN_PROGRESS: '진행',
    DONE: '완료',
};

interface BoxColors {
    bg: string;
    border: string;
    chip: string;
    chipText: string;
}

const BOX_COLORS: Record<BoxState, BoxColors> = {
    READY: {bg: '#f8fafc', border: '#e2e8f0', chip: '#e2e8f0', chipText: '#475569'},
    IN_PROGRESS: {bg: '#fffbeb', border: '#fde68a', chip: '#fde68a', chipText: '#92400e'},
    DONE: {bg: '#f0fdf4', border: '#bbf7d0', chip: '#bbf7d0', chipText: '#166534'},
};

// ─── 유틸 ──────────────────────────────────────────────────────────────────────
const isExpired = (expireTime: string | null): boolean => {
    if (!expireTime) return false;
    const [h, m] = expireTime.split(':').map(Number);
    const exp = new Date();
    exp.setHours(h, m, 0, 0);
    return new Date() > exp;
};

const getBoxTasks = (box: Box, taskPool: Task[]): NormalizedTask[] => {
    if (box.tasks?.length)
        return box.tasks.map(t => ({id: t.taskId, name: t.taskName ?? t.name ?? ''}));
    if (box.taskList?.length)
        return box.taskList.map(t => ({id: t.taskId, name: t.taskName ?? t.name ?? ''}));
    if (box.taskIds?.length)
        return box.taskIds.map(id => {
            const found = taskPool.find(t => t.taskId === id);
            return {id, name: found ? found.name : `#${id}`};
        });
    return [];
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    width?: number;
}

function Modal({open, onClose, title, children, width = 420}: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const fn = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
                zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 18, padding: '26px 28px',
                    width, maxWidth: '92vw', boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
                }}
            >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
                    <h3 style={{margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a'}}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: 20,
                            color: '#94a3b8',
                            lineHeight: 1
                        }}
                    >✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─── BoxOptionPanel ────────────────────────────────────────────────────────────
interface BoxOptionPanelProps {
    box: Box;
    onClose: () => void;
    onSave: (boxId: number, opts: BoxOption) => void;
}

function BoxOptionPanel({box, onClose, onSave}: BoxOptionPanelProps) {
    const [bookmark, setBookmark] = useState<boolean>(box.bookmark ?? false);
    const [alarmType, setAlarmType] = useState<AlarmType>(box.alarmType ?? 'NONE');
    const [expireTime, setExpireTime] = useState<string>(box.expireTime ?? '');

    const save = () => {
        onSave(box.boxId, {bookmark, alarmType, expireTime: expireTime || null});
        onClose();
    };

    interface AlarmBtnProps {
        id: AlarmType;
        label: string;
    }

    const Btn = ({id, label}: AlarmBtnProps) => (
        <button
            onClick={() => setAlarmType(id)}
            style={{
                fontSize: 12, padding: '5px 11px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${alarmType === id ? '#f97316' : '#e2e8f0'}`,
                background: alarmType === id ? '#fff7ed' : '#f8fafc',
                color: alarmType === id ? '#f97316' : '#64748b',
                fontWeight: alarmType === id ? 700 : 400,
            }}
        >{label}</button>
    );

    return (
        <Modal open onClose={onClose} title="⚙️ 박스 옵션">
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <label style={{display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14}}>
                    <input
                        type="checkbox" checked={bookmark}
                        onChange={e => setBookmark(e.target.checked)}
                        style={{width: 16, height: 16, accentColor: '#f59e0b'}}
                    />
                    ⭐ 북마크 등록
                </label>

                <div>
                    <div style={{fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8}}>🔔 알람</div>
                    <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                        <Btn id="NONE" label="없음"/>
                        <Btn id="AT_TIME" label="시간에"/>
                        <Btn id="TEN_MINUTES_BEFORE" label="10분 전"/>
                        <Btn id="THIRTY_MINUTES_BEFORE" label="30분 전"/>
                        <Btn id="ONE_HOUR_BEFORE" label="1시간 전"/>
                    </div>
                </div>

                <div>
                    <div style={{fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8}}>⏰ 만료 시간</div>
                    <input
                        type="time" value={expireTime}
                        onChange={e => setExpireTime(e.target.value)}
                        style={{
                            padding: '7px 12px',
                            borderRadius: 8,
                            border: '1.5px solid #e2e8f0',
                            fontSize: 14,
                            outline: 'none',
                            width: 140
                        }}
                    />
                    {expireTime && (
                        <span style={{
                            fontSize: 12,
                            color: isExpired(expireTime) ? '#ef4444' : '#22c55e',
                            marginLeft: 10
                        }}>
              {isExpired(expireTime) ? '⛔ 만료됨' : '✅ 유효'}
            </span>
                    )}
                </div>

                <button
                    onClick={save}
                    style={{
                        padding: '10px 0',
                        background: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >저장
                </button>
            </div>
        </Modal>
    );
}

// ─── BoxCard ───────────────────────────────────────────────────────────────────
interface BoxCardProps {
    box: Box;
    taskPool: Task[];
    onStateChange: (boxId: number, newState: BoxState) => void;
    onOptionSave: (boxId: number, opts: BoxOption) => void;
    onDragStart: (boxId: number) => void;
    onDragEnter: (boxId: number) => void;
    onDragEnd: () => void;
    isDragOver: boolean;
}

function BoxCard({
                     box, taskPool,
                     onStateChange, onOptionSave,
                     onDragStart, onDragEnter, onDragEnd,
                     isDragOver,
                 }: BoxCardProps) {
    const [showOption, setShowOption] = useState<boolean>(false);
    const expired = isExpired(box.expireTime);
    const c = BOX_COLORS[box.state] ?? BOX_COLORS.READY;
    const tasks = getBoxTasks(box, taskPool);
    const multi = tasks.length > 1;

    return (
        <>
            {isDragOver && (
                <div style={{
                    height: 42, border: '2px dashed #94a3b8', borderRadius: 10,
                    background: 'rgba(148,163,184,0.07)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: '#94a3b8', marginBottom: 6,
                    animation: 'splitOpen 0.18s ease',
                }}>여기에 놓기</div>
            )}

            <div
                draggable
                onDragStart={e => {
                    e.dataTransfer.effectAllowed = 'move';
                    onDragStart(box.boxId);
                }}
                onDragEnter={() => onDragEnter(box.boxId)}
                onDragEnd={onDragEnd}
                onClick={() => setShowOption(true)}
                style={{
                    border: `1.5px solid ${expired ? '#e2e8f0' : c.border}`,
                    background: expired ? '#f1f5f9' : c.bg,
                    borderRadius: 10, padding: '9px 12px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', marginBottom: 6,
                    opacity: expired ? 0.5 : 1,
                    transition: 'background 0.2s, border-color 0.2s, opacity 0.2s',
                    position: 'relative',
                }}
            >
                {/* 드래그 핸들 */}
                <span
                    style={{color: '#cbd5e1', fontSize: 14, cursor: 'grab', flexShrink: 0}}
                    onClick={e => e.stopPropagation()}
                >⠿</span>

                {/* Task 목록 */}
                <div style={{flex: 1}}>
                    {multi && (
                        <div style={{fontSize: 10, color: '#94a3b8', marginBottom: 4, fontWeight: 600}}>
                            {box.name || '묶음'}
                        </div>
                    )}
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 5}}>
                        {tasks.map((t, i) => (
                            <span key={i} style={{
                                fontSize: 13, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
                                background: box.boxType === 'ROUTINE' ? '#e0f2fe' : '#fff7ed',
                                color: box.boxType === 'ROUTINE' ? '#0369a1' : '#c2410c',
                            }}>{t.name}</span>
                        ))}
                    </div>
                </div>

                {/* 북마크 */}
                {box.bookmark && <span style={{fontSize: 13, flexShrink: 0}}>⭐</span>}

                {/* 알람 아이콘 */}
                <span
                    onClick={e => {
                        e.stopPropagation();
                        setShowOption(true);
                    }}
                    title="알람 설정"
                    style={{
                        fontSize: 15, flexShrink: 0, cursor: 'pointer',
                        color: (box.alarmType && box.alarmType !== 'NONE') ? '#f97316' : '#cbd5e1',
                        transition: 'color 0.2s',
                    }}
                >🔔</span>

                {/* 상태 버튼 */}
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onStateChange(box.boxId, NEXT_STATE[box.state]);
                    }}
                    style={{
                        fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
                        border: 'none', cursor: 'pointer', flexShrink: 0,
                        background: c.chip, color: c.chipText, transition: 'all 0.15s',
                    }}
                >{STATE_LABEL[box.state]}</button>
            </div>

            {showOption && (
                <BoxOptionPanel box={box} onClose={() => setShowOption(false)} onSave={onOptionSave}/>
            )}
        </>
    );
}

// ─── BoardPanel ────────────────────────────────────────────────────────────────
interface BoardPanelProps {
    title: string;
    boxType: BoxType;
    accentColor: string;
    boxes: Box[];
    taskPool: Task[];
    tab: TabType;
    onStateChange: (boxId: number, newState: BoxState) => void;
    onOptionSave: (boxId: number, opts: BoxOption) => void;
    onReorder: (type: BoxType, dragId: number, overId: number) => void;
}

function BoardPanel({
                        title, boxType, accentColor, boxes, taskPool, tab,
                        onStateChange, onOptionSave, onReorder,
                    }: BoardPanelProps) {
    const [dragId, setDragId] = useState<number | null>(null);
    const [overId, setOverId] = useState<number | null>(null);

    const visible = boxes.filter(b => tab === 'DONE' ? b.state === 'DONE' : b.state !== 'DONE');

    const handleDrop = () => {
        if (!dragId || dragId === overId || !overId) {
            setDragId(null);
            setOverId(null);
            return;
        }
        onReorder(boxType, dragId, overId);
        setDragId(null);
        setOverId(null);
    };

    return (
        <div style={{
            border: `2.5px solid ${accentColor}`, borderRadius: 14,
            padding: '16px 16px 20px', background: '#fff',
            display: 'flex', flexDirection: 'column', minHeight: 300,
        }}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 14}}>
                <h3 style={{
                    margin: 0, fontSize: 13, fontWeight: 800, color: accentColor,
                    textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1,
                }}>{title}</h3>
                <span style={{fontSize: 12, color: '#94a3b8'}}>{visible.length}개</span>
            </div>

            <div onDragOver={e => e.preventDefault()} onDrop={handleDrop} style={{flex: 1}}>
                {visible.length === 0 ? (
                    <div style={{color: '#cbd5e1', fontSize: 13, textAlign: 'center', marginTop: 40}}>
                        {tab === 'DONE' ? '완료된 항목이 없습니다' : '항목이 없습니다'}
                    </div>
                ) : visible.map(box => (
                    <BoxCard
                        key={box.boxId}
                        box={box}
                        taskPool={taskPool}
                        onStateChange={onStateChange}
                        onOptionSave={onOptionSave}
                        onDragStart={id => setDragId(id)}
                        onDragEnter={id => setOverId(id)}
                        onDragEnd={handleDrop}
                        isDragOver={overId === box.boxId && dragId !== box.boxId}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── TaskPool ──────────────────────────────────────────────────────────────────
interface TaskPoolProps {
    tasks: Task[];
    onAddTask: (name: string) => Promise<void>;
    onDeleteTask: (taskId: number) => void;
    onCreateBox: (taskId: number) => void;
    selectedBoardType: BoxType;
    onSelectBoardType: (type: BoxType) => void;
}

function TaskPool({
                      tasks, onAddTask, onCreateBox,
                      selectedBoardType, onSelectBoardType,
                  }: TaskPoolProps) {
    const [groups, setGroups] = useState<Record<number, string>>({});
    const [activeGroup, setActiveGroup] = useState<string>('전체');
    const [newTaskName, setNewTaskName] = useState<string>('');
    const [newGroupName, setNewGroupName] = useState<string>('');
    const [isAdding, setIsAdding] = useState<boolean>(false);

    useEffect(() => {
        setGroups(g => {
            const next = {...g};
            tasks.forEach(t => {
                if (!next[t.taskId]) next[t.taskId] = '전체';
            });
            return next;
        });
    }, [tasks]);

    const groupSet = ['전체', ...new Set(Object.values(groups).filter(g => g !== '전체'))];
    const filtered = tasks.filter(t => activeGroup === '전체' || groups[t.taskId] === activeGroup);

    const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTaskName.trim()) return;
        await onAddTask(newTaskName.trim());
        setNewTaskName('');
        setNewGroupName('');
        setIsAdding(false);
    };

    return (
        <div style={{border: '2.5px solid #1e293b', borderRadius: 14, padding: '16px', background: '#fff'}}>
            {/* 헤더 */}
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 12}}>
        <span style={{
            fontSize: 13,
            fontWeight: 800,
            color: '#1e293b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            flex: 1
        }}>
          Task Pool
        </span>
                <div style={{display: 'flex', gap: 6, fontSize: 12}}>
                    {(['ROUTINE', 'EVENT'] as BoxType[]).map(t => (
                        <button key={t} onClick={() => onSelectBoardType(t)} style={{
                            padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
                            border: '1.5px solid', fontSize: 11,
                            borderColor: selectedBoardType === t ? '#1e293b' : '#e2e8f0',
                            background: selectedBoardType === t ? '#1e293b' : 'transparent',
                            color: selectedBoardType === t ? '#fff' : '#64748b',
                        }}>→ {t === 'ROUTINE' ? '루틴' : '이벤트'}</button>
                    ))}
                </div>
            </div>

            {/* 그룹 탭 */}
            <div style={{display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12}}>
                {groupSet.map(g => (
                    <button key={g} onClick={() => setActiveGroup(g)} style={{
                        fontSize: 11, padding: '3px 9px', borderRadius: 20, cursor: 'pointer',
                        border: `1.5px solid ${activeGroup === g ? '#1e293b' : '#e2e8f0'}`,
                        background: activeGroup === g ? '#1e293b' : 'transparent',
                        color: activeGroup === g ? '#fff' : '#64748b',
                        fontWeight: activeGroup === g ? 700 : 400,
                    }}>{g}</button>
                ))}
            </div>

            {/* Task 목록 */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 7}}>
                {filtered.map(task => (
                    <div
                        key={task.taskId}
                        onClick={() => onCreateBox(task.taskId)}
                        title="클릭 시 선택한 보드에 박스 생성"
                        style={{
                            border: '1.5px solid #e2e8f0', padding: '7px 8px',
                            borderRadius: 8, cursor: 'pointer', background: '#f8fafc',
                            fontSize: 12, fontWeight: 600, color: '#334155', textAlign: 'center',
                            position: 'relative', transition: 'border-color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = '#94a3b8';
                            (e.currentTarget as HTMLDivElement).style.background = '#f1f5f9';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
                            (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
                        }}
                    >{task.name}</div>
                ))}
            </div>

            {/* Task 추가 */}
            {isAdding ? (
                <form onSubmit={handleAddTask} style={{marginTop: 12, display: 'flex', gap: 5, flexWrap: 'wrap'}}>
                    <input
                        autoFocus type="text" placeholder="업무 이름" value={newTaskName}
                        onChange={e => setNewTaskName(e.target.value)}
                        style={{
                            flex: 2,
                            minWidth: 100,
                            padding: '7px 10px',
                            borderRadius: 8,
                            border: '1.5px solid #e2e8f0',
                            fontSize: 13,
                            outline: 'none'
                        }}
                    />
                    <input
                        type="text" placeholder="그룹 (선택)" value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: 80,
                            padding: '7px 10px',
                            borderRadius: 8,
                            border: '1.5px solid #e2e8f0',
                            fontSize: 13,
                            outline: 'none'
                        }}
                    />
                    <button type="submit" style={{
                        padding: '7px 12px',
                        background: '#1e293b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 700
                    }}>등록
                    </button>
                    <button type="button" onClick={() => setIsAdding(false)} style={{
                        padding: '7px 12px',
                        background: '#e2e8f0',
                        color: '#475569',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 12
                    }}>취소
                    </button>
                </form>
            ) : (
                <button onClick={() => setIsAdding(true)} style={{
                    width: '100%', marginTop: 12, padding: '8px', border: '1.5px dashed #cbd5e1',
                    borderRadius: 8, background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 12,
                }}>+ 업무 추가</button>
            )}
        </div>
    );
}

// ─── SaveLoadModal ─────────────────────────────────────────────────────────────
interface SaveLoadModalProps {
    open: boolean;
    onClose: () => void;
    boards: Board[];
    onLoad: (boardId: number) => void;
    onSave: () => Promise<void>;
}

function SaveLoadModal({open, onClose, boards, onLoad, onSave}: SaveLoadModalProps) {
    return (
        <Modal open={open} onClose={onClose} title="📂 보드 저장 / 불러오기" width={480}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <button onClick={onSave} style={{
                    padding: '10px 16px', background: '#0f172a', color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>💾 현재 보드 저장
                </button>

                <div style={{fontSize: 12, color: '#94a3b8', fontWeight: 700, marginTop: 4}}>저장된 보드</div>

                {boards.length === 0 && (
                    <div style={{fontSize: 13, color: '#cbd5e1', textAlign: 'center', padding: '20px 0'}}>저장된 보드가
                        없습니다</div>
                )}

                {boards.map(b => (
                    <div
                        key={b.boardId}
                        onClick={() => onLoad(b.boardId)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                            cursor: 'pointer', background: '#f8fafc', transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#94a3b8'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'}
                    >
                        <span style={{fontSize: 20}}>📋</span>
                        <div style={{flex: 1}}>
                            <div style={{fontSize: 13, fontWeight: 700, color: '#1e293b'}}>보드 #{b.boardId}</div>
                            <div style={{fontSize: 11, color: '#94a3b8'}}>{b.boxes?.length ?? 0}개 박스</div>
                        </div>
                        <span style={{fontSize: 12, color: '#007BFF', fontWeight: 600}}>불러오기</span>
                    </div>
                ))}
            </div>
        </Modal>
    );
}

// ─── ConfirmModal ──────────────────────────────────────────────────────────────
interface ConfirmModalProps {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmModal({open, message, onConfirm, onCancel}: ConfirmModalProps) {
    return (
        <Modal open={open} onClose={onCancel} title="⚠️ 확인">
            <p style={{fontSize: 14, color: '#334155', margin: '0 0 20px', lineHeight: 1.6}}>{message}</p>
            <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
                <button onClick={onCancel} style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    fontSize: 13
                }}>취소
                </button>
                <button onClick={onConfirm} style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#0f172a',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700
                }}>확인
                </button>
            </div>
        </Modal>
    );
}

// ─── WordNote (메인) ───────────────────────────────────────────────────────────
interface WordNoteProps {
    boardId?: number | string;
}

export default function WordNote({boardId: propBoardId}: WordNoteProps) {
    const [routineBoxes, setRoutineBoxes] = useState<Box[]>([]);
    const [eventBoxes, setEventBoxes] = useState<Box[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [allBoards, setAllBoards] = useState<Board[]>([]);
    const [currentBoardId, setCurrentBoardId] = useState<number | null>(null);

    const [tab, setTab] = useState<TabType>('TODO');
    const [selectedType, setSelectedType] = useState<BoxType>('ROUTINE');
    const [showSaveLoad, setShowSaveLoad] = useState<boolean>(false);
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

    const trashRef = useRef<HTMLDivElement>(null);

    // ── 초기화 ────────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchTasks();
        initBoard(propBoardId);
    }, [propBoardId]);

    const initBoard = async (bid?: number | string) => {
        const savedId = bid ?? localStorage.getItem('lastBoardId');
        if (savedId) {
            try {
                const res = await api.get<Board>(`/board/${savedId}`);
                if (res.data) {
                    applyBoard(Number(savedId), res.data);
                    return;
                }
            } catch {
            }
        }
        try {
            const res = await api.post<Board>('/board', {});
            const newId = res.data.boardId;
            localStorage.setItem('lastBoardId', String(newId));
            applyBoard(newId, res.data);
        } catch {
            setCurrentBoardId(null);
        }
    };

    const applyBoard = (id: number, data: Board | Box[]) => {
        setCurrentBoardId(id);
        localStorage.setItem('lastBoardId', String(id));
        const boxes: Box[] = Array.isArray(data) ? data : (data.boxes ?? []);
        setRoutineBoxes(boxes.filter(b => b.boxType === 'ROUTINE' || b.type === 'ROUTINE'));
        setEventBoxes(boxes.filter(b => b.boxType === 'EVENT' || b.type === 'EVENT'));
    };

    const fetchTasks = async () => {
        const fallback: Task[] = [
            {taskId: 1, name: '투약'},
            {taskId: 2, name: '라운딩'},
            {taskId: 3, name: '피딩'},
            {taskId: 4, name: 'v/s측정'},
        ];
        try {
            const res = await api.get<Task[]>('/task');
            setTasks(res.data?.length > 0 ? res.data : fallback);
        } catch {
            setTasks(fallback);
        }
    };

    const fetchAllBoards = async () => {
        try {
            const res = await api.get<Board | Board[]>('/board');
            setAllBoards(Array.isArray(res.data) ? res.data : [res.data]);
        } catch {
            setAllBoards([]);
        }
    };

    // ── 보드 저장 ──────────────────────────────────────────────────────────────
    const handleSaveBoard = async () => {
        if (!currentBoardId) return;
        try {
            await api.patch(`/board/${currentBoardId}`, {});
            alert('저장 완료!');
        } catch {
            alert('저장 실패');
        }
    };

    // ── 보드 불러오기 ──────────────────────────────────────────────────────────
    const handleLoadBoard = async (bid: number) => {
        const hasBoxes = routineBoxes.length + eventBoxes.length > 0;
        if (hasBoxes) {
            setConfirmState({
                message: '진행중인 보드를 저장할까요?',
                onConfirm: async () => {
                    await handleSaveBoard();
                    setConfirmState(null);
                    doLoad(bid);
                },
            });
        } else {
            doLoad(bid);
        }
        setShowSaveLoad(false);
    };

    const doLoad = async (bid: number) => {
        try {
            const res = await api.get<Board>(`/board/${bid}`);
            applyBoard(bid, res.data);
        } catch {
            alert('보드 로드 실패');
        }
    };

    // ── 박스 상태 변경 ─────────────────────────────────────────────────────────
    const handleStateChange = async (boxId: number, newState: BoxState) => {
        const update = (arr: Box[]) => arr.map(b => b.boxId === boxId ? {...b, state: newState} : b);
        setRoutineBoxes(update);
        setEventBoxes(update);
        try {
            await api.patch(`/box/${boxId}/state`, {state: newState});
        } catch {
        }
    };

    // ── 박스 옵션 저장 ─────────────────────────────────────────────────────────
    const handleOptionSave = async (boxId: number, opts: BoxOption) => {
        const update = (arr: Box[]) => arr.map(b => b.boxId === boxId ? {...b, ...opts} : b);
        setRoutineBoxes(update);
        setEventBoxes(update);
        try {
            await api.patch(`/box/${boxId}/option`, opts);
        } catch {
        }
    };

    // ── Task → 박스 생성 ───────────────────────────────────────────────────────
    const handleCreateBox = async (taskId: number) => {
        const task = tasks.find(t => t.taskId === taskId);
        const name = task ? task.name : `박스 ${taskId}`;
        const tempId = Date.now();
        const newBox: Box = {
            boxId: tempId,
            name, state: 'READY', boxType: selectedType,
            bookmark: false, alarmType: 'NONE',
            expireTime: null, taskIds: [taskId],
        };

        if (selectedType === 'ROUTINE') setRoutineBoxes(prev => [...prev, newBox]);
        else setEventBoxes(prev => [...prev, newBox]);

        try {
            const res = await api.post<Box>('/box', {
                boardId: currentBoardId,
                name,
                boxType: selectedType,
                taskIds: [taskId],
            });
            const real = res.data;
            const replace = (prev: Box[]) => prev.map(b => b.boxId === tempId ? {...b, ...real} : b);
            if (selectedType === 'ROUTINE') setRoutineBoxes(replace);
            else setEventBoxes(replace);
        } catch {
        }
    };

    // ── Task 추가 ──────────────────────────────────────────────────────────────
    const handleAddTask = async (name: string) => {
        try {
            const res = await api.post<Task>('/task', {name});
            setTasks(prev => [...prev, res.data]);
        } catch {
        }
    };

    // ── 박스 순서 변경 (드래그) ────────────────────────────────────────────────
    const handleReorder = useCallback((type: BoxType, dragId: number, overId: number) => {
        const setter = type === 'ROUTINE' ? setRoutineBoxes : setEventBoxes;
        setter(prev => {
            const from = prev.findIndex(b => b.boxId === dragId);
            const to = prev.findIndex(b => b.boxId === overId);
            if (from < 0 || to < 0) return prev;
            const next = [...prev];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            api.put(`/board/${currentBoardId}/boxesOrder`, {boxId: dragId, targetIndex: to}).catch(() => {
            });
            return next;
        });
    }, [currentBoardId]);

    // ── 전체 완료 ──────────────────────────────────────────────────────────────
    const handleCompleteAll = () => {
        setConfirmState({
            message: '루틴 보드는 READY로 초기화, 이벤트 보드는 전체 삭제됩니다. 진행할까요?',
            onConfirm: async () => {
                setConfirmState(null);
                setRoutineBoxes(prev => prev.map(b => ({...b, state: 'READY' as BoxState})));
                setEventBoxes([]);
                if (currentBoardId) {
                    try {
                        await api.put(`/board/${currentBoardId}/reset`, {});
                    } catch {
                    }
                }
            },
        });
    };

    // ── TabBar ────────────────────────────────────────────────────────────────
    const TabBar = () => (
        <div style={{display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 14}}>
            {(['TODO', 'DONE'] as TabType[]).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                    flex: 1, padding: '6px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontWeight: tab === t ? 700 : 400, fontSize: 12,
                    background: tab === t ? '#fff' : 'transparent',
                    color: tab === t ? '#0f172a' : '#94a3b8',
                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                }}>{t === 'TODO' ? '📋 TODO' : '✅ DONE'}</button>
            ))}
        </div>
    );

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
        @keyframes splitOpen {
          from { height: 0; opacity: 0; }
          to   { height: 42px; opacity: 1; }
        }
      `}</style>

            <div style={{
                padding: '16px 20px',
                maxWidth: 1360,
                margin: '0 auto',
                fontFamily: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
                color: '#0f172a'
            }}>

                {/* ── 헤더 ── */}
                <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18}}>
                    <ClockOwl/>
                    <div style={{flex: 1, textAlign: 'center'}}>
                        <div style={{fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em'}}>📋 WordNote</div>
                        {currentBoardId && (
                            <div style={{fontSize: 11, color: '#94a3b8'}}>보드 #{currentBoardId}</div>
                        )}
                    </div>

                    <div style={{display: 'flex', gap: 7, alignItems: 'center'}}>
                        <button
                            onClick={() => {
                                fetchAllBoards();
                                setShowSaveLoad(true);
                            }}
                            title="저장/불러오기"
                            style={{
                                padding: '7px 12px',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: 9,
                                background: '#f8fafc',
                                cursor: 'pointer',
                                fontSize: 13
                            }}
                        >💾 저장/로드
                        </button>

                        <button
                            onClick={handleCompleteAll}
                            style={{
                                padding: '7px 14px',
                                border: 'none',
                                borderRadius: 9,
                                background: '#0f172a',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 700
                            }}
                        >✔ 전체 완료
                        </button>

                        <div
                            ref={trashRef}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => e.preventDefault()}
                            style={{
                                padding: '7px 12px', border: '1.5px solid #fecaca', borderRadius: 9,
                                background: '#fff5f5', cursor: 'default', fontSize: 16,
                            }}
                            title="여기로 드래그해서 삭제"
                        >🗑️
                        </div>
                    </div>
                </div>

                {/* ── 탭 ── */}
                <TabBar/>

                {/* ── 메인 레이아웃 ── */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 18, alignItems: 'start'}}>

                    <BoardPanel
                        title="Routine Board"
                        boxType="ROUTINE"
                        accentColor="#0369a1"
                        boxes={routineBoxes}
                        taskPool={tasks}
                        tab={tab}
                        onStateChange={handleStateChange}
                        onOptionSave={handleOptionSave}
                        onReorder={handleReorder}
                    />

                    <BoardPanel
                        title="Event Board"
                        boxType="EVENT"
                        accentColor="#ea580c"
                        boxes={eventBoxes}
                        taskPool={tasks}
                        tab={tab}
                        onStateChange={handleStateChange}
                        onOptionSave={handleOptionSave}
                        onReorder={handleReorder}
                    />

                    <TaskPool
                        tasks={tasks}
                        onAddTask={handleAddTask}
                        onDeleteTask={() => {
                        }}
                        onCreateBox={handleCreateBox}
                        selectedBoardType={selectedType}
                        onSelectBoardType={setSelectedType}
                    />
                </div>
            </div>

            <SaveLoadModal
                open={showSaveLoad}
                onClose={() => setShowSaveLoad(false)}
                boards={allBoards}
                onLoad={handleLoadBoard}
                onSave={async () => {
                    await handleSaveBoard();
                    setShowSaveLoad(false);
                }}
            />

            {confirmState && (
                <ConfirmModal
                    open
                    message={confirmState.message}
                    onConfirm={confirmState.onConfirm}
                    onCancel={() => setConfirmState(null)}
                />
            )}
        </>
    );
}
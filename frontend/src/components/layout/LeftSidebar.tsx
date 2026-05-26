import {useState} from 'react';
import type {Board, Box} from '../../types';
import '../../styles/left-sidebar.css';
import type {AlarmToast} from '../../hooks/useAlarm';

interface Props {
    currentBoardId: number | undefined;
    allBoards: Board[];
    deletingBoardId: number | null;
    onLoadBoard: (boardId: number) => void;
    onDeleteBoard: (boardId: number, e: React.MouseEvent) => void;
    onNewBoard: () => void;
    todo: number;
    prog: number;
    done: number;
    alarms: AlarmToast[];
    onDismissAlarm: (boxId: number) => void;
    allBoxes: Box[];
}

const getAlarmTime = (expireTime: string, alarmType: string): string => {
    const [h, m] = expireTime.split(':').map(Number);
    let total = h * 60 + m;
    if (alarmType === 'TEN_MINUTES_BEFORE') total -= 10;
    else if (alarmType === 'THIRTY_MINUTES_BEFORE') total -= 30;
    else if (alarmType === 'ONE_HOUR_BEFORE') total -= 60;
    return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
};

export default function LeftSidebar({
                                        currentBoardId, allBoards, deletingBoardId,
                                        onLoadBoard, onDeleteBoard, onNewBoard,
                                        todo, prog, done, alarms, allBoxes, onDismissAlarm,
                                    }: Props) {
    const [showWarning, setShowWarning] = useState(false);

    const handleNewBoard = () => {
        if (allBoards.length >= 11) {
            setShowWarning(true);
            return;
        }
        setShowWarning(false);
        onNewBoard();
    };

    const scheduledAlarms = allBoxes.filter(
        b => b.alarmType && b.alarmType !== 'NONE' && b.state !== 'DONE' && b.expireTime
    );
    const firedIds = new Set(alarms.map(a => a.boxId));

    return (
        <aside className="sidebar-container">
            <span className="sidebar-title">BOARDS</span>

            <div className="stats-container">
                <div className="stats-grid">
                    <div className="stats-card">
                        <span className="stats-value stats-card-todo">{todo}</span>
                        <span className="stats-label">할일</span>
                    </div>
                    <div className="stats-card">
                        <span className="stats-value stats-card-prog">{prog}</span>
                        <span className="stats-label">진행</span>
                    </div>
                    <div className="stats-card">
                        <span className="stats-value stats-card-done">{done}</span>
                        <span className="stats-label">완료</span>
                    </div>
                </div>
            </div>

            <div className="alarm-panel">
                <div className="alarm-panel-header">
                    <i className="ti ti-bell" aria-hidden="true"/>
                    <span className="alarm-panel-title">알람</span>
                    {scheduledAlarms.length > 0 && (
                        <span className="alarm-badge">({scheduledAlarms.length})</span>
                    )}
                </div>
                <div className="alarm-list">
                    {scheduledAlarms.length === 0 ? (
                        <div className="alarm-empty">
                            <i className="ti ti-bell-off" aria-hidden="true"/>
                            <span>알람 없음</span>
                        </div>
                    ) : (
                        scheduledAlarms.map(box => (
                            <div key={box.boxId}
                                 className={`alarm-item ${firedIds.has(box.boxId) ? 'alarm-item-fired' : ''}`}>
                                <span className="alarm-item-name">
                                    [{getAlarmTime(box.expireTime!, box.alarmType)}] {box.name}
                                </span>
                                {firedIds.has(box.boxId) && (
                                    <button className="alarm-dismiss-button" onClick={() => onDismissAlarm(box.boxId)}
                                            aria-label="알람 닫기">
                                        <i className="ti ti-x" aria-hidden="true"/>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {allBoards.map(b => (
                <div key={b.boardId} className="board-item-row">
                    <button
                        onClick={() => {
                            setShowWarning(false);
                            onLoadBoard(b.boardId);
                        }}
                        className={`board-load-button ${b.boardId === currentBoardId ? 'active' : ''}`}
                    >
                        <i className={`ti ${b.boardId === currentBoardId ? 'ti-pin' : 'ti-layout-board'} board-icon`} aria-hidden="true"/>
                        {b.boardId === currentBoardId ? '현재 보드' : `보드 #${b.boardId}`}
                    </button>
                    {b.boardId !== currentBoardId && (
                        <button onClick={e => onDeleteBoard(b.boardId, e)} disabled={deletingBoardId === b.boardId}
                                className="board-delete-button" aria-label="보드 삭제">
                            <i className="ti ti-trash" aria-hidden="true"/>
                        </button>
                    )}
                </div>
            ))}

            {showWarning && <div className="warning-message">보드는 최대 10개까지만 생성할 수 있습니다.</div>}

            <button onClick={handleNewBoard} className="board-create-button">
                <i className="ti ti-plus btn-icon" aria-hidden="true"/>
                새 보드
            </button>
        </aside>
    );
}
import {useState} from 'react';
import type {Board} from '../../types';
import '../../styles/LeftSidebar.css';

interface Props {
    currentBoardId: number | undefined;
    allBoards: Board[];
    deletingBoardId: number | null;
    onLoadBoard: (boardId: number) => void;
    onDeleteBoard: (boardId: number, e: React.MouseEvent) => void;
    onNewBoard: () => void;
    boardId: number | undefined;
    total: number;
    todo: number;
    prog: number;
    done: number;
}

export default function LeftSidebar({
                                        currentBoardId,
                                        allBoards,
                                        deletingBoardId,
                                        onLoadBoard,
                                        onDeleteBoard,
                                        onNewBoard,
                                        boardId,
                                        total,
                                        todo,
                                        prog,
                                        done
                                    }: Props) {
    const isFull = allBoards.length >= 11;
    const [showWarning, setShowWarning] = useState(false);
    const [showEmptyWarning, setShowEmptyWarning] = useState(false);

    const handleNewBoard = () => {
        const currentBoard = allBoards.find(b => b.boardId === currentBoardId);
        const isEmptyBoard = currentBoard ? currentBoard.boxes.length === 0 : false;

        if (isEmptyBoard) {
            setShowEmptyWarning(true);
            setShowWarning(false);
            return;
        }

        if (isFull) {
            setShowWarning(true);
            setShowEmptyWarning(false);
            return;
        }

        setShowWarning(false);
        setShowEmptyWarning(false);
        onNewBoard();
    };

    return (
        <aside className="sidebar-container">
            <span className="sidebar-title">BOARDS</span>

            {/* 통계 */}
            <div className="stats-container">
                <div className="stats-summary">
                    보드 #{boardId ?? '-'} · 박스 {total}개
                </div>
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

            {/* 보드 리스트 */}
            {allBoards.map(b => {
                const isActive = b.boardId === currentBoardId;
                return (
                    <div key={b.boardId} className="board-item-row">
                        <button
                            onClick={() => {
                                setShowWarning(false);
                                setShowEmptyWarning(false);
                                onLoadBoard(b.boardId);
                            }}
                            /* 활성화 상태일 때 active 클래스 동적 추가 */
                            className={`board-load-button ${isActive ? 'active' : ''}`}
                        >
                            <i className="ti ti-layout-board board-icon" aria-hidden="true"/>
                            {isActive ? '현재 보드' : `보드 #${b.boardId}`}
                        </button>

                        {!isActive && (
                            <button
                                onClick={(e) => onDeleteBoard(b.boardId, e)}
                                disabled={deletingBoardId === b.boardId}
                                className="board-delete-button"
                                aria-label="보드 삭제"
                            >
                                <i className="ti ti-trash" aria-hidden="true"/>
                            </button>
                        )}
                    </div>
                );
            })}

            {/* 경고 메시지 */}
            {showWarning && (
                <div className="warning-message">
                    보드는 최대 10개까지만 생성할 수 있습니다.
                </div>
            )}

            {showEmptyWarning && (
                <div className="warning-message">
                    빈 보드는 저장하거나 새로 만들 수 없습니다. 내용을 추가해 주세요.
                </div>
            )}

            {/* 새 보드 버튼 */}
            <button onClick={handleNewBoard} className="board-create-button">
                <i className="ti ti-plus btn-icon" aria-hidden="true"/>
                새 보드
            </button>
        </aside>
    );
}
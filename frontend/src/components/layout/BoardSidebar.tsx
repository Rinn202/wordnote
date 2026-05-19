import {useState} from 'react';
import type {Board} from '../../types';

interface Props {
    currentBoardId: number | undefined;
    allBoards: Board[];
    deletingBoardId: number | null;
    onLoadBoard: (boardId: number) => void;
    onDeleteBoard: (boardId: number, e: React.MouseEvent) => void;
    onNewBoard: () => void;
}

export default function BoardSidebar({
                                         currentBoardId,
                                         allBoards,
                                         deletingBoardId,
                                         onLoadBoard,
                                         onDeleteBoard,
                                         onNewBoard
                                     }: Props) {
    const isFull = allBoards.length >= 11;
    const [showWarning, setShowWarning] = useState(false);
    // 1. 빈 보드 경고를 위한 상태 추가
    const [showEmptyWarning, setShowEmptyWarning] = useState(false);

    const handleNewBoard = () => {
        // 현재 열려있는 보드 찾기
        const currentBoard = allBoards.find(b => b.boardId === currentBoardId);

        // 2. 현재 보드의 boxes가 비어있는지 확인 (새 보드 생성 직후 등)
        // 만약 완전 초기 상태라 currentBoard가 없다면 빈 보드가 아니라고 가정(또는 취향껏 수정)
        const isEmptyBoard = currentBoard ? currentBoard.boxes.length === 0 : false;

        if (isEmptyBoard) {
            setShowEmptyWarning(true);
            setShowWarning(false); // 다른 경고는 꺼줍니다.
            return;
        }

        if (isFull) {
            setShowWarning(true);
            setShowEmptyWarning(false); // 다른 경고는 꺼줍니다.
            return;
        }

        // 정상적인 경우 모든 경고를 끄고 새 보드 생성
        setShowWarning(false);
        setShowEmptyWarning(false);
        onNewBoard();
    };

    return (
        <aside style={{
            width: '200px',
            background: 'var(--surface2)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 10px',
            gap: '4px',
            flexShrink: 0,
        }}>
            <span style={{
                fontSize: 12,
                color: 'var(--text3)',
                letterSpacing: '.08em',
                fontWeight: 700,
                fontFamily: 'IBM Plex Mono, monospace',
                marginBottom: 4
            }}>BOARDS</span>

            {allBoards.map(b => (
                <div key={b.boardId} style={{display: 'flex', alignItems: 'center', gap: 4}}>
                    <button
                        onClick={() => {
                            setShowWarning(false);
                            setShowEmptyWarning(false);
                            onLoadBoard(b.boardId);
                        }}
                        style={{
                            flex: 1,
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 13, padding: '4px 7px',
                            borderRadius: 6,
                            border: b.boardId === currentBoardId ? '1px solid var(--routine-b)' : '1px solid var(--border)',
                            background: b.boardId === currentBoardId ? 'var(--routine-bg)' : 'var(--surface)',
                            color: b.boardId === currentBoardId ? 'var(--routine)' : 'var(--text2)',
                            cursor: 'pointer',
                            fontFamily: 'GowunBatang, serif',
                            textAlign: 'left',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}
                    >
                        <i className="ti ti-layout-board" style={{fontSize: 14, flexShrink: 0}} aria-hidden="true"/>
                        {b.boardId === currentBoardId ? '현재 보드' : `보드 #${b.boardId}`}
                    </button>
                    {b.boardId !== currentBoardId && (
                        <button
                            onClick={(e) => onDeleteBoard(b.boardId, e)}
                            disabled={deletingBoardId === b.boardId}
                            style={{
                                width: 28, height: 28, flexShrink: 0,
                                border: '1.5px dashed var(--border2)',
                                borderRadius: 5, background: 'transparent',
                                color: 'var(--text3)', cursor: 'pointer', fontSize: 13,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            aria-label="보드 삭제"
                        >
                            <i className="ti ti-trash" aria-hidden="true"/>
                        </button>
                    )}
                </div>
            ))}

            {/* 개수 초과 경고창 */}
            {showWarning && (
                <div style={{
                    fontSize: 11, color: 'var(--danger)', background: 'var(--danger-bg)',
                    border: '1px solid var(--routine-b)', borderRadius: 6,
                    padding: '6px 8px', marginTop: 4, fontFamily: 'GowunBatang, serif', lineHeight: 1.5,
                }}>
                    보드는 최대 10개까지만 생성할 수 있습니다.
                </div>
            )}

            {/* 3. 빈 보드 저장 불가 경고창 추가 */}
            {showEmptyWarning && (
                <div style={{
                    fontSize: 11, color: 'var(--danger)', background: 'var(--danger-bg)',
                    border: '1px solid var(--routine-b)', borderRadius: 6,
                    padding: '6px 8px', marginTop: 4, fontFamily: 'GowunBatang, serif', lineHeight: 1.5,
                }}>
                    빈 보드는 저장하거나 새로 만들 수 없습니다. 내용을 추가해 주세요.
                </div>
            )}

            <button
                onClick={handleNewBoard}
                style={{
                    marginTop: 4,
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, padding: '6px 8px',
                    borderRadius: 6,
                    border: '1.5px dashed var(--border2)',
                    background: 'transparent',
                    color: 'var(--text3)',
                    cursor: 'pointer',
                    fontFamily: 'GowunBatang, serif',
                }}
            >
                <i className="ti ti-plus" style={{fontSize: 13}} aria-hidden="true"/>
                새 보드
            </button>
        </aside>
    );
}
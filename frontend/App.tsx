import React, {useEffect, useState} from 'react';
import {useBoard} from './src/hooks/useBoard';
import RoutineBoard from './src/components/board/RoutineBoard';
import EventBoard from './src/components/board/EventBoard';
import TaskPool from './src/components/task/TaskPool';
import BoxOptionPanel from './src/components/common/BoxOptionPanel';
import Modal from './src/components/common/Modal';
import ClockOwl from './src/components/ClockOwl';
import type {Board, Box} from './src/types';
import {boardApi} from './src/api';
import Login from './src/pages/Login';
import SignUp from './src/pages/SignUp';

import './index.css';

export default function App() {
    const [page, setPage] = useState<string>(
        localStorage.getItem('accessToken') ? 'board' : 'login'
    );

    if (page === 'login') {
        return <Login onSuccess={() => setPage('board')} onGoSignUp={() => setPage('signup')}/>;
    }
    if (page === 'signup') {
        return <SignUp onSuccess={() => setPage('login')} onGoLogin={() => setPage('login')}/>;
    }
    return <BoardApp onLogout={() => {
        localStorage.clear();
        setPage('login');
    }}/>;
}

function BoardApp({onLogout}: { onLogout: () => void }) {
    const {
        board, loading, initBoard,
        loadBoard, createNewBoard, resetBoard,
        patchBoxState, removeBox, reorderBox,
        updateBoxLocal, addBox,
    } = useBoard();

    const [optionBox, setOptionBox] = useState<Box | null>(null);
    const [loadModalOpen, setLoadModalOpen] = useState(false);
    const [newBoardConfirmOpen, setNewBoardConfirmOpen] = useState(false);
    const [allBoards, setAllBoards] = useState<Board[]>([]);
    const [deletingBoardId, setDeletingBoardId] = useState<number | null>(null);


    useEffect(() => {
        initBoard();
    }, [initBoard]);

    const handleNewBoardClick = () => {
        const hasBoxes = (board?.boxes.length ?? 0) > 0;
        if (hasBoxes) setNewBoardConfirmOpen(true);
        else createNewBoard();
    };

    const handleLoadClick = async () => {
        const boards = await boardApi.getAll(board!.boardId);
        setAllBoards(boards);
        setLoadModalOpen(true);
    };

    const handleDeleteBoard = async (boardId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingBoardId(boardId);
        try {
            await boardApi.delete(boardId);
            setAllBoards(prev => prev.filter(b => b.boardId !== boardId));
            if (board?.boardId === boardId) {
                await createNewBoard();
                setLoadModalOpen(false);
            }
        } finally {
            setDeletingBoardId(null);
        }
    };

    const routineBoxes = board ? board.boxes.filter(b => b.boxType === 'ROUTINE') : [];
    const eventBoxes = board ? board.boxes.filter(b => b.boxType === 'EVENT') : [];

    return (
        <div className="app">
            <header className="topbar">
                <div className="logo-area">
                    <ClockOwl/>
                    <span className="logo">daily·board</span>
                </div>


                <div className="topbar-actions">
                    <button className="icon-btn" title="보드 리셋" onClick={resetBoard}>
                        <i className="ti ti-refresh" aria-hidden="true"/>
                    </button>
                    <button className="icon-btn" title="새 보드" onClick={handleNewBoardClick}>
                        <i className="ti ti-plus" aria-hidden="true"/>
                    </button>
                    <button className="icon-btn" title="보드 불러오기" onClick={handleLoadClick}>
                        <i className="ti ti-folder-open" aria-hidden="true"/>
                    </button>
                    <button className="icon-btn" title="로그아웃" onClick={onLogout}>
                        <i className="ti ti-logout" aria-hidden="true"/>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="loading-state">
                    <i className="ti ti-loader-2 spin" aria-hidden="true"/>
                    <span>보드를 불러오는 중...</span>
                </div>
            ) : board ? (
                /* ✅ 보드 + 우측 TaskPool 사이드바 */
                <div className="main-area">
                    <main className="boards-area">
                        <RoutineBoard
                            boxes={routineBoxes}
                            onStateChange={patchBoxState}
                            onDelete={removeBox}
                            onUpdate={updateBoxLocal}
                            onOpenOption={setOptionBox}
                            onReorder={(id, idx) => reorderBox(id, idx, 'ROUTINE')}
                        />
                        <EventBoard
                            boxes={eventBoxes}
                            onStateChange={patchBoxState}
                            onDelete={removeBox}
                            onUpdate={updateBoxLocal}
                            onOpenOption={setOptionBox}
                            onReorder={(id, idx) => reorderBox(id, idx, 'EVENT')}
                        />
                    </main>
                    {/* ✅ TaskPool 우측 사이드바 */}
                    <aside className="task-sidebar">
                        <TaskPool boardId={board.boardId} onBoxCreated={addBox}/>
                    </aside>
                </div>
            ) : null}

            {optionBox && (
                <div className="side-panel-overlay" onClick={() => setOptionBox(null)}>
                    <div className="side-panel" onClick={e => e.stopPropagation()}>
                        <BoxOptionPanel
                            box={optionBox}
                            onClose={() => setOptionBox(null)}
                            onUpdate={box => {
                                updateBoxLocal(box);
                                setOptionBox(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ✅ 보드 불러오기 + 삭제 모달 */}
            <Modal open={loadModalOpen} title="보드 불러오기" onClose={() => setLoadModalOpen(false)}>
                {allBoards.length === 0 ? (
                    <p className="modal-empty">저장된 보드가 없습니다.</p>
                ) : (
                    <ul className="board-list">
                        {allBoards.map(b => (
                            <li key={b.boardId}>
                                <div className="board-list-row">
                                    <button
                                        className="board-list-item"
                                        onClick={() => {
                                            loadBoard(b.boardId);
                                            setLoadModalOpen(false);
                                        }}
                                    >
                                        <i className="ti ti-layout-board" aria-hidden="true"/>
                                        보드 #{b.boardId}
                                        <span className="board-list-count">{b.boxes.length}개 박스</span>
                                    </button>
                                    {/* ✅ 보드 삭제 버튼 */}
                                    <button
                                        className="board-delete-btn"
                                        title="보드 삭제"
                                        disabled={deletingBoardId === b.boardId}
                                        onClick={(e) => handleDeleteBoard(b.boardId, e)}
                                    >
                                        {deletingBoardId === b.boardId
                                            ? <i className="ti ti-loader-2 spin" aria-hidden="true"/>
                                            : <i className="ti ti-trash" aria-hidden="true"/>
                                        }
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Modal>

            <Modal open={newBoardConfirmOpen} title="진행 중인 보드" onClose={() => setNewBoardConfirmOpen(false)}
                   width={320}>
                <p className="confirm-msg">진행 중인 보드를 저장할까요?</p>
                <div className="confirm-actions">
                    <button className="confirm-btn secondary" onClick={() => {
                        createNewBoard();
                        setNewBoardConfirmOpen(false);
                    }}>저장 안 함
                    </button>
                    <button className="confirm-btn primary" onClick={async () => {
                        await createNewBoard();
                        setNewBoardConfirmOpen(false);
                    }}>저장 후 새 보드
                    </button>
                </div>
            </Modal>
        </div>
    );
}
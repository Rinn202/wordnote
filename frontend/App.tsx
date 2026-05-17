import {useEffect, useState} from 'react';
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
    // ── 페이지 상태 ─────────────────────────────────────────────────────────────
    // 토큰이 있으면 바로 board, 없으면 login 으로 시작
    const [page, setPage] = useState(
        localStorage.getItem('accessToken') ? 'board' : 'login'
    );

    // ── 로그인 / 회원가입 화면 분기 ─────────────────────────────────────────────
    if (page === 'login') {
        return (
            <Login
                onSuccess={() => setPage('board')}
                onGoSignUp={() => setPage('signup')}
            />
        );
    }

    if (page === 'signup') {
        return (
            <SignUp
                onSuccess={() => setPage('login')}
                onGoLogin={() => setPage('login')}
            />
        );
    }

    // ── 이하 기존 보드 화면 ──────────────────────────────────────────────────────
    return <BoardApp onLogout={() => {
        localStorage.clear();
        setPage('login');
    }}/>;
}

// ── 보드 앱 분리 (hooks는 조건부 호출 불가이므로 별도 컴포넌트로 분리) ────────────
function BoardApp({onLogout}: { onLogout: () => void }) {
    const {
        board, tab, setTab, loading, initBoard,
        loadBoard, createNewBoard, resetBoard,
        patchBoxState, removeBox, reorderBox,
        updateBoxLocal, addBox, filterBoxes,
    } = useBoard();

    // ── 모달 상태 ────────────────────────────────────────────────────────────────
    const [optionBox, setOptionBox] = useState<Box | null>(null);
    const [loadModalOpen, setLoadModalOpen] = useState(false);
    const [newBoardConfirmOpen, setNewBoardConfirmOpen] = useState(false);
    const [allBoards, setAllBoards] = useState<Board[]>([]);

    // ── 초기화 ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        initBoard();
    }, [initBoard]);

    // ── 새 보드 아이콘 클릭 ──────────────────────────────────────────────────────
    const handleNewBoardClick = () => {
        const hasBoxes = (board?.boxes.length ?? 0) > 0;
        if (hasBoxes) setNewBoardConfirmOpen(true);
        else createNewBoard();
    };

    // ── 불러오기 모달 ────────────────────────────────────────────────────────────
    const handleLoadClick = async () => {
        const boards = await boardApi.getAll();
        setAllBoards(boards);
        setLoadModalOpen(true);
    };

    const routineBoxes = board ? filterBoxes(board.boxes, 'ROUTINE') : [];
    const eventBoxes = board ? filterBoxes(board.boxes, 'EVENT') : [];

    return (
        <div className="app">
            {/* ── 상단 탭바 ──────────────────────────────────────────────────────── */}
            <header className="topbar">
                <div className="logo-area">
                    <ClockOwl/>
                    <span className="logo">daily·board</span>
                </div>

                <div className="tab-group">
                    <button
                        className={`tab ${tab === 'ACTIVE' ? 'active' : ''}`}
                        onClick={() => setTab('ACTIVE')}
                    >
                        할일
                    </button>
                    <button
                        className={`tab ${tab === 'DONE' ? 'active' : ''}`}
                        onClick={() => setTab('DONE')}
                    >
                        완료
                    </button>
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
                    {/* ── 로그아웃 버튼 ── */}
                    <button className="icon-btn" title="로그아웃" onClick={onLogout}>
                        <i className="ti ti-logout" aria-hidden="true"/>
                    </button>
                </div>
            </header>

            {/* ── 보드 영역 ──────────────────────────────────────────────────────── */}
            {loading ? (
                <div className="loading-state">
                    <i className="ti ti-loader-2 spin" aria-hidden="true"/>
                    <span>보드를 불러오는 중...</span>
                </div>
            ) : board ? (
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
            ) : null}

            {/* ── 하단 태스크 풀 ─────────────────────────────────────────────────── */}
            {board && (
                <footer className="pool-footer">
                    <TaskPool boardId={board.boardId} onBoxCreated={addBox}/>
                </footer>
            )}

            {/* ── 박스 옵션 패널 ──────────────────────────────────────────────────── */}
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

            {/* ── 보드 불러오기 모달 ──────────────────────────────────────────────── */}
            <Modal open={loadModalOpen} title="보드 불러오기" onClose={() => setLoadModalOpen(false)}>
                {allBoards.length === 0 ? (
                    <p className="modal-empty">저장된 보드가 없습니다.</p>
                ) : (
                    <ul className="board-list">
                        {allBoards.map(b => (
                            <li key={b.boardId}>
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
                            </li>
                        ))}
                    </ul>
                )}
            </Modal>

            {/* ── 새 보드 확인 모달 ───────────────────────────────────────────────── */}
            <Modal
                open={newBoardConfirmOpen}
                title="진행 중인 보드"
                onClose={() => setNewBoardConfirmOpen(false)}
                width={320}
            >
                <p className="confirm-msg">진행 중인 보드를 저장할까요?</p>
                <div className="confirm-actions">
                    <button
                        className="confirm-btn secondary"
                        onClick={() => {
                            createNewBoard();
                            setNewBoardConfirmOpen(false);
                        }}
                    >
                        저장 안 함
                    </button>
                    <button
                        className="confirm-btn primary"
                        onClick={async () => {
                            await createNewBoard();
                            setNewBoardConfirmOpen(false);
                        }}
                    >
                        저장 후 새 보드
                    </button>
                </div>
            </Modal>
        </div>
    );
}
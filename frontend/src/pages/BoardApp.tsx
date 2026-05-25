import { useBoardApp } from '../hooks/useBoardApp';
import AlarmToastList from '../components/common/AlarmToast';
import Topbar from '../components/layout/Topbar';
import BoardColumn from '../components/board/BoardColumn';
import TaskPool from '../components/task/TaskPool';
import BoxOptionPanel from '../components/box/BoxOptionPanel';
import LeftSidebar from '../components/layout/LeftSidebar';
import Modal from '../components/common/Modal';
import { getTimeTheme } from '../components/layout/getTimeTheme';
import { useState } from 'react';
import BoardModals from '../components/common/BoardModals';


export default function BoardApp({ onLogout }: { onLogout: () => void }) {
    const {
        currentBoard,
        boardActions: {
            loading, loadBoard, createNewBoard, resetBoard,
            patchBoxState, removeBox, reorderBox,
            updateBoxLocal, reorderTask, addBox,
            applySample,
        },
        boards: { allBoards, deletingBoardId, handleLoadClick, handleDeleteBoard, loadModalOpen, setLoadModalOpen },
        clockStr, dateStr,
        optionBox, setOptionBox,
        sampleConfirmOpen, setSampleConfirmOpen,
        alarmToasts, allBoxes, allBoxesStats,
        handleCloseToast, handleStart,
        usedTaskIds,
        isTaskDragging, taskDraggingBoxId, handleTaskDragChange,
    } = useBoardApp();

    const routineBoxes = currentBoard?.boxes.filter(b => b.boxType === 'ROUTINE') ?? [];
    const eventBoxes = currentBoard?.boxes.filter(b => b.boxType === 'EVENT') ?? [];
    const theme = getTimeTheme();

    const columnProps = (type: 'ROUTINE' | 'EVENT') => ({
        boardType: type,
        boxes: type === 'ROUTINE' ? routineBoxes : eventBoxes,
        onStateChange: patchBoxState,
        onDelete: removeBox,
        onUpdate: updateBoxLocal,
        onOpenOption: setOptionBox,
        onReorder: (id: number, idx: number) => reorderBox(id, idx, type),
        onReorderTask: reorderTask,
        isTaskDragging,
        taskDraggingBoxId,
        onTaskDragChange: handleTaskDragChange,
    });

    const [sampleLoading, setSampleLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    return (
        <div className="app" onClick={() => new Audio().play().catch(() => {
        })}>
            <Topbar
                clockStr={clockStr}
                dateStr={dateStr}
                onNewBoard={createNewBoard}
                onLoadBoard={handleLoadClick}
                onResetBoard={async () => {
                    setResetLoading(true);
                    await resetBoard();
                    setResetLoading(false);
                }}
                onLogout={onLogout}
            />

            {loading ? (
                <div className="loading-state">
                    <i className="ti ti-loader-2 spin" aria-hidden="true" />
                    <span>보드를 불러오는 중...</span>
                </div>
            ) : currentBoard ? (
                <div className="board-content">
                    <LeftSidebar
                        currentBoardId={currentBoard.boardId}
                        allBoards={allBoards}
                        deletingBoardId={deletingBoardId}
                        onLoadBoard={loadBoard}
                        onDeleteBoard={handleDeleteBoard}
                        onNewBoard={createNewBoard}
                        {...allBoxesStats}
                        alarms={alarmToasts}
                        onDismissAlarm={handleCloseToast}
                        allBoxes={allBoxes}
                    />
                    <div className="board-inner">
                        <div className="board-grid">
                            <BoardColumn {...columnProps('ROUTINE')} />
                            <BoardColumn {...columnProps('EVENT')} />
                        </div>
                    </div>
                    <aside className={`task-sidebar ${theme}`}>
                        <TaskPool
                            boardId={currentBoard.boardId}
                            onBoxCreated={addBox}
                            usedTaskIds={usedTaskIds}
                        />
                    </aside>
                </div>
            ) : (
                <div className="no-board-overlay">
                    <div className="no-board-card">
                        <div className="no-board-icon">
                            <i className="ti ti-note" aria-hidden="true" />
                        </div>
                        <div className="no-board-title">첫 보드를 만들어 보세요</div>
                        <div className="no-board-desc">
                            새 보드를 만들어 오늘의 할 일을<br />정리해보세요.
                        </div>
                        <button className="no-board-btn" onClick={handleStart}>START</button>
                    </div>
                </div>
            )}

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

            {/* 샘플 보드 적용 팝업 */}
            <Modal
                open={sampleConfirmOpen}
                title="샘플로 시작할까요?"
                onClose={() => {
                    if (!sampleLoading) setSampleConfirmOpen(false);
                }}
                width={320}
            >
                {sampleLoading ? (
                    <div className="sample-loading">
                        <i className="ti ti-loader-2 spin" />
                        <span>샘플 보드를 만드는 중이에요...</span>
                    </div>
                ) : (
                    <>
                        <p className="confirm-msg">나이트 근무용 샘플 사용해 보실래요?</p>
                        <div className="confirm-actions">
                            <button className="confirm-btn secondary"
                                onClick={() => setSampleConfirmOpen(false)}>
                                아니오
                            </button>
                            <button className="confirm-btn primary"
                                onClick={async () => {
                                    setSampleLoading(true);
                                    await applySample();
                                    setSampleLoading(false);
                                    setSampleConfirmOpen(false);
                                }}>
                                예
                            </button>
                        </div>
                    </>
                )}
            </Modal>
<BoardModals
                loadModalOpen={loadModalOpen}
                onCloseLoadModal={() => setLoadModalOpen(false)}
                allBoards={allBoards}
                deletingBoardId={deletingBoardId}
                onLoadBoard={loadBoard}
                onDeleteBoard={handleDeleteBoard}
                resetLoading={resetLoading}
            />
            <AlarmToastList toasts={alarmToasts} onClose={handleCloseToast} />
        </div>
    );
}
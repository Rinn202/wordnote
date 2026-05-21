import { useBoardApp } from '../hooks/useBoardApp';
import AlarmToastList from '../components/common/AlarmToast';
import Topbar from '../components/layout/Topbar';
import RoutineBoard from '../components/board/RoutineBoard';
import EventBoard from '../components/board/EventBoard';
import TaskPool from '../components/task/TaskPool';
import BoxOptionPanel from '../components/box/BoxOptionPanel';
import BoardModals from '../components/common/BoardModals';
import LeftSidebar from '../components/layout/LeftSidebar';
import type { Box } from '../types';
import { getTimeTheme } from '../components/layout/getTimeTheme';

export default function BoardApp({ onLogout }: { onLogout: () => void }) {

    const {
        currentBoard,
        boardActions: {
            loading, loadBoard, createNewBoard, resetBoard,
            patchBoxState, removeBox, reorderBox,
            updateBoxLocal, reorderTask, addBox,
        },
        boards: { allBoards, loadModalOpen, setLoadModalOpen, deletingBoardId, handleLoadClick, handleDeleteBoard },
        clockStr, dateStr,
        optionBox, setOptionBox,
        newBoardConfirmOpen, setNewBoardConfirmOpen,
        alarmToasts, allBoxes, allBoxesStats,
        handleCloseToast, handleNewBoardClick,
        isTaskDragging, taskDraggingBoxId, handleTaskDragChange,
    } = useBoardApp();

    const routineBoxes = currentBoard?.boxes.filter((b: Box) => b.boxType === 'ROUTINE') ?? [];
    const eventBoxes = currentBoard?.boxes.filter((b: Box) => b.boxType === 'EVENT') ?? [];
    const usedTaskIds = allBoxes.flatMap(b => b.tasks.map(t => t.taskId));
    const theme = getTimeTheme();

    return (
            <div className="app" onClick={() => {
                const audio = new Audio();
                audio.play().catch(() => { });
            }}>
            <Topbar
                clockStr={clockStr}
                dateStr={dateStr}
                alarmCount={allBoxesStats.alarm}
                onNewBoard={handleNewBoardClick}
                onLoadBoard={handleLoadClick}
                onResetBoard={resetBoard}
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
                        onNewBoard={handleNewBoardClick}
                        boardId={currentBoard.boardId}
                        total={allBoxes.length}
                        {...allBoxesStats}
                        alarms={alarmToasts}
                        onDismissAlarm={handleCloseToast}
                        allBoxes={allBoxes}
                    />
                    <div className="board-inner">
                        <div className="board-grid">
                            <RoutineBoard
                                boxes={routineBoxes}
                                onStateChange={patchBoxState}
                                onDelete={removeBox}
                                onUpdate={updateBoxLocal}
                                onOpenOption={setOptionBox}
                                onReorder={(id, idx) => reorderBox(id, idx, 'ROUTINE')}
                                onReorderTask={reorderTask}
                                isTaskDragging={isTaskDragging}
                                taskDraggingBoxId={taskDraggingBoxId}
                                onTaskDragChange={handleTaskDragChange}
                            />
                            <EventBoard
                                boxes={eventBoxes}
                                onStateChange={patchBoxState}
                                onDelete={removeBox}
                                onUpdate={updateBoxLocal}
                                onOpenOption={setOptionBox}
                                onReorder={(id, idx) => reorderBox(id, idx, 'EVENT')}
                                onReorderTask={reorderTask}
                                isTaskDragging={isTaskDragging}
                                taskDraggingBoxId={taskDraggingBoxId}
                                onTaskDragChange={handleTaskDragChange}
                            />
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
            ) : null}

            {!loading && !currentBoard && (
                <div className="no-board-overlay">
                    <div className="no-board-card">
                        <div className="no-board-icon">
                            <i className="ti ti-note" aria-hidden="true" />
                        </div>
                        <div className="no-board-title">첫 보드를 만들어 보세요</div>
                        <div className="no-board-desc">
                            새 보드를 만들어 오늘의 할 일을<br />정리해보세요.
                        </div>
                        <button className="no-board-btn" onClick={createNewBoard}>
                            START
                        </button>
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

            <BoardModals
                loadModalOpen={loadModalOpen}
                onCloseLoadModal={() => setLoadModalOpen(false)}
                allBoards={allBoards}
                deletingBoardId={deletingBoardId}
                onLoadBoard={loadBoard}
                onDeleteBoard={handleDeleteBoard}
                newBoardConfirmOpen={newBoardConfirmOpen}
                onCloseNewBoardConfirm={() => setNewBoardConfirmOpen(false)}
                onDiscardAndNew={() => {
                    createNewBoard();
                    setNewBoardConfirmOpen(false);
                }}
                onSaveAndNew={async () => {
                    await createNewBoard();
                    setNewBoardConfirmOpen(false);
                }}
            />

            <AlarmToastList toasts={alarmToasts} onClose={handleCloseToast} />
        </div>
    );
}
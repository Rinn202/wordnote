import {useBoardApp} from '../hooks/useBoardApp';
import AlarmToastList from '../components/common/AlarmToast';
import Topbar from '../components/layout/Topbar';
import Footer from '../components/layout/Footer';
import RoutineBoard from '../components/board/RoutineBoard';
import EventBoard from '../components/board/EventBoard';
import TaskPool from '../components/task/TaskPool';
import BoxOptionPanel from '../components/box/BoxOptionPanel';
import BoardModals from '../components/common/BoardModals';

export default function BoardApp({onLogout}: { onLogout: () => void }) {
    const {
        currentBoard,
        boardActions: {
            loading,
            loadBoard,
            createNewBoard,
            resetBoard,
            patchBoxState,
            removeBox,
            reorderBox,
            updateBoxLocal,
            addBox
        },
        boards: {allBoards, loadModalOpen, setLoadModalOpen, deletingBoardId, handleLoadClick, handleDeleteBoard},
        clockStr, dateStr,
        optionBox, setOptionBox,
        newBoardConfirmOpen, setNewBoardConfirmOpen,
        alarmToasts, allBoxes, allBoxesStats,
        handleCloseToast, handleNewBoardClick,
    } = useBoardApp();

    const routineBoxes = currentBoard?.boxes.filter(b => b.boxType === 'ROUTINE') ?? [];
    const eventBoxes = currentBoard?.boxes.filter(b => b.boxType === 'EVENT') ?? [];

    return (
        <div className="app">
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
                    <i className="ti ti-loader-2 spin" aria-hidden="true"/>
                    <span>보드를 불러오는 중...</span>
                </div>
            ) : currentBoard ? (
                <div style={{
                    padding: '12px',
                    background: 'var(--bg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        background: 'transparent',
                        borderRadius: '5px',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                        flex: 1,
                        display: 'grid',
                        gridTemplateColumns: '1fr 20%'
                    }}>
                        <main className="boards-area">
                            <RoutineBoard boxes={routineBoxes} onStateChange={patchBoxState} onDelete={removeBox}
                                          onUpdate={updateBoxLocal} onOpenOption={setOptionBox}
                                          onReorder={(id, idx) => reorderBox(id, idx, 'ROUTINE')}/>
                            <EventBoard boxes={eventBoxes} onStateChange={patchBoxState} onDelete={removeBox}
                                        onUpdate={updateBoxLocal} onOpenOption={setOptionBox}
                                        onReorder={(id, idx) => reorderBox(id, idx, 'EVENT')}/>
                        </main>
                        <aside className="task-sidebar" style={{borderLeft: '1px solid var(--border)'}}>
                            <TaskPool boardId={currentBoard.boardId} onBoxCreated={addBox}/>
                        </aside>
                    </div>
                    <Footer boardId={currentBoard.boardId} total={allBoxes.length} {...allBoxesStats} />
                </div>
            ) : null}

            {optionBox && (
                <div className="side-panel-overlay" onClick={() => setOptionBox(null)}>
                    <div className="side-panel" onClick={e => e.stopPropagation()}>
                        <BoxOptionPanel box={optionBox} onClose={() => setOptionBox(null)} onUpdate={box => {
                            updateBoxLocal(box);
                            setOptionBox(null);
                        }}/>
                    </div>
                </div>
            )}

            <BoardModals
                loadModalOpen={loadModalOpen} onCloseLoadModal={() => setLoadModalOpen(false)}
                allBoards={allBoards} deletingBoardId={deletingBoardId}
                onLoadBoard={loadBoard} onDeleteBoard={handleDeleteBoard}
                newBoardConfirmOpen={newBoardConfirmOpen} onCloseNewBoardConfirm={() => setNewBoardConfirmOpen(false)}
                onDiscardAndNew={() => {
                    createNewBoard();
                    setNewBoardConfirmOpen(false);
                }}
                onSaveAndNew={async () => {
                    await createNewBoard();
                    setNewBoardConfirmOpen(false);
                }}
            />

            <AlarmToastList toasts={alarmToasts} onClose={handleCloseToast}/>
        </div>
    );
}
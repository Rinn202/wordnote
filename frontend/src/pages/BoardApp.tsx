import {useBoardApp} from '../hooks/useBoardApp';
import AlarmToastList from '../components/common/AlarmToast';
import Topbar from '../components/layout/Topbar';
import Footer from '../components/layout/Footer';
import RoutineBoard from '../components/board/RoutineBoard';
import EventBoard from '../components/board/EventBoard';
import TaskPool from '../components/task/TaskPool';
import BoxOptionPanel from '../components/box/BoxOptionPanel';
import BoardModals from '../components/common/BoardModals';
import BoardSidebar from '../components/layout/BoardSidebar';
import type {Box} from '../types';

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

    const routineBoxes = currentBoard?.boxes.filter((b: Box) => b.boxType === 'ROUTINE') ?? [];
    const eventBoxes = currentBoard?.boxes.filter((b: Box) => b.boxType === 'EVENT') ?? [];
    const usedTaskIds = allBoxes.flatMap(b => b.tasks.map(t => t.taskId));

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
                    display: 'flex',
                    flex: 1,
                    overflow: 'hidden',
                    maxWidth: '1500px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <BoardSidebar
                        currentBoardId={currentBoard.boardId}
                        allBoards={allBoards}
                        deletingBoardId={deletingBoardId}
                        onLoadBoard={loadBoard}
                        onDeleteBoard={handleDeleteBoard}
                        onNewBoard={handleNewBoardClick}
                    />
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                        <div style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            overflow: 'hidden',
                            flex: 1,
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr'
                        }}>
                            <RoutineBoard boxes={routineBoxes} onStateChange={patchBoxState} onDelete={removeBox}
                                          onUpdate={updateBoxLocal} onOpenOption={setOptionBox}
                                          onReorder={(id, idx) => reorderBox(id, idx, 'ROUTINE')}/>
                            <EventBoard boxes={eventBoxes} onStateChange={patchBoxState} onDelete={removeBox}
                                        onUpdate={updateBoxLocal} onOpenOption={setOptionBox}
                                        onReorder={(id, idx) => reorderBox(id, idx, 'EVENT')}/>
                        </div>
                        <Footer boardId={currentBoard.boardId} total={allBoxes.length} {...allBoxesStats} />
                    </div>
                    <aside className="task-sidebar"
                           style={{width: '250px', borderLeft: '1px solid var(--border)', flexShrink: 0}}>
                        <TaskPool
                            boardId={currentBoard.boardId}
                            onBoxCreated={addBox}
                            usedTaskIds={usedTaskIds}
                        />
                    </aside>
                </div>
            ) : null}

            {!loading && !currentBoard && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(40,36,30,0.72)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'var(--surface2)',
                        border: '1.5px dashed var(--border2)',
                        borderRadius: '44px',
                        padding: '44px 52px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        textAlign: 'center',
                        animation: 'popIn .3s cubic-bezier(.34,1.56,.64,1)'
                    }}>
                        <div style={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            background: '#fffbea',
                            border: '1.8px solid #f9c74f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            color: '#f9c74f'
                        }}>
                            <i className="ti ti-note" aria-hidden="true"/>
                        </div>
                        <div style={{
                            fontFamily: 'GowunBatang, serif',
                            fontSize: 18,
                            fontWeight: 700,
                            color: 'var(--text)',
                            letterSpacing: '.01em',
                            lineHeight: 1.5
                        }}>
                            첫 보드를 만들어 보세요
                        </div>
                        <div style={{
                            fontFamily: 'GowunBatang, serif',
                            fontSize: 13,
                            color: 'var(--text3)',
                            lineHeight: 1.7
                        }}>
                            새 보드를 만들어 오늘의 할 일을<br/>정리해보세요.
                        </div>
                        <button onClick={createNewBoard} style={{
                            marginTop: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            fontFamily: 'PyeongchangPeace, serif',
                            fontSize: 17,
                            fontWeight: 700,
                            padding: '13px 32px',
                            borderRadius: 999,
                            border: '2px solid #f9c74f',
                            background: '#ffdc43',
                            color: '#b07d00',
                            cursor: 'pointer',
                            letterSpacing: '.04em',
                            transition: 'transform .15s'
                        }}>
                            START
                        </button>
                    </div>
                </div>
            )}

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
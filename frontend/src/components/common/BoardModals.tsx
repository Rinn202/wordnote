import type {Board} from '../../types';
import Modal from '../common/Modal';

interface Props {
    loadModalOpen: boolean;
    onCloseLoadModal: () => void;
    allBoards: Board[];
    deletingBoardId: number | null;
    onLoadBoard: (boardId: number) => void;
    onDeleteBoard: (boardId: number, e: React.MouseEvent) => void;
    newBoardConfirmOpen: boolean;
    onCloseNewBoardConfirm: () => void;
    onDiscardAndNew: () => void;
    onSaveAndNew: () => Promise<void>;
}

export default function BoardModals({
                                        loadModalOpen, onCloseLoadModal,
                                        allBoards, deletingBoardId, onLoadBoard, onDeleteBoard,
                                        newBoardConfirmOpen, onCloseNewBoardConfirm,
                                        onDiscardAndNew, onSaveAndNew,
                                    }: Props) {
    return (
        <>
            <Modal open={loadModalOpen} title="보드 불러오기" onClose={onCloseLoadModal}>
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
                                            onLoadBoard(b.boardId);
                                            onCloseLoadModal();
                                        }}
                                    >
                                        <i className="ti ti-layout-board" aria-hidden="true"/>
                                        보드 #{b.boardId}
                                        <span className="board-list-count">{b.boxes.length}개 박스</span>
                                    </button>
                                    <button
                                        className="board-delete-btn"
                                        title="보드 삭제"
                                        disabled={deletingBoardId === b.boardId}
                                        onClick={e => onDeleteBoard(b.boardId, e)}
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

            <Modal open={newBoardConfirmOpen} title="진행 중인 보드" onClose={onCloseNewBoardConfirm} width={320}>
                <p className="confirm-msg">진행 중인 보드를 저장할까요?</p>
                <div className="confirm-actions">
                    <button className="confirm-btn secondary" onClick={onDiscardAndNew}>저장 안 함</button>
                    <button className="confirm-btn primary" onClick={onSaveAndNew}>저장 후 새 보드</button>
                </div>
            </Modal>
        </>
    );
}
import type { Board } from '../../types';
import Modal from '../common/Modal';

interface Props {
    loadModalOpen: boolean;
    onCloseLoadModal: () => void;
    allBoards: Board[];
    deletingBoardId: number | null;
    onLoadBoard: (boardId: number) => void;
    onDeleteBoard: (boardId: number, e: React.MouseEvent) => void;
    resetLoading: boolean;
}

export default function BoardModals({
    loadModalOpen, onCloseLoadModal,
    allBoards, deletingBoardId, onLoadBoard, onDeleteBoard,
    resetLoading,
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
                                    </button>
                                    <button
                                        className="board-delete-btn"
                                        title="보드 삭제"
                                        disabled={deletingBoardId === b.boardId}
                                        onClick={e => onDeleteBoard(b.boardId, e)}
                                    >
                                        {deletingBoardId === b.boardId
                                            ? <i className="ti ti-loader-2 spin" aria-hidden="true" />
                                            : <i className="ti ti-trash" aria-hidden="true" />
                                        }
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Modal>

            <Modal open={resetLoading} title="초기화 중" onClose={() => { }} width={320}>
                <div className="sample-loading">
                    <i className="ti ti-loader-2 spin" />
                    <span>잠시만 기다려주세요...</span>
                </div>
            </Modal>
        </>
    );
}
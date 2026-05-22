import Modal from './Modal';
import type {Board} from '../../types';

interface SaveLoadModalProps {
    open: boolean;
    onClose: () => void;
    boards: Board[];
    onLoad: (boardId: number) => void;
    onSave: () => Promise<void>;
}

export default function SaveLoadModal({open, onClose, boards, onLoad, onSave}: SaveLoadModalProps) {
    return (
        <Modal open={open} onClose={onClose} title="📂 보드 저장 / 불러오기" width={480}>
            <div className="modal-body">
                <button onClick={onSave} className="save-btn">💾 현재 보드 저장</button>

                <div className="option-title" style={{marginTop: 12, marginBottom: 8}}>
                    저장된 보드 목록
                </div>

                {boards.length === 0 ? (
                    <div className="modal-empty">저장된 보드가 없습니다</div>
                ) : (
                    <ul className="board-list">
                        {boards.map(b => (
                            <li key={b.boardId} onClick={() => onLoad(b.boardId)} className="board-list-item">
                                <span style={{fontSize: 16}}>📋</span>
                                <div style={{flex: 1, textAlign: 'left'}}>
                                    <div style={{fontSize: 13, fontWeight: 700, color: 'var(--text)'}}>
                                        보드 #{b.boardId}
                                    </div>
                                    <div className="board-list-count" style={{marginLeft: 0}}>
                                        {b.boxes?.length ?? 0}개 박스 포함
                                    </div>
                                </div>
                                <span className="select-chip selected">불러오기</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Modal>
    );
}
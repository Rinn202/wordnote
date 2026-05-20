import Modal from './Modal';
import '../../styles/LeftSidebar.css';

interface ConfirmModalProps {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({open, message, onConfirm, onCancel}: ConfirmModalProps) {
    return (
        <Modal open={open} onClose={onCancel} title="⚠️ 확인">
            <div className="modal-body">
                <p className="confirm-msg">
                    {message}
                </p>

                <div className="confirm-actions">
                    <button onClick={onCancel} className="confirm-btn secondary">
                        취소
                    </button>
                    <button onClick={onConfirm} className="confirm-btn primary">
                        확인
                    </button>
                </div>
            </div>
        </Modal>
    );
}
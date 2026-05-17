import Modal from './Modal';

interface ConfirmModalProps {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ open, message, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <Modal open={open} onClose={onCancel} title="⚠️ 확인">
            <p style={{ fontSize: 14, color: '#334155', margin: '0 0 20px', lineHeight: 1.6 }}>
                {message}
            </p>
            {/* 버튼들은 모달 바디 내부 하단에 배치 */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button 
                    onClick={onCancel} 
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 13 }}
                >
                    취소
                </button>
                <button 
                    onClick={onConfirm} 
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                >
                    확인
                </button>
            </div>
        </Modal>
    );
}
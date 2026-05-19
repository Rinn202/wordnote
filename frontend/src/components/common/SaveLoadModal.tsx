import Modal from './Modal'; // 프로젝트 내 모달 경로에 맞게 수정하세요
import {Board} from '../../types';

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
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <button
                    onClick={onSave}
                    style={{
                        padding: '10px 16px',
                        background: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    💾 현재 보드 저장
                </button>

                <div style={{fontSize: 12, color: '#94a3b8', fontWeight: 700, marginTop: 4}}>저장된 보드 목록</div>

                {boards.length === 0 && (
                    <div style={{fontSize: 13, color: '#cbd5e1', textAlign: 'center', padding: '20px 0'}}>
                        저장된 보드가 없습니다
                    </div>
                )}

                {boards.map(b => (
                    <div
                        key={b.boardId}
                        onClick={() => onLoad(b.boardId)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '1.5px solid #e2e8f0',
                            cursor: 'pointer',
                            background: '#f8fafc',
                            transition: 'border-color 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                        <span style={{fontSize: 20}}>📋</span>
                        <div style={{flex: 1}}>
                            <div style={{fontSize: 13, fontWeight: 700, color: '#1e293b'}}>보드 #{b.boardId}</div>
                            <div style={{fontSize: 11, color: '#94a3b8'}}>{b.boxes?.length ?? 0}개 박스 포함</div>
                        </div>
                        <span style={{fontSize: 12, color: '#0284c7', fontWeight: 600}}>불러오기</span>
                    </div>
                ))}
            </div>
        </Modal>
    );
}
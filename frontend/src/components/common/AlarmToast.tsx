import type {AlarmToast} from '../../hooks/useAlarm';

type Props = {
    toasts: AlarmToast[];
    onClose: (boxId: number) => void;
};

export default function AlarmToastList({toasts, onClose}: Props) {
    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 9999,
        }}>
            {toasts.map(toast => (
                <div key={toast.boxId} style={{
                    background: 'var(--bg, #fff)',
                    border: '0.5px solid #e0e0e0',
                    borderLeft: '3px solid #E24B4A',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    minWidth: '280px',
                    maxWidth: '340px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                    <i className="ti ti-bell-ringing" style={{
                        fontSize: '20px',
                        color: '#E24B4A',
                        flexShrink: 0,
                        marginTop: '1px',
                    }} aria-hidden="true"/>
                    <div style={{flex: 1, minWidth: 0}}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            margin: '0 0 2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>{toast.name}</p>
                        <p style={{
                            fontSize: '12px',
                            color: '#888',
                            margin: 0,
                        }}>{toast.timeLabel}</p>
                    </div>
                    <button
                        onClick={() => onClose(toast.boxId)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '18px',
                            lineHeight: 1,
                            flexShrink: 0,
                            color: '#aaa',
                        }}
                        aria-label="알람 끄기"
                    >
                        <i className="ti ti-x" aria-hidden="true"/>
                    </button>
                </div>
            ))}
        </div>
    );
}
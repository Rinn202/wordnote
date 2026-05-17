import { useState } from 'react';
import type { AlarmType, Box } from '../../types';
import { boxApi } from '../../api';
import Modal from './Modal'; // 1. 공용 모달을 임포트합니다. (경로 확인 필요)

interface Props {
    box: Box;
    onClose: () => void;
    onUpdate: (box: Box) => void;
}

const ALARM_OPTIONS: { value: AlarmType; label: string }[] = [
    { value: 'NONE', label: '없음' },
    { value: 'AT_TIME', label: '정시 알람' },
    { value: 'TEN_MINUTES_BEFORE', label: '10분 전' },
    { value: 'THIRTY_MINUTES_BEFORE', label: '30분 전' },
];

export default function BoxOptionPanel({ box, onClose, onUpdate }: Props) {
    const [alarmType, setAlarmType] = useState<AlarmType>(box.alarmType);
    const [expireTime, setExpireTime] = useState(box.expireTime?.slice(0, 5) ?? '');
    const [bookmark, setBookmark] = useState(box.bookmark);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await boxApi.patchOption(box.boxId, {
                bookmark,
                alarmType,
                expireTime: expireTime ? `${expireTime}:00` : null,
            });
            const updated = await boxApi.getById(box.boxId);
            onUpdate(updated);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        // 2. 겉단을 공용 Modal로 감싸줍니다. (open={true}로 설정해 부모가 제어하게 함)
        // 3. Modal 자체에 title과 onClose 기능이 있으므로 기존 option-header는 과감히 생략합니다.
        <Modal open={true} title={`⚙️ ${box.name} 설정`} onClose={onClose} width={420}>
            <div className="option-panel" style={{ border: 'none', padding: 0 }}> 
                <div className="option-body" style={{ paddingTop: 0 }}>
                    {/* 북마크 */}
                    <div className="option-row">
                        <label className="option-label">
                            <i className="ti ti-star" aria-hidden="true"/> 즐겨찾기
                        </label>
                        <button
                            className={`toggle-pill ${bookmark ? 'on' : ''}`}
                            onClick={() => setBookmark(b => !b)}
                        >
                            {bookmark ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* 알람 */}
                    <div className="option-row">
                        <label className="option-label">
                            <i className="ti ti-bell" aria-hidden="true"/> 알람
                        </label>
                        <div className="option-select-group">
                            {ALARM_OPTIONS.map(o => (
                                <button
                                    key={o.value}
                                    className={`select-chip ${alarmType === o.value ? 'selected' : ''}`}
                                    onClick={() => setAlarmType(o.value)}
                                >
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 만료시간 */}
                    <div className="option-row">
                        <label className="option-label">
                            <i className="ti ti-clock" aria-hidden="true"/> 만료 시간
                        </label>
                        <input
                            type="time"
                            className="time-input"
                            value={expireTime}
                            onChange={e => setExpireTime(e.target.value)}
                        />
                    </div>

                    <button className="save-btn" onClick={handleSave} disabled={saving} style={{ width: '100%', marginTop: 16 }}>
                        {saving ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
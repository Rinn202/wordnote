import {useState} from 'react';
import type {AlarmType, Box} from '../../types';
import {boxApi} from '../../api';

interface Props {
    box: Box;
    onClose: () => void;
    onUpdate: (box: Box) => void;
}

const ALARM_OPTIONS: { value: AlarmType; label: string }[] = [
    {value: 'NONE', label: '없음'},
    {value: 'AT_TIME', label: '정시 알람'},
    {value: 'TEN_MINUTES_BEFORE', label: '10분 전'},
    {value: 'THIRTY_MINUTES_BEFORE', label: '30분 전'},
];

export default function BoxOptionPanel({box, onClose, onUpdate}: Props) {
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
            // 저장 후 박스 재조회
            const updated = await boxApi.getById(box.boxId);
            onUpdate(updated);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="option-panel">
            <div className="option-header">
                <span className="option-title">{box.name}</span>
                <button className="icon-btn" onClick={onClose} aria-label="닫기">
                    <i className="ti ti-x" aria-hidden="true"/>
                </button>
            </div>

            <div className="option-body">
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

                <button className="save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? '저장 중...' : '저장'}
                </button>
            </div>
        </div>
    );
}
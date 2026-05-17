import { useState, useRef, useEffect } from 'react';
import type { AlarmType, Box } from '../../types';
import { boxApi } from '../../api';
import Modal from './Modal';

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

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1~12
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const parse24h = (hhmm: string): { hour: number; minute: number; isPm: boolean } => {
    const [h, m] = hhmm.split(':').map(Number);
    const isPm = h >= 12;
    const hour = h % 12 || 12;
    return { hour, minute: m, isPm };
};

const toExpireTime = (hour: number, minute: number, isPm: boolean): string => {
    const h24 = isPm ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// 드롭다운 컴포넌트
function TimeDropdown({
    options,
    value,
    onChange,
    format,
}: {
    options: number[];
    value: number;
    onChange: (v: number) => void;
    label: string;
    format?: (v: number) => string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const fmt = format ?? ((v: number) => String(v).padStart(2, '0'));

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // 선택된 항목으로 스크롤
    const listRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open || !listRef.current) return;
        const selected = listRef.current.querySelector('[data-selected="true"]') as HTMLElement;
        if (selected) selected.scrollIntoView({ block: 'nearest' });
    }, [open]);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '5px 8px',
                    background: open ? 'var(--surface3, var(--surface2))' : 'var(--surface2)',
                    border: '0.5px solid var(--border2)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text)',
                    fontSize: 13,
                    fontFamily: 'IBM Plex Mono, monospace',
                    cursor: 'pointer',
                    minWidth: 52,
                    justifyContent: 'space-between',
                }}
            >
                {fmt(value)}
                <i className="ti ti-chevron-down" style={{ fontSize: 11, color: 'var(--text2)' }} />
            </button>

            {open && (
                <div
                    ref={listRef}
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        zIndex: 100,
                        background: 'var(--surface)',
                        border: '0.5px solid var(--border2)',
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        maxHeight: 180,
                        overflowY: 'auto',
                        minWidth: 70,
                    }}
                >
                    {options.map(opt => (
                        <button
                            key={opt}
                            data-selected={opt === value}
                            onClick={() => { onChange(opt); setOpen(false); }}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '6px 12px',
                                background: opt === value ? 'var(--primary, #4f8ef7)' : 'transparent',
                                color: opt === value ? '#fff' : 'var(--text)',
                                border: 'none',
                                textAlign: 'left',
                                fontSize: 13,
                                fontFamily: 'IBM Plex Mono, monospace',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                                if (opt !== value) (e.currentTarget as HTMLElement).style.background = 'var(--surface2)';
                            }}
                            onMouseLeave={e => {
                                if (opt !== value) (e.currentTarget as HTMLElement).style.background = 'transparent';
                            }}
                        >
                            {fmt(opt)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function BoxOptionPanel({ box, onClose, onUpdate }: Props) {
    const [alarmType, setAlarmType] = useState<AlarmType>(box.alarmType);
    const [bookmark, setBookmark] = useState(box.bookmark);
    const [saving, setSaving] = useState(false);
    const [hasTime, setHasTime] = useState(!!box.expireTime);

    const initial = box.expireTime ? parse24h(box.expireTime.slice(0, 5)) : null;
    const [hour, setHour] = useState(initial?.hour ?? 9);
    const [minute, setMinute] = useState(initial?.minute ?? 0);
    const [isPm, setIsPm] = useState(initial?.isPm ?? false);

    const handleSave = async () => {
        const expireTime = hasTime ? toExpireTime(hour, minute, isPm) : null;
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
        <Modal open={true} title={`⚙️ ${box.name} 설정`} onClose={onClose} width={420}>
            <div className="option-panel" style={{ border: 'none', padding: 0 }}>
                <div className="option-body" style={{ paddingTop: 0 }}>

                    {/* 북마크 */}
                    <div className="option-row">
                        <label className="option-label">
                            <i className="ti ti-star" aria-hidden="true" /> 즐겨찾기
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
                            <i className="ti ti-bell" aria-hidden="true" /> 알람
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
                            <i className="ti ti-clock" aria-hidden="true" /> 만료 시간
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* 사용 여부 토글 */}
                            <button
                                className={`toggle-pill ${hasTime ? 'on' : ''}`}
                                onClick={() => setHasTime(v => !v)}
                                style={{ marginRight: 4 }}
                            >
                                {hasTime ? 'ON' : 'OFF'}
                            </button>

                            {/* 시간 선택 드롭다운 */}
                            {hasTime && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {/* 오전/오후 */}
                                    <button
                                        onClick={() => setIsPm(p => !p)}
                                        style={{
                                            padding: '5px 8px',
                                            background: 'var(--surface2)',
                                            border: '0.5px solid var(--border2)',
                                            borderRadius: 'var(--radius)',
                                            color: 'var(--text2)',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            fontFamily: 'Noto Sans KR, sans-serif',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {isPm ? '오후' : '오전'}
                                    </button>

                                    {/* 시 드롭다운 */}
                                    <TimeDropdown
                                        options={HOURS}
                                        value={hour}
                                        onChange={setHour}
                                        label="시"
                                    />

                                    <span style={{ color: 'var(--text2)', fontSize: 13 }}>:</span>

                                    {/* 분 드롭다운 */}
                                    <TimeDropdown
                                        options={MINUTES}
                                        value={minute}
                                        onChange={setMinute}
                                        label="분"
                                        format={v => String(v).padStart(2, '0')}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={saving}
                        style={{ width: '100%', marginTop: 16 }}
                    >
                        {saving ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
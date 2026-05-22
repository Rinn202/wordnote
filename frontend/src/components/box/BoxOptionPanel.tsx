import {useEffect, useRef, useState} from 'react';
import type {AlarmType, Box} from '../../types';
import {boxApi} from '../../api';
import Modal from '../common/Modal';

interface Props {
    box: Box;
    onClose: () => void;
    onUpdate: (box: Box) => void;
}

const ALARM_OPTIONS: { value: AlarmType; label: string }[] = [
    {value: 'AT_TIME', label: '정시'},
    {value: 'TEN_MINUTES_BEFORE', label: '10분 전'},
    {value: 'THIRTY_MINUTES_BEFORE', label: '30분 전'},
];

const HOURS = Array.from({length: 12}, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const parse24h = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return {hour: h % 12 || 12, minute: m, isPm: h >= 12};
};

const toExpireTime = (hour: number, minute: number, isPm: boolean): string => {
    const h24 = isPm ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

function TimeDropdown({options, value, onChange, format}: {
    options: number[];
    value: number;
    onChange: (v: number) => void;
    format?: (v: number) => string;
}) {
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const fmt = format ?? ((v: number) => String(v).padStart(2, '0'));

    useEffect(() => {
        if (!open) return;
        const handler = (e: Event) => {
            if (listRef.current?.contains(e.target as Node)) return;
            setOpen(false);
        };
        window.addEventListener('scroll', handler, true);
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [open]);

    useEffect(() => {
        if (!open || !listRef.current) return;
        (listRef.current.querySelector('[data-selected="true"]') as HTMLElement)
            ?.scrollIntoView({block: 'nearest'});
    }, [open]);

    return (
        <div ref={ref} style={{position: 'relative'}}>
            <button
                onClick={e => {
                    e.stopPropagation();
                    setRect(ref.current?.getBoundingClientRect() ?? null);
                    setOpen(o => !o);
                }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '5px 8px',
                    background: open ? 'var(--surface3, var(--surface2))' : 'var(--surface2)',
                    border: '0.5px solid var(--border2)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text)', fontSize: 13,
                    fontFamily: 'IBM Plex Mono, monospace',
                    cursor: 'pointer', minWidth: 52, justifyContent: 'space-between',
                }}
            >
                {fmt(value)}
                <i className="ti ti-chevron-down" style={{fontSize: 11, color: 'var(--text2)'}}/>
            </button>

            {open && (
                <>
                    <div style={{position: 'fixed', inset: 0, zIndex: 9998}} onClick={() => setOpen(false)}/>
                    <div ref={listRef} style={{
                        position: 'fixed',
                        top: rect ? rect.bottom + 4 : 0,
                        left: rect ? rect.left : 0,
                        zIndex: 9999,
                        background: 'var(--surface)',
                        border: '0.5px solid var(--border2)',
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        maxHeight: 180, overflowY: 'auto', minWidth: 70,
                    }}>
                        {options.map(opt => (
                            <button
                                key={opt}
                                data-selected={opt === value}
                                onClick={() => {
                                    onChange(opt);
                                    setOpen(false);
                                }}
                                style={{
                                    display: 'block', width: '100%', padding: '6px 12px',
                                    background: opt === value ? 'var(--routine)' : 'transparent',
                                    color: opt === value ? '#fff' : 'var(--text)',
                                    border: 'none', textAlign: 'left', fontSize: 13,
                                    fontFamily: 'IBM Plex Mono, monospace', cursor: 'pointer',
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
                </>
            )}
        </div>
    );
}

export default function BoxOptionPanel({box, onClose, onUpdate}: Props) {
    const hasInitialTime = !!box.expireTime && box.expireTime !== '00:00:00';
    const initial = hasInitialTime ? parse24h(box.expireTime!.slice(0, 5)) : null;

    const [alarmType, setAlarmType] = useState<AlarmType | null>(
        hasInitialTime && box.alarmType !== 'NONE' ? box.alarmType : null
    );
    const [bookmark, setBookmark] = useState(box.bookmark);
    const [hasTime, setHasTime] = useState(hasInitialTime);
    const [saving, setSaving] = useState(false);
    const [hour, setHour] = useState(initial?.hour ?? 9);
    const [minute, setMinute] = useState(initial?.minute ?? 0);
    const [isPm, setIsPm] = useState(initial?.isPm ?? false);

    const handleSave = async () => {
        const expireTime = hasTime ? toExpireTime(hour, minute, isPm) : null;
        setSaving(true);
        try {
            await boxApi.patchOption(box.boxId, {
                bookmark,
                alarmType: alarmType ?? 'NONE',
                expireTime: expireTime ? `${expireTime}:00` : null,
            });
            onUpdate(await boxApi.getById(box.boxId));
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={true} title={`⚙️ ${box.name} 설정`} onClose={onClose} width={420}>
            <div className="option-panel" style={{border: 'none', padding: 0}}>
                <div className="option-body" style={{paddingTop: 0}}>

                    <div className="option-row">
                        <label className="option-label">
                            <i className="ti ti-star" aria-hidden="true"/> 즐겨찾기
                        </label>
                        <button className={`toggle-pill ${bookmark ? 'on' : ''}`} onClick={() => setBookmark(b => !b)}>
                            {bookmark ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div className="option-row">
                        <label className="option-label">
                            <i className="ti ti-clock" aria-hidden="true"/> 만료 시간
                        </label>
                        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                            <button
                                className={`toggle-pill ${hasTime ? 'on' : ''}`}
                                onClick={() => setHasTime(v => {
                                    if (v) setAlarmType(null);
                                    return !v;
                                })}
                                style={{marginRight: 4}}
                            >
                                {hasTime ? 'ON' : 'OFF'}
                            </button>
                            {hasTime && (
                                <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                                    <button
                                        onClick={() => setIsPm(p => !p)}
                                        style={{
                                            padding: '5px 8px', background: 'var(--surface2)',
                                            border: '0.5px solid var(--border2)', borderRadius: 'var(--radius)',
                                            color: 'var(--text2)', fontSize: 12, cursor: 'pointer',
                                            fontFamily: 'Noto Sans KR, sans-serif', whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {isPm ? '오후' : '오전'}
                                    </button>
                                    <TimeDropdown options={HOURS} value={hour} onChange={setHour}/>
                                    <span style={{color: 'var(--text2)', fontSize: 13}}>:</span>
                                    <TimeDropdown options={MINUTES} value={minute} onChange={setMinute}
                                                  format={v => String(v).padStart(2, '0')}/>
                                </div>
                            )}
                        </div>
                    </div>

                    {hasTime && (
                        <div className="option-row">
                            <label className="option-label">
                                <i className="ti ti-bell" aria-hidden="true"/> 알람 목록
                            </label>
                            <div className="option-alarm-group">
                                {ALARM_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`select-chip ${alarmType === opt.value ? 'selected' : ''}`}
                                        onClick={() => setAlarmType(prev => prev === opt.value ? null : opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button className="save-btn" onClick={handleSave} disabled={saving}
                            style={{width: '100%', marginTop: 16}}>
                        {saving ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
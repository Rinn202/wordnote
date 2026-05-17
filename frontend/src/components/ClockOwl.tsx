import React, {useEffect, useState} from 'react';
import {getTimeOfDay, type TimeOfDay} from '../types';

// 현재는 텍스트/이모지로 임시 적용 — 추후 이미지로 교체
const CHARACTER: Record<TimeOfDay, { emoji: string; label: string; desc: string }> = {
    day: {emoji: '🐦', label: '참새', desc: '좋은 아침이에요!'},
    evening: {emoji: '🐦‍⬛', label: '까치', desc: '오후도 파이팅!'},
    night: {emoji: '🦉', label: '부엉이', desc: '야간 근무 중이에요.'},
};

interface Props {
    // 이미지 경로를 나중에 주입할 수 있도록 optional
    imageSrc?: Partial<Record<TimeOfDay, string>>;
}

export default function ClockOwl({imageSrc}: Props) {
    const [hour, setHour] = useState(new Date().getHours());

    useEffect(() => {
        const id = setInterval(() => setHour(new Date().getHours()), 60_000);
        return () => clearInterval(id);
    }, []);

    const tod = getTimeOfDay(hour);
    const char = CHARACTER[tod];
    const src = imageSrc?.[tod];

    return (
        <div className="clock-owl" title={char.desc}>
            {src
                ? <img src={src} alt={char.label} className="clock-owl-img"/>
                : <span className="clock-owl-emoji" role="img" aria-label={char.label}>{char.emoji}</span>
            }
            <span className="clock-owl-label">{char.label}</span>
        </div>
    );
}
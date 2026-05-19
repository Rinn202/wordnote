import {useEffect, useRef} from 'react';
import type {Box} from '../types';

export type AlarmToast = {
    boxId: number;
    name: string;
    timeLabel: string;
};

export function useAlarm(boxes: Box[], onAlarm: (toast: AlarmToast) => void) {
    const audioRef = useRef<HTMLAudioElement>(new Audio(localStorage.getItem('alarmFile') ?? '/alarm.mp3'));
    const firedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        audioRef.current.loop = true;
    }, []);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    useEffect(() => {
        const check = () => {
            const now = new Date();
            const hh = now.getHours().toString().padStart(2, '0');
            const mm = now.getMinutes().toString().padStart(2, '0');
            const ss = now.getSeconds().toString().padStart(2, '0');
            const nowStr = `${hh}:${mm}:${ss}`;
            const nowMinutes = now.getHours() * 60 + now.getMinutes();

            boxes.forEach(box => {
                if (!box.expireTime || box.state === 'DONE') return;
                if (box.alarmType === 'NONE') return;

                const [eh, em] = box.expireTime.split(':').map(Number);
                const expireMinutes = eh * 60 + em;

                let triggerMinutes = expireMinutes;
                if (box.alarmType === 'TEN_MINUTES_BEFORE') triggerMinutes = expireMinutes - 10;
                if (box.alarmType === 'THIRTY_MINUTES_BEFORE') triggerMinutes = expireMinutes - 30;
                if (box.alarmType === 'ONE_HOUR_BEFORE') triggerMinutes = expireMinutes - 60;

                const key = `${box.boxId}-${box.alarmType}`;

                if (nowMinutes === triggerMinutes && now.getSeconds() < 10 && !firedRef.current.has(key)) {
                    firedRef.current.add(key);
                    audioRef.current.play().catch(() => {
                    });
                    onAlarm({
                        boxId: box.boxId,
                        name: box.name,
                        timeLabel: box.alarmType === 'AT_TIME'
                            ? `${box.expireTime.slice(0, 5)} 알람`
                            : box.alarmType === 'TEN_MINUTES_BEFORE'
                                ? `${box.expireTime.slice(0, 5)} 10분 전`
                                : box.alarmType === 'THIRTY_MINUTES_BEFORE'
                                    ? `${box.expireTime.slice(0, 5)} 30분 전`
                                    : `${box.expireTime.slice(0, 5)} 1시간 전`,
                    });
                }

                // 자정 넘기면 fired 초기화
                if (nowStr === '00:00:00') {
                    firedRef.current.clear();
                }
            });
        };

        const interval = setInterval(check, 1000);
        return () => clearInterval(interval);
    }, [boxes, onAlarm]);

    return {stopAudio};
}
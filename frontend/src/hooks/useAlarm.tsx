import {useEffect, useRef} from 'react';
import type {Box} from '../types';

export type AlarmToast = {
    boxId: number;
    name: string;
    timeLabel: string;
};

const ALARM_OFFSET: Record<string, number> = {
    AT_TIME: 0,
    TEN_MINUTES_BEFORE: -10,
    THIRTY_MINUTES_BEFORE: -30,
    ONE_HOUR_BEFORE: -60,
};

const ALARM_LABEL: Record<string, string> = {
    AT_TIME: '알람',
    TEN_MINUTES_BEFORE: '10분 전',
    THIRTY_MINUTES_BEFORE: '30분 전',
    ONE_HOUR_BEFORE: '1시간 전',
};

export function useAlarm(boxes: Box[], onAlarm: (toast: AlarmToast) => void) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const firedRef = useRef<Set<string>>(new Set());
    const onAlarmRef = useRef(onAlarm);

    // onAlarm 최신 참조 유지 (의존성 배열에서 제거하기 위해)
    useEffect(() => {
        onAlarmRef.current = onAlarm;
    }, [onAlarm]);

    // Audio 초기화 - 렌더 바디가 아닌 최초 1회만
    useEffect(() => {
        if (audioRef.current === null) {
            const src = localStorage.getItem('alarmFile') ?? '/alarm.mp3';
            audioRef.current = new Audio(src);
            audioRef.current.loop = true;
        }
    }, []);

    const stopAudio = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
    };

    useEffect(() => {
        const check = () => {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const isMidnight =
                now.getHours() === 0 &&
                now.getMinutes() === 0 &&
                now.getSeconds() === 0;

            if (isMidnight) firedRef.current.clear();

            boxes.forEach(box => {
                if (!box.expireTime || box.state === 'DONE' || box.alarmType === 'NONE') return;

                const [eh, em] = box.expireTime.split(':').map(Number);
                const triggerMinutes = eh * 60 + em + (ALARM_OFFSET[box.alarmType] ?? 0);
                const key = `${box.boxId}-${box.alarmType}`;

                if (
                    nowMinutes === triggerMinutes &&
                    now.getSeconds() < 10 &&
                    !firedRef.current.has(key)
                ) {
                    firedRef.current.add(key);
                    audioRef.current?.play().catch(() => {});
                    onAlarmRef.current({
                        boxId: box.boxId,
                        name: box.name,
                        timeLabel: `${box.expireTime.slice(0, 5)} ${ALARM_LABEL[box.alarmType] ?? ''}`,
                    });
                }
            });
        };

        const interval = setInterval(check, 1000);
        return () => clearInterval(interval);
    }, [boxes]); // onAlarm 제거 - ref로 최신값 참조

    return {stopAudio};
}
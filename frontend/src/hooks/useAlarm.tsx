import {useEffect, useRef} from 'react';
import type {Box} from '../types';

export type AlarmToast = {
    boxId: number;
    name: string;
    timeLabel: string;
};

export function useAlarm(boxes: Box[], onAlarm: (toast: AlarmToast) => void) {
    const audioRef = useRef<HTMLAudioElement>(new Audio('/alarm.mp3'));
    const firedRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        audioRef.current.loop = true;
    }, []);

    useEffect(() => {
        const audio = new Audio('/alarm.mp3');
        audio.loop = true; // ✅ 끌 때까지 반복
        audioRef.current = audio;
        console.log('audio 초기화됨', audio); // ← 이거 추가
    }, []);

    // 오디오 인스턴스를 외부에서 멈출 수 있도록 노출
    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };


    return {stopAudio};
}
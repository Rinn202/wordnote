import {useEffect, useState} from 'react';

export function useClock() {
    const [clock, setClock] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const pad = (n: number) => String(n).padStart(2, '0');
    const clockStr = `${pad(clock.getHours())}:${pad(clock.getMinutes())}`;
    const dateStr = clock.toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    });

    return {clockStr, dateStr};
}
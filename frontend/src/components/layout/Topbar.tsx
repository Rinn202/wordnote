import {useNavigate} from 'react-router-dom';
import {useEffect, useRef, useState} from 'react';
import {useTopbarTheme} from './useTopbarTheme';
import {noticeApi} from '../../api/notice';
import type {Notice} from '../../types';

const Marquee = 'marquee' as any;

interface Props {
    clockStr: string;
    dateStr: string;
    onNewBoard: () => void;
    onLoadBoard: () => void;
    onResetBoard: () => void;
    onLogout: () => void;
}

export default function Topbar({clockStr, dateStr, onNewBoard, onLoadBoard, onResetBoard, onLogout}: Props) {
    const navigate = useNavigate();
    const topbarRef = useRef<HTMLElement>(null);
    const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
    const isAdmin = localStorage.getItem('role') === 'ADMIN';
    
    

    useTopbarTheme(topbarRef);

    useEffect(() => {
        noticeApi.getAll().then(list => setLatestNotice(list[0] ?? null)).catch(console.error);
    }, []);

    const actions = [
        {icon: 'ti-user', title: '마이페이지', onClick: () => navigate('/member/mypage')},
        ...(isAdmin ? [{icon: 'ti-news', title: '공지 관리', onClick: () => navigate('/notice')}] : []),
        {icon: 'ti-plus', title: '새 보드', onClick: onNewBoard},
        {icon: 'ti-folder-open', title: '보드 불러오기', onClick: onLoadBoard},
        {icon: 'ti-refresh', title: '보드 리셋', onClick: onResetBoard},
        {icon: 'ti-logout', title: '로그아웃', onClick: onLogout},
    ];

    return (
        <header ref={topbarRef} className="topbar">
            <div className="logo-area">
                <span className="logo">오늘 하루</span>
            </div>

            <div className="topbar-divider"/>

            <div className="topbar-clock-area">
                <span className="topbar-clock">{clockStr}</span>
                <span className="topbar-date">{dateStr}</span>
            </div>

            <div className="topbar-notice">
                <i className="ti ti-speakerphone" aria-hidden="true"/>
                <Marquee scrollamount="2" className="topbar-notice-marquee">
                    {latestNotice ? `[공지] ${latestNotice.title} : ${latestNotice.content}` : '공지사항 없음'}
                </Marquee>
            </div>

            <div className="topbar-actions">
                {actions.map(({icon, title, onClick}) => (
                    <button key={title} className="icon-btn" title={title} onClick={onClick}>
                        <i className={`ti ${icon}`} aria-hidden="true"/>
                    </button>
                ))}
            </div>
        </header>
    );
}
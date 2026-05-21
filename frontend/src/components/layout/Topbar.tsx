import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useTopbarTheme } from './useTopbarTheme';
import { noticeApi } from '../../api/noticeApi';
import type { Notice } from '../../types';

interface Props {
    clockStr: string;
    dateStr: string;
    alarmCount: number;
    onNewBoard: () => void;
    onLoadBoard: () => void;
    onResetBoard: () => void;
    onLogout: () => void;
}

export default function Topbar({
    clockStr,
    dateStr,
    onNewBoard,
    onLoadBoard,
    onResetBoard,
    onLogout,
}: Props) {
    const navigate = useNavigate();

    const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
    const isAdmin = localStorage.getItem('role') === 'ADMIN';

    useEffect(() => {
        noticeApi.getAll()
            .then(list => setLatestNotice(list[0] ?? null))
            .catch(console.error);
    }, []);

    const topbarRef = useRef<HTMLElement>(null);
    useTopbarTheme(topbarRef);

    const Marquee = 'marquee' as any;

    return (
        <header ref={topbarRef} className="topbar">
            {/* 로고 */}
            <div className="logo-area">
                <span className="logo">오늘 하루</span>
            </div>

            <div className="topbar-divider" />

            {/* 시간 / 날짜 */}
            <div className="topbar-clock-area">
                <span className="topbar-clock">{clockStr}</span>
                <span className="topbar-date">{dateStr}</span>
            </div>

            {/* 공지 */}
            <div className="topbar-notice" onClick={() => navigate('/notice')} style={{ cursor: 'pointer' }}>
                <i className="ti ti-speakerphone" aria-hidden="true" />
                <Marquee scrollamount="2" className="topbar-notice-marquee">
                    {latestNotice ? `[공지] ${latestNotice.title} : ${latestNotice.content}` : '공지사항 없음'}
                </Marquee>
            </div>

            {/* 우측 메뉴 */}
            <div className="topbar-actions">
                <button
                    className="icon-btn"
                    title="마이페이지"
                    onClick={() => navigate('/member/mypage')}
                >
                    <i className="ti ti-user" aria-hidden="true" />
                </button>

                {isAdmin && (
                    <button
                        className="icon-btn"
                        title="공지 관리"
                        onClick={() => navigate('/notice')}
                    >
                        <i className="ti ti-news" aria-hidden="true" />
                    </button>
                )}

                <button
                    className="icon-btn"
                    title="새 보드"
                    onClick={onNewBoard}
                >
                    <i className="ti ti-plus" aria-hidden="true" />
                </button>

                <button
                    className="icon-btn"
                    title="보드 불러오기"
                    onClick={onLoadBoard}
                >
                    <i className="ti ti-folder-open" aria-hidden="true" />
                </button>

                <button
                    className="icon-btn"
                    title="보드 리셋"
                    onClick={onResetBoard}
                >
                    <i className="ti ti-refresh" aria-hidden="true" />
                </button>

                <button
                    className="icon-btn"
                    title="로그아웃"
                    onClick={onLogout}
                >
                    <i className="ti ti-logout" aria-hidden="true" />
                </button>
            </div>
        </header>
    );
}
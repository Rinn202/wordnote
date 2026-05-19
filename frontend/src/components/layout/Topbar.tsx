import {useRef} from 'react';
import {useTopbarTheme} from '../../hooks/useTopbarTheme';

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
                                   clockStr, dateStr, alarmCount,
                                   onNewBoard, onLoadBoard, onResetBoard, onLogout,
                               }: Props) {
    const topbarRef = useRef<HTMLElement>(null);
    useTopbarTheme(topbarRef);

    return (
        <header className="topbar" ref={topbarRef}>
            <div className="logo-area">
                <span className="logo">daily·board</span>
            </div>

            <div className="topbar-divider"/>

            <div className="topbar-clock-area">
                <span className="topbar-clock">{clockStr}</span>
                <span className="topbar-date">{dateStr}</span>
            </div>

            <div className="topbar-notice">
                <i className="ti ti-bell" aria-hidden="true"/>
                <span>{alarmCount > 0 ? `알람 ${alarmCount}개 설정됨` : '오늘 알림 없음'}</span>
            </div>

            <div className="topbar-actions">
                <button className="icon-btn" title="마이페이지">
                    <i className="ti ti-user" aria-hidden="true"/>
                </button>
                <button className="icon-btn" title="새 보드" onClick={onNewBoard}>
                    <i className="ti ti-plus" aria-hidden="true"/>
                </button>
                <button className="icon-btn" title="보드 불러오기" onClick={onLoadBoard}>
                    <i className="ti ti-folder-open" aria-hidden="true"/>
                </button>
                <button className="icon-btn" title="보드 리셋" onClick={onResetBoard}>
                    <i className="ti ti-refresh" aria-hidden="true"/>
                </button>
                <button className="icon-btn" title="로그아웃" onClick={onLogout}>
                    <i className="ti ti-logout" aria-hidden="true"/>
                </button>
            </div>
        </header>
    );
}
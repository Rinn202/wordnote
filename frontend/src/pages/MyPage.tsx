import {useEffect, useState} from 'react';
import {memberApi} from '../api';
import type {Member} from '../types';
import '../styles/mypage.css';

const ALARM_OPTIONS = [
    {label: '기본', file: '/alarm.mp3'},
    {label: 'Cluck', file: '/cluck.mp3'},
    {label: 'Digital', file: '/digital.mp3'},
];

interface Props {
    onBack: () => void;
    onWithdraw: () => void;
}

export default function MyPage({onBack, onWithdraw}: Props) {
    const [member, setMember] = useState<Member | null>(null);
    const [password, setPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [selectedAlarm, setSelectedAlarm] = useState(
        localStorage.getItem('alarmFile') ?? '/alarm.mp3'
    );
    const [volume, setVolume] = useState(
        Number(localStorage.getItem('alarmVolume') ?? 1)
    );

    useEffect(() => {
        memberApi.mypage().then(setMember).catch(() => onBack());
    }, []);

    const handlePasswordChange = async () => {
        if (!password.trim()) return;
        await memberApi.updatePassword(password);
        setPassword('');
        setShowPasswordInput(false);
        setPasswordMsg('비밀번호가 변경되었습니다.');
        setTimeout(() => setPasswordMsg(''), 3000);
    };

    const handleAlarmSelect = (file: string) => {
        setSelectedAlarm(file);
        localStorage.setItem('alarmFile', file);
        const audio = new Audio(file);
        audio.volume = volume;
        audio.play().catch(() => {});
    };

    const handleVolumeChange = (val: number) => {
        setVolume(val);
        localStorage.setItem('alarmVolume', String(val));
    };

    const handleWithdraw = async () => {
        if (!confirm('정말 탈퇴하시겠습니까?')) return;
        await memberApi.withdraw();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('nickname');
        onWithdraw();
    };

    if (!member) return (
        <div className="mypage-loading">
            <i className="ti ti-loader-2 spin" aria-hidden="true"/>
        </div>
    );

    return (
        <div className="mypage-container">
            <div className="mypage-inner">

                {/* 헤더 */}
                <div className="mypage-header">
                    <button className="icon-btn" onClick={onBack} title="뒤로가기">
                        <i className="ti ti-arrow-left" aria-hidden="true"/>
                    </button>
                    <span className="mypage-header-title">마이페이지</span>
                </div>

                {/* 프로필 + 비밀번호 변경 */}
                <div className="mypage-card">
                    <span className="mypage-card-label">PROFILE</span>

                    <div className="mypage-profile-row">
                        {member.profileUri
                            ? <img src={member.profileUri} className="mypage-profile-img" alt="프로필"/>
                            : <div className="mypage-profile-avatar">
                                <i className="ti ti-user" aria-hidden="true"/>
                            </div>
                        }
                        <div className="mypage-profile-info">
                            <span className="mypage-profile-name">{member.nickname}</span>
                            <span className="mypage-profile-email">{member.email}</span>
                            <span className="mypage-profile-date">
                                가입일 {member.createdAt?.slice(0, 10)}
                            </span>
                        </div>
                    </div>

                    <div className="mypage-divider"/>

                    <div className="mypage-password-row">
                        <span className="mypage-password-label">비밀번호</span>
                        {!showPasswordInput ? (
                            <button
                                className="mypage-btn-secondary"
                                onClick={() => setShowPasswordInput(true)}
                            >
                                비밀번호 변경
                            </button>
                        ) : (
                            <div className="mypage-password-input-row">
                                <input
                                    type="password"
                                    placeholder="새 비밀번호"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handlePasswordChange()}
                                    autoFocus
                                    className="mypage-password-input"
                                />
                                <button className="mypage-btn-confirm" onClick={handlePasswordChange}>확인</button>
                                <button
                                    className="mypage-btn-cancel"
                                    onClick={() => {
                                        setShowPasswordInput(false);
                                        setPassword('');
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        )}
                    </div>
                    {passwordMsg && <span className="mypage-password-msg">{passwordMsg}</span>}
                </div>

                {/* 멤버 역할 */}
                <div className="mypage-card">
                    <span className="mypage-card-label">ROLE</span>
                    <span className="mypage-role-text">{member.role}</span>
                </div>

                {/* 알림음 */}
                <div className="mypage-card">
                    <span className="mypage-card-label-sm">ALARM SOUND</span>
                    <div className="mypage-alarm-chips">
                        {ALARM_OPTIONS.map(opt => (
                            <button
                                key={opt.file}
                                onClick={() => handleAlarmSelect(opt.file)}
                                className={`mypage-alarm-chip ${
                                    selectedAlarm === opt.file
                                        ? 'mypage-alarm-chip-active'
                                        : 'mypage-alarm-chip-default'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="mypage-divider"/>

                    <div className="mypage-volume-row">
                        <i
                            className={`ti ${volume === 0 ? 'ti-volume-off' : volume < 0.5 ? 'ti-volume-2' : 'ti-volume'} mypage-volume-icon`}
                            aria-hidden="true"
                        />
                        <input
                            type="range"
                            min={0} max={1} step={0.01}
                            value={volume}
                            onChange={e => handleVolumeChange(Number(e.target.value))}
                            className="mypage-volume-slider"
                        />
                        <span className="mypage-volume-label">{Math.round(volume * 100)}%</span>
                    </div>
                </div>

                {/* 회원탈퇴 */}
                <div className="mypage-withdraw-row">
                    <button className="mypage-btn-withdraw" onClick={handleWithdraw}>
                        회원탈퇴
                    </button>
                </div>

            </div>
        </div>
    );
}
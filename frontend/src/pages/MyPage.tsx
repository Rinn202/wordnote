import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {memberApi} from '../api';
import type {Member} from '../types';

const ALARM_OPTIONS = [
    {label: '기본', file: '/alarm.mp3'},
    {label: 'Cluck', file: '/cluck.mp3'},
    {label: 'Digital', file: '/digital.mp3'},
];

export default function MyPage() {
    const navigate = useNavigate();
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
        memberApi.mypage().then(setMember).catch(() => navigate('/'));
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
        audio.play().catch(() => {
        });
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
        navigate('/');
    };

    if (!member) return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
            <i className="ti ti-loader-2 spin" aria-hidden="true"/>
        </div>
    );

    return (
        <div style={{minHeight: '100vh', background: 'var(--bg)', padding: '80px 20px'}}>
            <div style={{maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 15}}>

                {/* 헤더 */}
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <button className="icon-btn" onClick={() => navigate(-1)} title="뒤로가기">
                        <i className="ti ti-arrow-left" aria-hidden="true"/>
                    </button>
                    <span style={{fontFamily: 'GowunBatang, serif', fontSize: 21, fontWeight: 700}}>마이페이지</span>
                </div>

                {/* 프로필 + 비밀번호 변경 */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}>
                    <span style={{
                        fontSize: 14,
                        fontFamily: 'IBM Plex Mono, monospace',
                        color: 'var(--text3)',
                        fontWeight: 700,
                        letterSpacing: '.08em'
                    }}>PROFILE</span>

                    {/* 프로필 정보 */}
                    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                        {member.profileUri
                            ? <img src={member.profileUri}
                                   style={{width: 52, height: 52, borderRadius: '50%', objectFit: 'cover'}} alt="프로필"/>
                            : <div style={{
                                width: 52,
                                height: 52,
                                borderRadius: '50%',
                                background: 'var(--surface2)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 23,
                                color: 'var(--text3)'
                            }}>
                                <i className="ti ti-user" aria-hidden="true"/>
                            </div>
                        }
                        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                            <span style={{
                                fontFamily: 'GowunBatang, serif',
                                fontSize: 17,
                                fontWeight: 700,
                                color: 'var(--text)'
                            }}>{member.nickname}</span>
                            <span style={{fontSize: 14, color: 'var(--text3)'}}>{member.email}</span>
                            <span style={{fontSize: 12, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace'}}>
                                가입일 {member.createdAt?.slice(0, 10)}
                            </span>
                        </div>
                    </div>

                    {/* 구분선 */}
                    <div style={{borderTop: '1px solid var(--border)', margin: '0 -24px', padding: '0 24px'}}/>

                    {/* 비밀번호 변경 */}
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8}}>
                        <span
                            style={{fontSize: 13, color: 'var(--text3)', fontFamily: 'GowunBatang, serif'}}>비밀번호</span>
                        {!showPasswordInput ? (
                            <button
                                onClick={() => setShowPasswordInput(true)}
                                style={{
                                    padding: '3px 10px',
                                    border: '1px solid var(--border2)',
                                    background: 'var(--surface2)',
                                    color: 'var(--text3)',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    fontFamily: 'GowunBatang, serif',
                                }}
                            >
                                비밀번호 변경
                            </button>
                        ) : (
                            <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                <input
                                    type="password"
                                    placeholder="새 비밀번호"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handlePasswordChange()}
                                    autoFocus
                                    style={{
                                        width: 130,
                                        fontSize: 13,
                                        padding: '3px 2px',
                                        border: 'none',
                                        borderBottom: '1px solid var(--border2)',
                                        background: 'transparent',
                                        color: 'var(--text)',
                                        outline: 'none',
                                        fontFamily: 'GowunBatang, serif',
                                    }}
                                />
                                <button
                                    onClick={handlePasswordChange}
                                    style={{
                                        padding: '3px 8px',
                                        border: '1px solid var(--brand-b)',
                                        background: 'var(--brand-bg)',
                                        color: 'var(--text3)',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        fontFamily: 'GowunBatang, serif',
                                        fontWeight: 700
                                    }}
                                >
                                    확인
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPasswordInput(false);
                                        setPassword('');
                                    }}
                                    style={{
                                        padding: '3px 7px',
                                        border: '1px solid var(--border2)',
                                        background: 'transparent',
                                        color: 'var(--text3)',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        fontFamily: 'GowunBatang, serif',
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        )}
                    </div>
                    {passwordMsg && <span style={{fontSize: 13, color: 'var(--brand-c)'}}>{passwordMsg}</span>}
                </div>

                {/* 멤버 역할 */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}>
                    <span style={{
                        fontSize: 14,
                        fontFamily: 'IBM Plex Mono, monospace',
                        color: 'var(--text3)',
                        fontWeight: 700,
                        letterSpacing: '.08em'
                    }}>ROLE</span>
                    <span style={{
                        fontSize: 15,
                        fontFamily: 'GowunBatang, serif',
                        color: 'var(--text)',
                        fontWeight: 700,
                    }}>{member.role}</span>
                </div>

                {/* 알림음 */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}>
                    <span style={{
                        fontSize: 13,
                        fontFamily: 'IBM Plex Mono, monospace',
                        color: 'var(--text3)',
                        fontWeight: 700,
                        letterSpacing: '.08em'
                    }}>ALARM SOUND</span>
                    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                        {ALARM_OPTIONS.map(opt => (
                            <button
                                key={opt.file}
                                onClick={() => handleAlarmSelect(opt.file)}
                                style={{
                                    padding: '6px 16px', borderRadius: 20,
                                    border: selectedAlarm === opt.file ? '1px solid var(--brand-b)' : '1px solid var(--border2)',
                                    background: selectedAlarm === opt.file ? 'var(--brand-bg)' : 'var(--surface2)',
                                    color: selectedAlarm === opt.file ? 'var(--brand-c)' : 'var(--text2)',
                                    cursor: 'pointer', fontSize: 13, fontFamily: 'GowunBatang, serif',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* 구분선 */}
                    <div style={{borderTop: '1px solid var(--border)', margin: '0 -24px', padding: '0 24px'}}/>

                    {/* 볼륨 */}
                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <i className={`ti ${volume === 0 ? 'ti-volume-off' : volume < 0.5 ? 'ti-volume-2' : 'ti-volume'}`}
                           style={{fontSize: 15, color: 'var(--text3)', flexShrink: 0}}
                           aria-hidden="true"/>
                        <input
                            type="range"
                            min={0} max={1} step={0.01}
                            value={volume}
                            onChange={e => handleVolumeChange(Number(e.target.value))}
                            style={{accentColor: 'var(--brand-b)', flex: 1, cursor: 'pointer', height: 1}}
                        />
                        <span style={{
                            fontSize: 13,
                            fontFamily: 'IBM Plex Mono, monospace',
                            color: 'var(--text3)',
                            minWidth: 28,
                            textAlign: 'right'
                        }}>{Math.round(volume * 100)}%</span>
                    </div>
                </div>

                {/* 회원탈퇴 */}
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button
                        onClick={handleWithdraw}
                        style={{
                            fontSize: 12,
                            color: 'var(--text3)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontFamily: 'GowunBatang, serif'
                        }}
                    >
                        회원탈퇴
                    </button>
                </div>

            </div>
        </div>
    );
}
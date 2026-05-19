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
    const [selectedAlarm, setSelectedAlarm] = useState(
        localStorage.getItem('alarmFile') ?? '/alarm.mp3'
    );

    useEffect(() => {
        memberApi.mypage().then(setMember).catch(() => navigate('/'));
    }, []);

    const handlePasswordChange = async () => {
        if (!password.trim()) return;
        await memberApi.updatePassword(password);
        setPassword('');
        setPasswordMsg('비밀번호가 변경되었습니다.');
        setTimeout(() => setPasswordMsg(''), 3000);
    };

    const handleAlarmSelect = (file: string) => {
        setSelectedAlarm(file);
        localStorage.setItem('alarmFile', file);
        new Audio(file).play().catch(() => {
        });
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
        <div style={{minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px'}}>
            <div style={{maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24}}>

                {/* 헤더 */}
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <button className="icon-btn" onClick={() => navigate(-1)} title="뒤로가기">
                        <i className="ti ti-arrow-left" aria-hidden="true"/>
                    </button>
                    <span style={{fontFamily: 'GowunBatang, serif', fontSize: 20, fontWeight: 700}}>마이페이지</span>
                </div>

                {/* 프로필 */}
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
                        fontSize: 11,
                        fontFamily: 'IBM Plex Mono, monospace',
                        color: 'var(--text3)',
                        fontWeight: 700,
                        letterSpacing: '.08em'
                    }}>PROFILE</span>
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
                                fontSize: 22,
                                color: 'var(--text3)'
                            }}>
                                <i className="ti ti-user" aria-hidden="true"/>
                            </div>
                        }
                        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                            <span style={{
                                fontFamily: 'GowunBatang, serif',
                                fontSize: 16,
                                fontWeight: 700,
                                color: 'var(--text)'
                            }}>{member.nickname}</span>
                            <span style={{fontSize: 13, color: 'var(--text3)'}}>{member.email}</span>
                            <span style={{fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace'}}>
                                가입일 {member.createdAt?.slice(0, 10)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 비밀번호 변경 */}
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
                        fontSize: 11,
                        fontFamily: 'IBM Plex Mono, monospace',
                        color: 'var(--text3)',
                        fontWeight: 700,
                        letterSpacing: '.08em'
                    }}>PASSWORD</span>
                    <div style={{display: 'flex', gap: 8}}>
                        <input
                            type="password"
                            placeholder="새 비밀번호"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handlePasswordChange()}
                            style={{
                                flex: 1,
                                fontSize: 14,
                                padding: '8px 12px',
                                border: '1px solid var(--border2)',
                                borderRadius: 8,
                                background: 'var(--surface2)',
                                color: 'var(--text)',
                                outline: 'none',
                                fontFamily: 'GowunBatang, serif'
                            }}
                        />
                        <button
                            onClick={handlePasswordChange}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid var(--done-b)',
                                background: 'var(--done-bg)',
                                color: 'var(--done-c)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 13,
                                fontFamily: 'GowunBatang, serif',
                                fontWeight: 700
                            }}
                        >
                            변경
                        </button>
                    </div>
                    {passwordMsg && <span style={{fontSize: 12, color: 'var(--done-c)'}}>{passwordMsg}</span>}
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
                        fontSize: 11,
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
                                    border: selectedAlarm === opt.file ? '1px solid var(--done-b)' : '1px solid var(--border2)',
                                    background: selectedAlarm === opt.file ? 'var(--done-bg)' : 'var(--surface2)',
                                    color: selectedAlarm === opt.file ? 'var(--done-c)' : 'var(--text2)',
                                    cursor: 'pointer', fontSize: 13, fontFamily: 'GowunBatang, serif',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
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
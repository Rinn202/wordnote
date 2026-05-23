import {type ChangeEvent, type KeyboardEvent, useRef, useState} from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://wordnote-production.up.railway.app';
const api = axios.create({baseURL: API_BASE});

interface LoginForm {
    email: string;
    password: string;
}

interface LoginProps {
    onSuccess?: () => void;
    onGoSignUp?: () => void;
}

interface FieldProps {
    label: string;
    emoji: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

function Field({label, emoji, type, placeholder, value, onChange, error, onKeyDown}: FieldProps) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
            <label style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: 5
            }}>
                <span>{emoji}</span>{label}
            </label>
            <input
                type={type} placeholder={placeholder} value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                onKeyDown={onKeyDown}
                autoComplete={type === 'password' ? 'current-password' : 'email'}
                style={{
                    padding: '9px 12px',
                    border: `1.5px solid ${error ? '#fca5a5' : focused ? '#1e293b' : '#e2e8f0'}`,
                    borderRadius: 10, fontSize: 13, outline: 'none',
                    background: error ? '#fff5f5' : focused ? '#fff' : '#f8fafc',
                    color: '#0f172a', transition: 'border-color 0.15s, background 0.15s',
                    fontFamily: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
                    width: '100%', boxSizing: 'border-box' as const,
                }}
            />
            {error && <span style={{fontSize: 11, color: '#ef4444'}}>⚠ {error}</span>}
        </div>
    );
}

export default function Login({onSuccess, onGoSignUp}: LoginProps) {
    const [form, setForm] = useState<LoginForm>({email: '', password: ''});
    const [errors, setErrors] = useState<Partial<LoginForm>>({});
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const showToast = (msg: string, ok = true) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({msg, ok});
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    };

    const set = (k: keyof LoginForm) => (e: ChangeEvent<HTMLInputElement>) => {
        setForm(f => ({...f, [k]: e.target.value}));
        if (errors[k]) setErrors(er => ({...er, [k]: undefined}));
    };

    const validate = (): boolean => {
        const e: Partial<LoginForm> = {};
        if (!form.email.includes('@')) e.email = '올바른 이메일을 입력해 주세요.';
        if (!form.password) e.password = '비밀번호를 입력해 주세요.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const {data} = await api.post<{ accessToken: string; nickname: string; role: string }>(
                '/auth/login', {email: form.email.trim(), password: form.password}
            );
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('nickname', data.nickname);
            localStorage.setItem('role', data.role);
            showToast(`👋 어서오세요, ${data.nickname}님!`);
            setTimeout(() => onSuccess?.(), 800);
        } catch (err: unknown) {
            const status = axios.isAxiosError(err) ? err.response?.status : null;
            const msg =
                status === 401 ? '이메일 또는 비밀번호가 올바르지 않습니다.' :
                    status === 404 ? '존재하지 않는 계정입니다.' :
                        axios.isAxiosError(err) ? (err.response?.data?.message ?? `오류 ${status}`) :
                            '로그인에 실패했습니다.';
            showToast(`⚠ ${msg}`, false);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => {
        window.location.href = `${API_BASE}/oauth2/authorization/google`;
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSubmit();
    };


    // ── 렌더 ─────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-spin { display: inline-block; animation: spin 0.8s linear infinite; }
        .login-google-btn:hover { border-color: #94a3b8 !important; background: #f1f5f9 !important; }
        .login-submit-btn:hover:not(:disabled) { opacity: 0.88; }
        .login-signup-link-btn:hover { text-decoration: underline; }
      `}</style>

            <div style={{
                minHeight: '100vh',
                background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px 16px',
                fontFamily: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
            }}>
                <div style={{
                    width: '100%', maxWidth: 420,
                    background: '#fff',
                    border: '2px solid #e2e8f0',
                    borderRadius: 18,
                    padding: '30px 28px 26px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                    animation: 'fadeUp 0.3s ease',
                }}>

                    {/* ── 헤더 ── */}
                    <div style={{textAlign: 'center', marginBottom: 24}}>
                        <div style={{fontSize: 28, marginBottom: 6}}>📋</div>
                        <div style={{fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em'}}>
                            WordNote
                        </div>
                        <div style={{fontSize: 12, color: '#94a3b8', marginTop: 4}}>
                            오늘의 일정을 시작해 보세요
                        </div>
                    </div>

                    {/* ── 구글 버튼 ── */}
                    <button
                        className="login-google-btn"
                        onClick={handleGoogle}
                        type="button"
                        style={{
                            width: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '10px 16px', marginBottom: 18,
                            border: '1.5px solid #e2e8f0', borderRadius: 10,
                            background: '#f8fafc', color: '#334155',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            transition: 'border-color 0.15s, background 0.15s',
                            fontFamily: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                            <path fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google로 로그인
                    </button>

                    {/* ── 구분선 ── */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 18, color: '#cbd5e1', fontSize: 11,
                    }}>
                        <div style={{flex: 1, height: 1, background: '#e2e8f0'}}/>
                        <span>또는 이메일로 로그인</span>
                        <div style={{flex: 1, height: 1, background: '#e2e8f0'}}/>
                    </div>

                    {/* ── 폼 ── */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20}}>
                        <Field
                            label="이메일" emoji="📧" type="email"
                            placeholder="example@gmail.com"
                            value={form.email} onChange={set('email')} error={errors.email}
                            onKeyDown={handleKeyDown}
                        />
                        <Field
                            label="비밀번호" emoji="🔒" type="password"
                            placeholder="비밀번호 입력"
                            value={form.password} onChange={set('password')} error={errors.password}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {/* ── 제출 버튼 ── */}
                    <button
                        className="login-submit-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                        type="button"
                        style={{
                            width: '100%',
                            padding: '11px 0',
                            border: 'none', borderRadius: 10,
                            background: loading ? '#94a3b8' : '#0f172a',
                            color: '#fff',
                            fontSize: 14, fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.15s, background 0.15s',
                            fontFamily: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        }}
                    >
                        {loading
                            ? <><span className="login-spin">⟳</span> 로그인 중...</>
                            : '로그인'}
                    </button>

                    {/* ── 회원가입 링크 ── */}
                    <div style={{textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8'}}>
                        계정이 없으신가요?{' '}
                        <button
                            className="login-signup-link-btn"
                            onClick={onGoSignUp}
                            type="button"
                            style={{
                                background: 'none', border: 'none', padding: 0,
                                fontSize: 12, fontWeight: 700, color: '#0f172a',
                                cursor: 'pointer',
                                fontFamily: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
                            }}
                        >
                            회원가입
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 토스트 ── */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
                    padding: '10px 18px',
                    background: toast.ok ? '#f0fdf4' : '#fff5f5',
                    border: `1.5px solid ${toast.ok ? '#bbf7d0' : '#fca5a5'}`,
                    color: toast.ok ? '#166534' : '#ef4444',
                    borderRadius: 10, fontSize: 13, fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    whiteSpace: 'nowrap', zIndex: 999,
                    animation: 'toastIn 0.2s ease',
                    fontFamily: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
                }}>
                    {toast.msg}
                </div>
            )}
        </>
    );
}
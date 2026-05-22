import { useRef, useState, type ChangeEvent } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const api = axios.create({ baseURL: API_BASE });

interface SignUpForm {
    name: string; nickname: string; email: string;
    password: string; passwordConfirm: string;
}
interface SignUpProps { onSuccess?: () => void; onGoLogin?: () => void; }

const validate = (form: SignUpForm): Partial<SignUpForm> => {
    const e: Partial<SignUpForm> = {};
    if (!form.name.trim()) e.name = '이름을 입력해 주세요.';
    if (!form.nickname.trim()) e.nickname = '닉네임을 입력해 주세요.';
    if (!form.email.includes('@')) e.email = '올바른 이메일을 입력해 주세요.';
    if (form.password.length < 4) e.password = '비밀번호는 4자 이상이어야 합니다.';
    if (form.password !== form.passwordConfirm) e.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    return e;
};

interface FieldProps {
    label: string; emoji: string; type: string; placeholder: string;
    value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; error?: string;
}

function Field({ label, emoji, type, placeholder, value, onChange, error }: FieldProps) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>{emoji}</span>{label}
            </label>
            <input
                type={type} placeholder={placeholder} value={value} onChange={onChange}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                autoComplete={type === 'password' ? 'new-password' : undefined}
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
            {error && <span style={{ fontSize: 11, color: '#ef4444' }}>⚠ {error}</span>}
        </div>
    );
}

export default function SignUp({ onSuccess, onGoLogin }: SignUpProps) {
    const [form, setForm] = useState<SignUpForm>({
        name: '', nickname: '', email: '', password: '', passwordConfirm: '',
    });
    const [errors, setErrors] = useState<Partial<SignUpForm>>({});
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const showToast = (msg: string, ok = true) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ msg, ok });
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    };

    const set = (k: keyof SignUpForm) => (e: ChangeEvent<HTMLInputElement>) => {
        setForm(f => ({ ...f, [k]: e.target.value }));
        if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }));
    };

    const handleSubmit = async () => {
        const e = validate(form);
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            await api.post('/member/signup', {
                name: form.name.trim(), nickname: form.nickname.trim(),
                email: form.email.trim(), password: form.password,
            });
            showToast('🎉 회원가입이 완료되었습니다!');
            setTimeout(() => onSuccess?.(), 1200);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? `오류 ${err.response?.status}`)
                : '회원가입에 실패했습니다.';
            showToast(`⚠ ${msg}`, false);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => {
        window.location.href = `${API_BASE}/oauth2/authorization/google`;
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
        .signup-spin {
          display: inline-block;
          animation: spin 0.8s linear infinite;
        }
        .signup-google-btn:hover {
          border-color: #94a3b8 !important;
          background: #f1f5f9 !important;
        }
        .signup-submit-btn:hover:not(:disabled) {
          opacity: 0.88;
        }
        .signup-login-link-btn:hover {
          text-decoration: underline;
        }
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
                            새 계정을 만들어 보세요
                        </div>
                    </div>

                    {/* ── 구글 버튼 ── */}
                    <button
                        className="signup-google-btn"
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
                        Google로 계속하기
                    </button>

                    {/* ── 구분선 ── */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 18, color: '#cbd5e1', fontSize: 11,
                    }}>
                        <div style={{flex: 1, height: 1, background: '#e2e8f0'}}/>
                        <span>또는 이메일로 가입</span>
                        <div style={{flex: 1, height: 1, background: '#e2e8f0'}}/>
                    </div>

                    {/* ── 폼 ── */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20}}>
                        <Field label="이름" emoji="👤" type="text" placeholder="홍길동" value={form.name}
                               onChange={set('name')} error={errors.name}/>
                        <Field label="닉네임" emoji="✏️" type="text" placeholder="사용할 닉네임" value={form.nickname}
                               onChange={set('nickname')} error={errors.nickname}/>
                        <Field label="이메일" emoji="📧" type="email" placeholder="example@gmail.com" value={form.email}
                               onChange={set('email')} error={errors.email}/>
                        <Field label="비밀번호" emoji="🔒" type="password" placeholder="4자 이상" value={form.password}
                               onChange={set('password')} error={errors.password}/>
                        <Field label="비밀번호 확인" emoji="✅" type="password" placeholder="비밀번호 재입력"
                               value={form.passwordConfirm} onChange={set('passwordConfirm')}
                               error={errors.passwordConfirm}/>
                    </div>

                    {/* ── 제출 버튼 ── */}
                    <button
                        className="signup-submit-btn"
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
                            ? <><span className="signup-spin">⟳</span> 처리 중...</>
                            : '회원가입'}
                    </button>

                    {/* ── 로그인 링크 ── */}
                    <div style={{textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8'}}>
                        이미 계정이 있으신가요?{' '}
                        <button
                            className="signup-login-link-btn"
                            onClick={onGoLogin}
                            type="button"
                            style={{
                                background: 'none', border: 'none', padding: 0,
                                fontSize: 12, fontWeight: 700, color: '#0f172a',
                                cursor: 'pointer',
                                fontFamily: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
                            }}
                        >
                            로그인
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
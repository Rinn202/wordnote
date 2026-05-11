/**
 * Login Page - WordNote Clinical Brutalism
 * 로그인 / 회원가입 전환 폼
 */
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const BG_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663607741487/SES972LgMBLGb9tsrxXqKZ/wordnote-login-bg-BXC4eo4pwSmXY6QUYM7dER.webp";

export default function Login() {
  const [, navigate] = useLocation();
  const { login, signup, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', nickname: '', email: '', password: '' });

  if (isAuthenticated) { navigate('/'); return null; }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.nickname, form.email, form.password);
      }
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Left: background */}
      <div
        className="hidden lg:flex flex-1 relative overflow-hidden"
        style={{ backgroundImage: `url(${BG_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-white/20" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <span className="mono text-xs tracking-widest text-gray-400 uppercase mb-2">Wordnote</span>
          <h1 className="text-4xl font-bold text-gray-800 leading-tight">
            효율적인 업무를<br />위한 Todo
          </h1>
          <p className="mt-3 text-sm text-gray-500 max-w-xs">
            보드 · 박스 · 태스크 구조로 하루 일정을 체계적으로 관리하세요.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="w-full lg:w-[420px] flex flex-col justify-center px-8 py-12 bg-[#F5F4F0]">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-[#1A1A1A] flex items-center justify-center">
              <span className="text-white text-xs font-bold mono">W</span>
            </div>
            <span className="text-lg font-bold tracking-tight">WordNote</span>
          </div>
          <p className="text-xs text-gray-400 mono">업무 관리 시스템</p>
        </div>

        {/* Tab */}
        <div className="flex border-b border-gray-300 mb-8">
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                mode === m ? 'border-b-2 border-[#1A1A1A] text-[#1A1A1A]' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {m === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <>
              <Field label="이름" name="name" value={form.name} onChange={handleChange} placeholder="홍길동" />
              <Field label="닉네임" name="nickname" value={form.nickname} onChange={handleChange} placeholder="example" />
            </>
          )}
          <Field label="이메일" name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@gmail.com" />
          <Field label="비밀번호" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />

          <button type="submit" disabled={loading}
            className="mt-2 w-full py-3 bg-[#1A1A1A] text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {mode === 'login' ? '로그인' : '회원가입'}
          </button>

          {mode === 'login' && (
            <a href="/oauth2/authorization/google"
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors w-full">
              <GoogleIcon />
              Google로 로그인
            </a>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, placeholder }: {
  label: string; name: string; type?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} required placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white border border-gray-300 text-sm focus:outline-none focus:border-[#1A1A1A] transition-colors" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

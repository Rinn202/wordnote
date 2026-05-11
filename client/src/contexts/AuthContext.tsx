import { createContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, memberApi, setToken, clearToken, getToken, type Member } from '@/lib/api';

export interface AuthContextType {
  member: Member | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, nickname: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      memberApi.mypage()
        .then(setMember)
        .catch(() => clearToken())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.accessToken) {
      setToken(res.accessToken);
      const me = await memberApi.mypage();
      setMember(me);
    }
  };

  const signup = async (name: string, nickname: string, email: string, password: string) => {
    await authApi.signup(name, nickname, email, password);
    await login(email, password);
  };

  const logout = () => {
    clearToken();
    setMember(null);
  };

  return (
    <AuthContext.Provider value={{
      member,
      isLoading,
      isAuthenticated: !!member,
      login,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

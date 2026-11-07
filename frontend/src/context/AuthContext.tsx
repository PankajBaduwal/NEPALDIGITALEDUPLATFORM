import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';
import { TwoFactorModal } from '../components/auth/TwoFactorModal';

export interface UserSession {
  id: string;
  username: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'COLLEGE_ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'HOD' | 'STUDENT';
  fullName: string;
  fullNameNepali?: string;
  designation?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  institutionId?: string;
  institutionName?: string;
  institutionCode?: string;
  isDemo?: boolean;
  isClassTeacher?: boolean;
  activePackages?: string[];
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  login: (credentials: { username: string; password: string; emisCode?: string }) => Promise<UserSession>;
  completeTwoFactor: (challengeToken: string, code: string) => Promise<UserSession>;
  demoLogin: (role: string) => Promise<UserSession>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const cached = localStorage.getItem('nepal_edu_user');
      if (!cached || cached === 'undefined' || cached === 'null') return null;
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem('nepal_edu_user');
      return null;
    }
  });
  const [token, setTokenState] = useState<string | null>(() => {
    try {
      const t = localStorage.getItem('nepal_edu_token');
      return t && t !== 'undefined' && t !== 'null' ? t : null;
    } catch {
      return null;
    }
  });

  // When an account has two-factor sign-in on, login() waits while this prompt is shown, then resolves normally
  const [challenge, setChallenge] = useState<null | { token: string; resolve: (u: UserSession) => void; reject: (e: any) => void }>(null);

  const applySession = (data: { token: string; user: UserSession }) => {
    api.setToken(data.token);
    localStorage.setItem('nepal_edu_user', JSON.stringify(data.user));
    setUser(data.user);
    setTokenState(data.token);
    return data.user;
  };

  const login = async (credentials: { username: string; password: string; emisCode?: string }) => {
    const data: any = await api.post('/auth/login', credentials);
    if (data?.requires2FA) {
      return new Promise<UserSession>((resolve, reject) => setChallenge({ token: data.challengeToken, resolve, reject }));
    }
    return applySession(data);
  };

  const completeTwoFactor = async (challengeToken: string, code: string) => applySession(await api.post<{ token: string; user: UserSession }>('/auth/2fa/verify', { challengeToken, code }));

  const demoLogin = async (role: string) => {
    const data = await api.post<{ token: string; user: UserSession }>('/auth/demo-login', { role });
    api.setToken(data.token);
    localStorage.setItem('nepal_edu_user', JSON.stringify(data.user));
    setUser(data.user);
    setTokenState(data.token);
    return data.user;
  };

  const logout = () => {
    api.clearToken();
    localStorage.removeItem('nepal_edu_user');
    localStorage.removeItem('nepal_edu_token');
    setUser(null);
    setTokenState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        completeTwoFactor,
        demoLogin,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
      {challenge && (
        <TwoFactorModal
          challengeToken={challenge.token}
          verify={completeTwoFactor}
          onSuccess={(u) => {
            challenge.resolve(u);
            setChallenge(null);
          }}
          onCancel={() => {
            challenge.reject(Object.assign(new Error('Sign-in cancelled.'), { code: 'CANCELLED' }));
            setChallenge(null);
          }}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

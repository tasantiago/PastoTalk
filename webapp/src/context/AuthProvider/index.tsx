import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';

import { Api, setApiSession } from '../../services/api';
import { readSession, saveSession } from '../../services/storage';
import type { Profile, Session } from '../../types';
interface AuthState {
  session: Session | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateName: (name: string) => void;
}
export const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const apply = useCallback((s: Session | null) => {
    setApiSession(s);
    saveSession(s);
    setSession(s);
  }, []);
  const logout = useCallback(() => {
    apply(null);
    setLoading(false);
  }, [apply]);
  useEffect(() => {
    let active = true;
    window.addEventListener('pastotalk:session-expired', logout);
    const saved = readSession();
    setApiSession(saved);
    if (!saved) setLoading(false);
    else
      void Api.get<Profile>('/me')
        .then(({ data }) => {
          if (active) apply({ ...saved, user: { id: data.id, nome: data.name } });
        })
        .catch(() => {
          if (active) apply(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
      window.removeEventListener('pastotalk:session-expired', logout);
    };
  }, [apply, logout]);
  async function login(username: string, password: string) {
    const { data } = await Api.post<Session>('/login', { username, password });
    apply(data);
  }
  function updateName(name: string) {
    if (session) apply({ ...session, user: { ...session.user, nome: name } });
  }
  return (
    <AuthContext.Provider value={{ session, loading, login, logout, updateName }}>
      {children}
    </AuthContext.Provider>
  );
}

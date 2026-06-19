import { createContext, useContext, useState, type ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, type AuthUser } from '../api/auth';

const TOKEN_KEY = 'swimvault.token';
const USER_KEY = 'swimvault.user';

interface AuthValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

function loadUser(): AuthUser | null {
  try {
    const raw = globalThis.localStorage?.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persist(token: string, user: AuthUser) {
  globalThis.localStorage?.setItem(TOKEN_KEY, token);
  globalThis.localStorage?.setItem(USER_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const login = async (email: string, password: string) => {
    const { token, user: u } = await apiLogin(email, password);
    persist(token, u);
    setUser(u);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const { token, user: u } = await apiRegister(email, password, displayName);
    persist(token, u);
    setUser(u);
  };

  const logout = () => {
    globalThis.localStorage?.removeItem(TOKEN_KEY);
    globalThis.localStorage?.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

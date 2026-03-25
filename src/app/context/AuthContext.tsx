import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'user' | 'volunteer' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  joinDate: string;
  profileComplete: number; // 0–100
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: 'user' | 'volunteer'
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'auth_user';
const ACCOUNTS_KEY = 'auth_accounts';

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function calcProfileComplete(u: Partial<AuthUser>): number {
  const fields = [u.name, u.email, u.phone, u.location, u.avatar];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const getAccounts = (): Record<string, { password: string; user: AuthUser }> => {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveAccounts = (accounts: Record<string, { password: string; user: AuthUser }>) => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  // Seed default admin account
  useEffect(() => {
    const accounts = getAccounts();
    if (!accounts['admin@admin.com']) {
      accounts['admin@admin.com'] = {
        password: 'admin123',
        user: {
          id: 'admin-001',
          name: 'مدير النظام',
          email: 'admin@admin.com',
          role: 'admin',
          joinDate: new Date().toISOString().split('T')[0],
          profileComplete: 100,
        }
      };
      saveAccounts(accounts);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const accounts = getAccounts();
    const record = accounts[email.toLowerCase()];
    if (!record || record.password !== password) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
    setUser(record.user);
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string, role: 'user' | 'volunteer') => {
    const accounts = getAccounts();
    const key = email.toLowerCase();
    if (accounts[key]) {
      return { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل' };
    }
    const newUser: AuthUser = {
      id: generateId(),
      name,
      email,
      role,
      joinDate: new Date().toISOString().split('T')[0],
      profileComplete: calcProfileComplete({ name, email }),
    };
    accounts[key] = { password, user: newUser };
    saveAccounts(accounts);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => setUser(null);

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates, profileComplete: calcProfileComplete({ ...prev, ...updates }) };
      // also update in accounts
      const accounts = getAccounts();
      const key = updated.email.toLowerCase();
      if (accounts[key]) {
        accounts[key].user = updated;
        saveAccounts(accounts);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export type UserRole = 'user' | 'admin' | 'volunteer';

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
  wishlist?: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  toggleWishlist: (donationId: string) => void;
  getAllUsers: () => AuthUser[];
  addUserFromAdmin: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => { success: boolean; error?: string; user?: AuthUser };
  deleteUser: (id: string) => void;
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
      if (raw) {
        const parsed: AuthUser = JSON.parse(raw);
        // Migration: Treat truly legacy roles as 'user' (keep 'volunteer' intact)
        if (['donor', 'beneficiary'].includes(parsed.role)) {
          parsed.role = 'user';
        }
        return parsed;
      }
      return null;
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

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;
      const googleUserData: AuthUser = {
        id: gUser.uid,
        name: gUser.displayName || 'Google User',
        email: gUser.email || '',
        role: 'user',
        avatar: gUser.photoURL || undefined,
        joinDate: new Date().toISOString().split('T')[0],
        profileComplete: calcProfileComplete({
          name: gUser.displayName || '',
          email: gUser.email || '',
          avatar: gUser.photoURL || undefined,
        }),
      };
      setUser(googleUserData);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'فشل تسجيل الدخول بـ Google' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const accounts = getAccounts();
    const key = email.toLowerCase();
    if (accounts[key]) {
      return { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل' };
    }
    const newUser: AuthUser = {
      id: generateId(),
      name,
      email,
      role: 'user',
      joinDate: new Date().toISOString().split('T')[0],
      profileComplete: calcProfileComplete({ name, email }),
    };
    accounts[key] = { password, user: newUser };
    saveAccounts(accounts);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => setUser(null);

  const getAllUsers = (): AuthUser[] => {
    const accounts = getAccounts();
    return Object.values(accounts).map((acc) => acc.user);
  };

  const addUserFromAdmin = (name: string, email: string, password: string, role: UserRole = 'user') => {
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
    return { success: true, user: newUser };
  };

  const deleteUser = (id: string) => {
    const accounts = getAccounts();
    const key = Object.keys(accounts).find((k) => accounts[k].user.id === id);
    if (key) {
      delete accounts[key];
      saveAccounts(accounts);
    }
  };

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

  const toggleWishlist = (donationId: string) => {
    if (!user) return;
    const currentWishlist = user.wishlist || [];
    const isSaved = currentWishlist.includes(donationId);
    const newWishlist = isSaved
      ? currentWishlist.filter(id => id !== donationId)
      : [...currentWishlist, donationId];

    updateUser({ wishlist: newWishlist });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, signup, logout, updateUser, toggleWishlist, getAllUsers, addUserFromAdmin, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

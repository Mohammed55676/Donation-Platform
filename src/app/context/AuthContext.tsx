import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import api from '../utils/api';

export type UserRole = 'user' | 'admin' | 'volunteer';
export type UserType = 'donor' | 'beneficiary';

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  user_type?: UserType;
  avatar?: string;
  phone?: string;
  location?: string;
  createdAt: string;
  wishlist?: string[];
  profileComplete?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signup: (
    name: string,
    email: string,
    password: string,
    user_type?: UserType,
    phone?: string
  ) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  toggleWishlist: (donationId: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loginInProgress = useRef(false);

  // Initialize auth from token
  useEffect(() => {
    const initAuth = async () => {
      // Skip re-init while a login flow (e.g. Google) is actively running
      if (loginInProgress.current) return;

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();

    const handleAuthChange = () => initAuth();
    window.addEventListener('auth_changed', handleAuthChange);
    return () => window.removeEventListener('auth_changed', handleAuthChange);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'فشل تسجيل الدخول' };
    }
  };

  const loginWithGoogle = async () => {
    loginInProgress.current = true;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;
      
      const email = gUser.email || '';
      const name = gUser.displayName || 'Google User';

      // Send google user data to our backend google login endpoint
      try {
        const res = await api.post('/auth/google', { 
          email, 
          name, 
          avatar: gUser.photoURL 
        });
        
        const { token, user: userData } = res.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true, user: userData };
      } catch (backendErr: any) {
        console.error('Backend Google login error:', backendErr);
        return { success: false, error: backendErr.response?.data?.error || 'حدث خطأ أثناء مزامنة الدخول مع الخادم' };
      }
    } catch (err: any) {
      console.error('Firebase Google login error:', err);
      return { success: false, error: err.message || 'فشل تسجيل الدخول بجوجل' };
    } finally {
      loginInProgress.current = false;
    }
  };

  const signup = async (name: string, email: string, password: string, user_type?: UserType, phone?: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, user_type: user_type || 'donor', phone });
      const { token, user: userData } = res.data.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'حدث خطأ أثناء إنشاء الحساب' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (updates: Partial<AuthUser>) => {
    if (!user) return;
    const userId = user.id ?? user._id;
    try {
      const res = await api.put(`/users/${userId}`, updates);
      setUser(res.data.data);
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  const toggleWishlist = async (donationId: string) => {
    if (!user) return;

    const currentWishlist = user.wishlist || [];
    const isWished = currentWishlist.includes(donationId);
    const newWishlist = isWished
      ? currentWishlist.filter(id => id !== donationId)
      : [...currentWishlist, donationId];

    // Optimistic update using functional form to avoid stale closure
    setUser(prev => prev ? { ...prev, wishlist: newWishlist } : prev);

    const userId = user.id ?? user._id;
    try {
      await api.post(`/users/${userId}/wishlist`, { donationId });
    } catch (err) {
      console.error('Failed to toggle wishlist', err);
      setUser(prev => prev ? { ...prev, wishlist: currentWishlist } : prev);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateUser,
        toggleWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import api from '../utils/api';

export type UserRole = 'user' | 'admin' | 'volunteer';

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
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
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from token
  useEffect(() => {
    const initAuth = async () => {
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
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'فشل تسجيل الدخول' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;
      
      const email = gUser.email || '';
      const name = gUser.displayName || 'Google User';
      // Create a deterministic dummy password for Google users
      const dummyPassword = `google_${gUser.uid}_sso_pass_!`;

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
        return { success: true };
      } catch (backendErr: any) {
        console.error('Backend Google login error:', backendErr);
        return { success: false, error: backendErr.response?.data?.error || 'حدث خطأ أثناء مزامنة الدخول مع الخادم' };
      }
    } catch (err: any) {
      console.error('Firebase Google login error:', err);
      return { success: false, error: err.message || 'فشل تسجيل الدخول بجوجل' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await api.post('/auth/register', { name, email, password });
      // After registration, auto-login
      return await login(email, password);
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
    try {
      const res = await api.put(`/users/${user.id}`, updates);
      setUser(res.data.data);
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  const toggleWishlist = (donationId: string) => {
    // Optimistic UI for wishlist can be added here, but typically handled via API
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

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../utils/api';

interface User {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  profileImageUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { email, username, password });
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    updateUser,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

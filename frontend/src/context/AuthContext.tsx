import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('nexus_token')));

  const fetchUser = async () => {
    const token = localStorage.getItem('nexus_token');
    if (!token) {
      return;
    }

    try {
      const response = await api.get('/api/v1/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user', error);
      localStorage.removeItem('nexus_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchUser();
    });
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('nexus_token', token);
    setUser(userData);
    toast.success('Welcome back!');
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    setUser(null);
    toast.success('Logged out');
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

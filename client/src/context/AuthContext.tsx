import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  useDemoAccount: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smart_mess_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr_admin_1',
      email: 'admin@smartmess.edu',
      name: 'Dr. K. Sharma (Mess Warden)',
      role: 'Chief Warden',
      hostel_assigned: 'Aryabhata Dining Hall'
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('smart_mess_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smart_mess_user');
    }
  }, [user]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        return true;
      }
      return false;
    } catch {
      // Offline / fallback demo login
      if (email.includes('admin')) {
        setUser({
          id: 'usr_admin_1',
          email,
          name: 'Chief Warden',
          role: 'Admin',
          hostel_assigned: 'Aryabhata Central Hall'
        });
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const useDemoAccount = async (): Promise<boolean> => {
    return login('admin@smartmess.edu', 'admin123');
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, useDemoAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  register: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((userData: User) => {
    setUser(userData);
    if (userData.accessToken) {
      setAuthToken(userData.accessToken);
    }
  }, []);

  const register = useCallback((userData: User) => {
    setUser(userData);
    if (userData.accessToken) {
      setAuthToken(userData.accessToken);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

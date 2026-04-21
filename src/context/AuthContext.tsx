import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { setAuthToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserCredit } from '../services/userService';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => Promise<void>;
  register: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshCredit: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@sport_hub_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            // Stricter validation: must have an ID to be considered logged in
            if (userData && userData.id) {
              setUser(userData);
              if (userData.accessToken) {
                setAuthToken(userData.accessToken);
              }
            } else {
              // Corrupted or incomplete data (Ghost Login)
              console.log('Ghost login detected, clearing storage...');
              await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
              setUser(null);
              setAuthToken(null);
            }
          } catch (e) {
            console.error('Error parsing stored user:', e);
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = useCallback(async (userData: User) => {
    setUser(userData);
    if (userData.accessToken) {
      setAuthToken(userData.accessToken);
    }
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const register = useCallback(async (userData: User) => {
    setUser(userData);
    if (userData.accessToken) {
      setAuthToken(userData.accessToken);
    }
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setAuthToken(null);
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const refreshCredit = useCallback(async () => {
    if (!user || !user.accessToken) return;

    try {
      const response = await getUserCredit();
      if (response.status === 'success' && response.data) {
        const updatedUser = {
          ...user,
          booking_credit: response.data.balance,
          credit_balance: response.data.balance // Also update for consistency
        };
        setUser(updatedUser);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh credit:', error);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        refreshCredit,
        loading,
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

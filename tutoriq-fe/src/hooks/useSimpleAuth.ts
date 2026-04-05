import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiService, { setAuthToken } from '../services/apiService';
import { User, LoginRequest, RegisterRequest, LoginResponse } from '../interfaces/interfaces';

const ACCESS_TOKEN_KEY = 'tutoriq_access_token';
const REFRESH_TOKEN_KEY = 'tutoriq_refresh_token';

export interface UseSimpleAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useSimpleAuth(): UseSimpleAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  // Restore session on app start
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      setAuthToken(token);
      const result = await apiService.get<User>('/api/users/me');

      if (result.success) {
        setUser(result.data);
      } else {
        // Token expired or invalid — try refresh
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          await clearTokens();
        }
      }
    } catch {
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const tryRefreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const result = await apiService.post<{ token: string }>('/api/auth/refresh', {
        refreshToken,
      });

      if (result.success && result.data.token) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, result.data.token);
        setAuthToken(result.data.token);

        const profileResult = await apiService.get<User>('/api/users/me');
        if (profileResult.success) {
          setUser(profileResult.data);
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: LoginRequest = { email, password };
      const result = await apiService.post<LoginResponse>('/api/auth/login', payload);

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      const { token, refreshToken, user: userData } = result.data;

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      setAuthToken(token);
      setUser(userData);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.post<LoginResponse>('/api/auth/register', payload);

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      const { token, refreshToken, user: userData } = result.data;

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      setAuthToken(token);
      setUser(userData);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
    setUser(null);
  }, []);

  const clearTokens = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setAuthToken(null);
  };

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}

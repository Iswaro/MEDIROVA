import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { getAccessToken, setAccessToken, setRefreshToken, clearTokens } from '../api/client';
import type { User, LoginCredentials, RegisterData, AuthTokens } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        if (response.success && response.data) {
          const raw = response.data as unknown as Record<string, unknown>;
          const profile = (raw.profile || {}) as Record<string, unknown>;
          setUser({
            id: String(raw.id || ''),
            email: String(raw.email || ''),
            phone: String(raw.phone || ''),
            role: raw.role as User['role'],
            firstName: String(profile.first_name || raw.first_name || ''),
            lastName: String(profile.last_name || raw.last_name || ''),
            fullName: `${profile.first_name || raw.first_name || ''} ${profile.last_name || raw.last_name || ''}`.trim() || String(raw.email || ''),
            isActive: Boolean(raw.is_active !== undefined ? raw.is_active : true),
            isEmailVerified: true,
            isPhoneVerified: false,
            createdAt: String(raw.created_at || ''),
            updatedAt: String(raw.updated_at || ''),
          });
        } else {
          clearTokens();
        }
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const storeTokens = (tokens: AuthTokens) => {
    setAccessToken(tokens.accessToken);
    if (tokens.refreshToken) {
      setRefreshToken(tokens.refreshToken);
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    if (!response.success) {
      throw new Error(response.message || 'Login failed');
    }
    const data = response.data as unknown as Record<string, unknown>;

    if (data.accessToken) {
      setAccessToken(String(data.accessToken));
    } else if (data.tokens) {
      storeTokens(data.tokens as AuthTokens);
    }

    const loggedUser: User = (data.user as User) || {
      id: String(data.userId || ''),
      email: String(data.email || credentials.email),
      role: data.role as User['role'],
      firstName: String(data.firstName || ''),
      lastName: String(data.lastName || ''),
      fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || String(data.email || credentials.email),
      phone: String(data.phone || ''),
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(loggedUser);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authApi.register(data);
    if (!response.success) {
      throw new Error(response.message || 'Registration failed');
    }
    const resData = response.data as unknown as Record<string, unknown>;

    if (resData.accessToken) {
      setAccessToken(String(resData.accessToken));
    } else if (resData.tokens) {
      storeTokens(resData.tokens as AuthTokens);
    }

    const newUser: User = (resData.user as User) || {
      id: String(resData.userId || ''),
      email: data.email,
      role: data.role as User['role'],
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Silently fail
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

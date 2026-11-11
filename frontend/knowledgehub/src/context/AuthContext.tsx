import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { apiService } from '../api/service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<string>;
  logout: () => void;
  isQuickCaptureOpen: boolean;
  openQuickCapture: () => void;
  closeQuickCapture: () => void;
  itemMutationTrigger: number;
  notifyItemMutated: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'kh_auth_token';
const USER_KEY = 'kh_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    // Default demo user if token is present
    return token ? { email: 'alex@knowledgehub.io', fullName: 'Alex' } : null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [itemMutationTrigger, setItemMutationTrigger] = useState(0);

  const notifyItemMutated = useCallback(() => {
    setItemMutationTrigger((prev) => prev + 1);
  }, []);

  const openQuickCapture = useCallback(() => {
    setIsQuickCaptureOpen(true);
  }, []);

  const closeQuickCapture = useCallback(() => {
    setIsQuickCaptureOpen(false);
  }, []);

  // Listen for unauthorized 401 events from Axios
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(credentials);
      const authToken = response.token || response.accessToken || response.jwt || 'authenticated-token';
      const authUser: User = response.user || {
        email: credentials.email,
        fullName: response.fullName || credentials.email.split('@')[0],
      };

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<string> => {
    setIsLoading(true);
    try {
      const res = await apiService.register(data);
      return res.message || 'Registration successful. Please log in.';
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        isQuickCaptureOpen,
        openQuickCapture,
        closeQuickCapture,
        itemMutationTrigger,
        notifyItemMutated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

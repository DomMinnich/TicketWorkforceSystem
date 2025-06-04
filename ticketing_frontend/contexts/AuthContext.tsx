
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthStatus } from '../types';
import * as authService from '../services/authService';
import { useApi } from '../hooks/useApi'; // To handle license check globally

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loadingAuth: boolean;
  licenseExpired: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, authCode: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [licenseExpired, setLicenseExpired] = useState<boolean>(false);
  const { setGlobalLicenseErrorHandler } = useApi();


  const checkAuthStatus = useCallback(async () => {
    setLoadingAuth(true);
    try {
      const data: AuthStatus = await authService.getAuthStatus();
      if (data.is_authenticated && data.user_email && data.user_role) {
        const partialUser: User = {
            id: 0, // ID not provided by /status, may need another call or adjust backend
            email: data.user_email,
            role: data.user_role,
            associations: data.user_associations || 'alpha',
        };
        setUser(partialUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.error('Failed to check auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
      if (error.status === 503) { // License Expired
        setLicenseExpired(true);
      }
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    setGlobalLicenseErrorHandler(() => setLicenseExpired(true));
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAuthStatus, setGlobalLicenseErrorHandler]);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
    await checkAuthStatus(); // Re-check status to update user info
  };

  const register = async (email: string, password: string, authCode: string) => {
    await authService.register(email, password, authCode);
    // Optionally auto-login or prompt user to login
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if API logout fails, clear client-side state
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loadingAuth, login, register, logout, checkAuthStatus, licenseExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

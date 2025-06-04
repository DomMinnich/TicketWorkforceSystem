
import { AuthStatus, User } from '../types';
import { apiFetch } from './api'; // Using the generic fetch wrapper

export const login = async (email: string, password: string): Promise<{message: string, user_email: string, role: string}> => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (email: string, password: string, auth_code: string): Promise<{message: string, user_email: string}> => {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, auth_code }),
  });
};

export const logout = async (): Promise<{message: string}> => {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
};

export const getAuthStatus = async (): Promise<AuthStatus> => {
  return apiFetch('/auth/status', {
    method: 'GET',
  });
};

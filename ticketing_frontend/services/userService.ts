
import { User, ManagedUser } from '../types';
import { apiFetch } from './api';

// Get all users (Admin)
export const getAllUsers = async (): Promise<ManagedUser[]> => {
  return apiFetch('/users/', { method: 'GET' });
};

// Get user by email (Admin)
export const getUserByEmail = async (email: string): Promise<ManagedUser> => {
  return apiFetch(`/users/${email}`, { method: 'GET' });
};

// Update user role (Admin)
export const updateUserRole = async (email: string, role: string): Promise<{ message: string, user: ManagedUser }> => {
  return apiFetch(`/users/${email}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
};

// Update user associations (Admin)
export const updateUserAssociations = async (email: string, associations: string): Promise<{ message: string, user: ManagedUser }> => {
  return apiFetch(`/users/${email}/associations`, {
    method: 'PUT',
    body: JSON.stringify({ associations }),
  });
};

// Update user password by admin (Admin)
export const updateUserPasswordByAdmin = async (email: string, new_password: string): Promise<{ message: string, user: ManagedUser }> => {
  return apiFetch(`/users/${email}/password`, {
    method: 'PUT',
    body: JSON.stringify({ new_password }),
  });
};

// Delete user (Super Admin)
export const deleteUser = async (email: string): Promise<{ message: string }> => {
  return apiFetch(`/users/${email}`, { method: 'DELETE' });
};

// Update self password (Logged-in user)
export const updateSelfPassword = async (old_password: string, new_password: string): Promise<{ message: string }> => {
  return apiFetch('/users/self/password', {
    method: 'PUT',
    body: JSON.stringify({ old_password, new_password }),
  });
};

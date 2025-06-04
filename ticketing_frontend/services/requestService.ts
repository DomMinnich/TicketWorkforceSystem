
import { EquipmentRequest, UserRequest, StudentRequest } from '../types';
import { apiFetch } from './api';

// --- Equipment Requests ---
export const createEquipmentRequest = async (data: Omit<EquipmentRequest, 'id' | 'user_email' | 'timestamp' | 'status' | 'approval_status'>): Promise<EquipmentRequest> => {
  return apiFetch('/requests/equipment', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getEquipmentRequests = async (searchKeyword?: string): Promise<EquipmentRequest[]> => {
  const url = searchKeyword ? `/requests/equipment?search=${encodeURIComponent(searchKeyword)}` : '/requests/equipment';
  return apiFetch(url, { method: 'GET' });
};

export const getEquipmentRequestById = async (requestId: string): Promise<EquipmentRequest> => {
  return apiFetch(`/requests/equipment/${requestId}`, { method: 'GET' });
};

export const approveEquipmentRequest = async (requestId: string): Promise<{ message: string, request: EquipmentRequest }> => {
  return apiFetch(`/requests/equipment/${requestId}/approve`, { method: 'PUT' });
};

export const denyEquipmentRequest = async (requestId: string): Promise<{ message: string, request: EquipmentRequest }> => {
  return apiFetch(`/requests/equipment/${requestId}/deny`, { method: 'PUT' });
};

export const closeEquipmentRequest = async (requestId: string): Promise<{ message: string, request: EquipmentRequest }> => {
  return apiFetch(`/requests/equipment/${requestId}/close`, { method: 'PUT' });
};

// --- User Requests (New Employee) ---
export const createUserRequest = async (data: Omit<UserRequest, 'id' | 'user_email' | 'timestamp' | 'status'>): Promise<UserRequest> => {
  return apiFetch('/requests/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getUserRequests = async (searchKeyword?: string): Promise<UserRequest[]> => {
  const url = searchKeyword ? `/requests/users?search=${encodeURIComponent(searchKeyword)}` : '/requests/users';
  return apiFetch(url, { method: 'GET' });
};

export const getUserRequestById = async (requestId: string): Promise<UserRequest> => {
  return apiFetch(`/requests/users/${requestId}`, { method: 'GET' });
};

export const closeUserRequest = async (requestId: string): Promise<{ message: string, request: UserRequest }> => {
  return apiFetch(`/requests/users/${requestId}/close`, { method: 'PUT' });
};

// --- Student Requests ---
export const createStudentRequest = async (data: Omit<StudentRequest, 'id' | 'user_email' | 'timestamp' | 'status' | 'email_created' | 'computer_created' | 'bag_created' | 'id_card_created' | 'azure_created'>): Promise<StudentRequest> => {
  return apiFetch('/requests/students', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getStudentRequests = async (searchKeyword?: string): Promise<StudentRequest[]> => {
  const url = searchKeyword ? `/requests/students?search=${encodeURIComponent(searchKeyword)}` : '/requests/students';
  return apiFetch(url, { method: 'GET' });
};

export const getStudentRequestById = async (requestId: string): Promise<StudentRequest> => {
  return apiFetch(`/requests/students/${requestId}`, { method: 'GET' });
};

export const closeStudentRequest = async (requestId: string): Promise<{ message: string, request: StudentRequest }> => {
  return apiFetch(`/requests/students/${requestId}/close`, { method: 'PUT' });
};

export const toggleStudentRequestStatusField = async (
  requestId: string, 
  statusField: keyof Pick<StudentRequest, 'email_created' | 'computer_created' | 'bag_created' | 'id_card_created' | 'azure_created'>
): Promise<{ message: string, request: StudentRequest }> => {
  return apiFetch(`/requests/students/${requestId}/toggle/${statusField}`, { method: 'PUT' });
};

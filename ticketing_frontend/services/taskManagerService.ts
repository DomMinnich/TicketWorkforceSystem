
import { Task, LogEntry, TaskCategory, DashboardStatistics } from '../types';
import { apiFetch } from './api';
import { API_BASE_URL } from '../constants';

// Add a new task
export const addTask = async (data: { title: string; description?: string; category: TaskCategory }): Promise<Task> => {
  return apiFetch('/tasks/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Get tasks by category
export const getTasksByCategory = async (category: TaskCategory): Promise<Task[]> => {
  return apiFetch(`/tasks/?category=${category}`, { method: 'GET' });
};

// Complete a task
export const completeTask = async (taskId: number, category: TaskCategory): Promise<Task> => {
  return apiFetch(`/tasks/${taskId}/complete`, {
    method: 'PUT',
    body: JSON.stringify({ category }), // Backend expects category in body
  });
};

// Reset a task
export const resetTask = async (taskId: number, category: TaskCategory): Promise<Task> => {
  return apiFetch(`/tasks/${taskId}/reset`, {
    method: 'PUT',
    body: JSON.stringify({ category }), // Backend expects category in body
  });
};

// Delete a task
export const deleteTask = async (taskId: number, category: TaskCategory): Promise<{ message: string }> => {
  return apiFetch(`/tasks/${taskId}`, { 
    method: 'DELETE',
    body: JSON.stringify({ category }),
   });
};

// Get logs by category
export const getLogsByCategory = async (category: TaskCategory): Promise<LogEntry[]> => {
  return apiFetch(`/tasks/logs?category=${category}`, { method: 'GET' });
};

// Clear logs by category
export const clearLogsByCategory = async (category: TaskCategory): Promise<{ message: string }> => {
   // Backend expects category in body for DELETE as well.
  return apiFetch('/tasks/logs/clear', { 
    method: 'DELETE',
    body: JSON.stringify({ category }),
  });
};

// Download logs by category - this will return a path or trigger a download
// The actual download is handled by navigating or window.open to the URL
export const getDownloadLogsUrl = (category: TaskCategory): string => {
    return `${API_BASE_URL}/tasks/logs/download?category=${category}`;
};


// Get dashboard statistics
export const getDashboardStatistics = async (): Promise<DashboardStatistics> => {
  return apiFetch('/tasks/statistics', { method: 'GET' });
};
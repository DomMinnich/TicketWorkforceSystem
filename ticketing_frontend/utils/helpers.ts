
import { format, parseISO } from 'date-fns';
import { DATE_FORMAT, DATETIME_FORMAT } from '../constants';

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), DATE_FORMAT);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateTimeString?: string | null): string => {
  if (!dateTimeString) return 'N/A';
  try {
    return format(parseISO(dateTimeString), DATETIME_FORMAT);
  } catch (error) {
    return 'Invalid Date/Time';
  }
};

export const getTicketStatusFriendly = (status: string): string => {
  if (status.toLowerCase() === 'open') {
    return 'Open';
  }
  if (status.toLowerCase().startsWith('closed:')) {
    return status; // Already formatted by backend as "Closed: YYYY-MM-DD HH:MM:SS"
  }
  return status; // Fallback
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (email?: string | null): string => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length > 1) {
        return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
};

export const classNames = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const getApiBaseUrl = (): string => {
  // In a Vite app: return import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';
  // For this environment:
  return 'http://127.0.0.1:5000/api';
};
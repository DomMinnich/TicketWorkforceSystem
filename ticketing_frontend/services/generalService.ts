
import { apiFetch } from './api';

export const reportBug = async (data: { title: string; description: string; location?: string }): Promise<{ message: string }> => {
  return apiFetch('/report_bug', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

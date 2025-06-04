
import { apiFetch } from './api';

export interface GeminiResponse {
  response: string;
}

export const generateGeminiResponse = async (question: string): Promise<GeminiResponse> => {
  return apiFetch<GeminiResponse>('/gemini/generate', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
};

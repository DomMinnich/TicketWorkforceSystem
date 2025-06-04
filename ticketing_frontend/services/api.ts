
// This file can be a placeholder or provide a typed fetch wrapper.
// For this project, individual service files will use the `useApi` hook 
// or a shared fetch wrapper if needed.

// generic fetch function if not using useApi hook directly in service files
import { API_BASE_URL } from '../constants';
import { ApiError } from '../types';

export async function apiFetch<T,>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Initialize headers from options.headers
  const finalHeaders = new Headers(options.headers);

  if (options.body instanceof FormData) {
    // When body is FormData, delete any 'Content-Type' header.
    // The browser will then correctly set it to 'multipart/form-data'
    // with the appropriate boundary.
    finalHeaders.delete('Content-Type');
  } else if (options.body && !finalHeaders.has('Content-Type')) {
    // For non-FormData requests with a body, if 'Content-Type' is not already set,
    // default to 'application/json'.
    finalHeaders.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers: finalHeaders,
    credentials: 'include', // Crucial for Flask-Login session cookies
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 503) { // License Expired
      // This needs a more global way to signal license expiration to the UI
      // For instance, setting a global state or redirecting.
      // The useApi hook handles this better.
      console.error("Service unavailable - License might be expired.");
      throw { message: "Service Unavailable. License might have expired.", status: 503 } as ApiError;
  }

  // Determine if the response is JSON or text
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text(); // Handle cases like file download paths or plain text errors
  }

  if (!response.ok) {
    // Try to parse error message if data is an object (likely JSON error from backend)
    // Otherwise, use the text data as the message or a default error.
    const errorMessage = (typeof data === 'object' && data !== null && (data as ApiError).message)
                         ? (data as ApiError).message
                         : (typeof data === 'string' && data.trim() !== '' ? data : 'An API error occurred');
    const errorDetails = (typeof data === 'object' && data !== null) ? (data as ApiError).error : undefined;

    console.error('API Fetch Error:', { message: errorMessage, status: response.status, error: errorDetails, rawResponse: data });
    throw { message: errorMessage, status: response.status, error: errorDetails } as ApiError;
  }
  return data as T;
}

// Specific GET, POST, PUT, DELETE helpers
export const get = <T,>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'GET' });
export const post = <T,B,>(endpoint: string, body: B, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
export const postFormData = <T,>(endpoint: string, formData: FormData, options?: RequestInit) => {
    return apiFetch<T>(endpoint, { 
        ...options, 
        method: 'POST', 
        body: formData,
        headers: { // Content-Type is set automatically by browser for FormData
            ...options?.headers,
            'Content-Type': undefined as any, // Remove default Content-Type
        }
    });
};
export const put = <T,B,>(endpoint: string, body: B, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
export const del = <T,>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' });


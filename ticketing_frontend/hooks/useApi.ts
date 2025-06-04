
import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../constants';
import { ApiError } from '../types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any; // For POST/PUT, can be JSON object or FormData
  isFormData?: boolean; // True if body is FormData
}

// Store the global handler at the module level
let globalLicenseErrorHandler: (() => void) | null = null;

export const useApi = <T,>() => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const setGlobalErrorHandler = useCallback((handler: () => void) => {
    globalLicenseErrorHandler = handler;
  }, []);


  const request = useCallback(async (endpoint: string, options: RequestOptions): Promise<T> => {
    setLoading(true);
    setError(null);
    setData(null);

    const { method, body, isFormData } = options;
    let headers = { ...options.headers };

    if (!isFormData && body) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Flask-Login uses session cookies, so `credentials: 'include'` is vital.
    const fetchOptions: globalThis.RequestInit = {
      method,
      headers,
      credentials: 'include', // IMPORTANT for session cookies with Flask-Login
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

      if (response.status === 503) { // License Expired (or other service unavailable)
        if (globalLicenseErrorHandler) {
          globalLicenseErrorHandler(); // Trigger global license error handling
        }
        const err: ApiError = { message: 'Service Unavailable. The license might have expired.', status: 503 };
        setError(err);
        throw err; // Propagate to stop further processing
      }
      
      const responseData = response.headers.get('content-type')?.includes('application/json') 
        ? await response.json() 
        : await response.text(); // Handle non-JSON responses (e.g. file download path for logs)

      if (!response.ok) {
        const err: ApiError = responseData.message ? responseData : { message: `HTTP error! Status: ${response.status}`, error: responseData, status: response.status };
        setError(err);
        throw err; // Propagate to calling function
      }
      
      setData(responseData);
      return responseData as T;
    } catch (err: any) {
      if (err.status !== 503) { // Avoid double-setting
          const apiError: ApiError = { 
            message: err.message || 'An unexpected error occurred', 
            error: err.error || (typeof err === 'string' ? err : undefined),
            status: err.status
          };
          setError(apiError);
      }
      throw err; // Re-throw to be caught by the caller
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, error, loading, request, setGlobalLicenseErrorHandler: setGlobalErrorHandler };
};

// Export a function to set the handler from AuthContext or App.tsx
export const setGlobalLicenseErrorHandler = (handler: () => void) => {
  globalLicenseErrorHandler = handler;
};

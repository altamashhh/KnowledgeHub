import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Access environment variable safely
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('kh_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 or network errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if we are on the login/register page already
      const isAuthPath = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthPath) {
        localStorage.removeItem('kh_auth_token');
        localStorage.removeItem('kh_auth_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.status === 400) {
      return 'Bad request. Please verify your inputs.';
    }
    if (error.response?.status === 401) {
      return 'Invalid credentials or expired session. Please log in again.';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 404) {
      return 'Knowledge item not found.';
    }
    if (error.response?.status === 409) {
      return 'An account with this email address already exists.';
    }
    if (error.response?.status === 500) {
      return 'Server error. Please try again later.';
    }
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return `Cannot connect to backend server at ${API_BASE_URL}.`;
    }
    return error.message || 'An unexpected network error occurred.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

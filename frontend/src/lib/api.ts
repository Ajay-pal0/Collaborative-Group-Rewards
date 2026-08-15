import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise error messages per Req 15
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<Record<string, unknown>>;

    if (!err.response) {
      return 'Network error — please check your connection.';
    }

    const status = err.response.status;

    if (status >= 500) {
      return 'Something went wrong. Please try again.';
    }

    const data = err.response.data;
    if (data && typeof data === 'object') {
      const msg =
        (data.detail as string) ||
        (data.message as string) ||
        (data.error as string);
      if (msg) return msg;

      // Field-level errors — join them
      const fieldErrors = Object.entries(data)
        .map(([, v]) => (Array.isArray(v) ? v.join(' ') : String(v)))
        .join(' ');
      if (fieldErrors) return fieldErrors;
    }

    return 'An unexpected error occurred.';
  }
  return 'An unexpected error occurred.';
}

export default api;

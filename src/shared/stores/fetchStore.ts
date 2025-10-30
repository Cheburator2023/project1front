import { create } from 'zustand';
import { ErrorResponse, SuccessResponse } from '@shared/api/types';

const IS_DEV = process.env.NODE_ENV === 'development';

interface FetchState {
  isLoading: boolean;
  error: string | null;
}

interface FetchActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setProtectedFetch: (
    fetchFn: <T, N = void>(
      routeUrl: string,
      params?: Record<string, string>,
      body?: N,
      method?: string,
      fileName?: string,
    ) => Promise<SuccessResponse<T> | ErrorResponse>,
  ) => void;
  protectedFetch: <T, N = void>(
    routeUrl: string,
    params?: Record<string, string>,
    body?: N,
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    fileName?: string,
  ) => Promise<SuccessResponse<T> | ErrorResponse>;
  protectedFetchDev: <T, N = void>(
    routeUrl: string,
    params?: Record<string, string>,
    body?: N,
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    fileName?: string,
  ) => Promise<SuccessResponse<T> | ErrorResponse>;
}

export type FetchStore = FetchState & FetchActions;

export const useFetchStore = create<FetchStore>((set, get) => ({
  isLoading: false,
  error: null,
  protectedFetch: undefined as any,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setProtectedFetch: (fetchFn) => {
    return set({ protectedFetch: fetchFn });
  },

  protectedFetchDev: async <T, N = void>(
    routeUrl: string,
    params?: Record<string, string>,
    body?: N,
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    fileName?: string,
  ): Promise<SuccessResponse<T> | ErrorResponse> => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      const url = new URL(routeUrl, 'http://localhost:3000');

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const config: RequestInit = {
        method,
        headers,
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ statusCode: response.status, message: 'Ошибка сети' }));
        setError(errorData.message || 'Ошибка запроса');
        return {
          error: true,
          data: {
            statusCode: errorData.statusCode || response.status,
            message: errorData.message || 'Ошибка запроса',
          },
        };
      }

      // Check content type to determine how to parse the response
      const contentType = response.headers.get('content-type');
      let data: T;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && (
        contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
        contentType.includes('application/vnd.ms-excel') ||
        contentType.includes('application/octet-stream')
      )) {
        // Handle Excel/binary files as blob
        data = await response.blob() as T;
      } else {
        // Default to text for other content types
        data = await response.text() as T;
      }
      
      setLoading(false);
      return { error: false, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(errorMessage);
      setLoading(false);
      return { error: true, data: { statusCode: 500, message: errorMessage } };
    }
  },
}));


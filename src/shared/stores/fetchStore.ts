import { create } from 'zustand';
import { ErrorResponse, SuccessResponse } from '@shared/api/types';
import { T_CONFIG_MAP } from '@shared/types/infra';

const IS_DEV = process.env.NODE_ENV === 'development';
const API_BASE_URL = process.env.API_BASE_URL || '';

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

      const urlConfig: T_CONFIG_MAP | undefined = window.urlConfig;
      const base = API_BASE_URL || urlConfig?.SUM_RM_API || '';
      const url = new URL(routeUrl, base);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }

      const prodUrl = urlConfig
        ? `${urlConfig.SUM_RM_API.replace('/api/rest/v1', '')}/api/rest/v1${routeUrl.replace(
            '/api/rest/v1',
            '',
          )}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''}`
        : url.toString();

      const response = await fetch(IS_DEV ? url.toString() : prodUrl, {
        method: method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.token ?? ''}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 401) {
        window.keycloak?.logout?.();
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let message = 'Ошибка запроса';
        let statusCode = response.status;
        if (contentType.includes('application/json')) {
          try {
            const err = await response.json();
            message = err?.message || message;
            statusCode = err?.statusCode || statusCode;
          } catch {
            // ignore json parse errors
          }
        }

        setError(message);
        return { error: true, data: { statusCode, message } };
      }

      const contentType = response.headers.get('content-type') || '';
      let data: T;
      const isBlob =
        !!fileName ||
        contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
        contentType.includes('application/vnd.ms-excel') ||
        contentType.includes('application/octet-stream');

      if (isBlob) {
        data = (await response.blob()) as T;
      } else if (contentType.includes('application/json')) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as T;
      }

      return { error: false, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(message);
      return { error: true, data: { statusCode: 500, message } };
    } finally {
      setLoading(false);
    }
  },
}));


import { create } from 'zustand';
import { ErrorResponse, SuccessResponse } from '@shared/api/types';
import { T_CONFIG_MAP } from '../types/infra';

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

      const urlConfig: T_CONFIG_MAP = (window as any)?.urlConfig;

      const url = new URL(routeUrl, API_BASE_URL || urlConfig.SUM_RM_API);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }

      const prodUrl = `${urlConfig.SUM_RM_API.replace(
        '/api/rest/v1',
        '',
      )}/api/rest/v1${routeUrl.replace('/api/rest/v1', '')}${
        url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''
      }`;

      console.log('🐸 Pepe said >> url:', url);

      console.log('🐸 Pepe said >> prodUrl:', prodUrl);

      const response = await fetch(IS_DEV ? url.toString() : prodUrl, {
        method: method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(window as any)?.token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
        .then((res) => {
          if (res.status === 401) {
            (window as any).keycloak.logout();
          }
          return res;
        })
        .catch((e) => {
          if (e.response && [401, 403].includes(e.response.status)) {
            (window as any).keycloak.logout();
          }

          if (e.response?.errors[0].extensions.exception.status === 401) {
            (window as any).keycloak.logout();
            (window as any).keycloak.login();
          }

          throw Error(e);
        });

      if (!response.ok) {
        let errorData: any = { message: 'Ошибка запроса', statusCode: response.status };
        try {
          errorData = await response.json();
        } catch {
          // If we can't parse error as JSON, use default message
        }
        setError(errorData.message || 'Ошибка запроса');
        return {
          error: true,
          data: {
            statusCode: errorData.statusCode || response.status,
            message: errorData.message || 'Ошибка запроса',
          },
        };
      }

      // Check if this is a blob response (Excel file export)
      const contentType = response.headers.get('content-type');
      let data: T;

      if (
        fileName ||
        (contentType &&
          (contentType.includes(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ) ||
            contentType.includes('application/vnd.ms-excel') ||
            contentType.includes('application/octet-stream')))
      ) {
        // Handle Excel/binary files as blob
        data = (await response.blob()) as T;
      } else if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Default to text for other content types
        data = (await response.text()) as T;
      }

      setLoading(false);
      return { error: false, data };
    } catch (error) {
      console.log('🐸 Pepe said >> error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(errorMessage);
      setLoading(false);
      return { error: true, data: { statusCode: 500, message: errorMessage } };
    }
  },
}));


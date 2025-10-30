import { useFetchStore } from '@shared/stores/fetchStore';

const IS_DEV = process.env.NODE_ENV === 'development';
const API_PREFIX = IS_DEV ? '/api/rest/v1' : '';

// Wrapper for production protectedFetch to handle blob responses
const createProductionFetchWrapper = (originalFetch: any) => {
  return async <T, N = void>(
    routeUrl: string,
    params?: Record<string, string>,
    body?: N,
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    fileName?: string,
  ) => {
    // Always try the original fetch function first
    try {
      const response = await originalFetch(routeUrl, params, body, method);
      
      // If the original function returns an error, pass it through
      if (response.error) {
        return response;
      }

      // If fileName is provided and we expect a blob response
      if (fileName) {
        // If the response data is already a blob, return it as is
        if (response.data instanceof Blob) {
          return response;
        }

        // If the response data is not a blob but we expected one,
        // it likely means the original fetch parsed it as JSON incorrectly
        // Try to detect if this is actually binary data that was parsed as JSON
        if (typeof response.data === 'string' && response.data.startsWith('PK')) {
          // This looks like a ZIP/Excel file that was parsed as text
          // We need to make a direct fetch call to get the proper blob
          const url = new URL(routeUrl, window.location.origin);
          if (params) {
            Object.entries(params).forEach(([key, value]) => {
              url.searchParams.set(key, value);
            });
          }

          const directResponse = await fetch(url.toString(), {
            method: method || 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
          });

          if (!directResponse.ok) {
            return {
              error: true,
              data: {
                statusCode: directResponse.status,
                message: 'Ошибка запроса',
              },
            };
          }

          const blobData = await directResponse.blob();
          return { error: false, data: blobData as T };
        }
      }

      // For all other cases, return the original response
      return response;
    } catch (error) {
      return {
        error: true,
        data: {
          statusCode: 500,
          message: error instanceof Error ? error.message : 'Неизвестная ошибка',
        },
      };
    }
  };
};

export const customInstance = async <T>(config: {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  responseType?: string;
  signal?: AbortSignal;
}): Promise<T> => {
  const { protectedFetch, protectedFetchDev } = useFetchStore.getState();

  // Use the development fetch directly, or wrap the production fetch
  const fetchFn = IS_DEV 
    ? protectedFetchDev 
    : createProductionFetchWrapper(protectedFetch);

  const queryParams = config.params
    ? Object.fromEntries(
        Object.entries(config.params).map(([key, value]) => {
          if (Array.isArray(value)) {
            return [key, value.join(',')];
          }
          return [key, String(value)];
        }),
      )
    : undefined;

  // For blob responses, we need to pass a hint to the fetch function
  const fileName = config.responseType === 'blob' ? 'export.xlsx' : undefined;

  const response = await fetchFn<T>(
    `${API_PREFIX}${config.url}`,
    queryParams,
    config.data as any,
    config.method,
    fileName,
  );

  if (response.error) {
    throw new Error(response.data.message || 'Ошибка запроса');
  }

  return response.data;
};

export default customInstance;

export type ErrorType<Error> = {
  message: string;
  statusCode: number;
} & Error;

export type BodyType<BodyData> = BodyData;


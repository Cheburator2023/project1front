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
    // If fileName is provided, we expect a blob response (like Excel export)
    // Make a direct fetch call to avoid JSON parsing issues in production
    if (fileName) {
      try {
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
      } catch (error) {
        console.log('🐸 Pepe said >> createProductionFetchWrapper >> blob error:', error);
        return {
          error: true,
          data: {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Ошибка при загрузке файла',
          },
        };
      }
    }

    // For non-blob responses, use the original fetch function
    try {
      const response = await originalFetch(routeUrl, params, body, method);
      return response;
    } catch (error) {
      console.log('🐸 Pepe said >> createProductionFetchWrapper >> error:', error);
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
  const fetchFn = IS_DEV ? protectedFetchDev : createProductionFetchWrapper(protectedFetch);

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


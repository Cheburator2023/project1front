/* eslint-disable default-param-last */
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

        console.log('🐸 Pepe said >> Direct fetch response:', {
          status: directResponse.status,
          statusText: directResponse.statusText,
          contentType: directResponse.headers.get('content-type'),
          url: url.toString(),
        });

        if (!directResponse.ok) {
          const errorText = await directResponse.text();
          console.log('🐸 Pepe said >> Error response body:', errorText);
          return {
            error: true,
            data: {
              statusCode: directResponse.status,
              message: 'Ошибка запроса',
            },
          };
        }

        // Check if the response is actually an Excel file
        const contentType = directResponse.headers.get('content-type');
        console.log('🐸 Pepe said >> Response content-type:', contentType);

        if (contentType && contentType.includes('text/html')) {
          // If we got HTML instead of Excel, log it and return an error
          const htmlContent = await directResponse.text();
          console.log('🐸 Pepe said >> Got HTML instead of Excel:', htmlContent.substring(0, 500));
          return {
            error: true,
            data: {
              statusCode: 400,
              message: 'Сервер вернул HTML вместо Excel файла',
            },
          };
        }

        const blobData = await directResponse.blob();
        console.log('🐸 Pepe said >> Blob data:', { size: blobData.size, type: blobData.type });
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
  console.log('🐸 Pepe said >> customInstance >> fileName:', fileName);

  // Use the development fetch directly, or wrap the production fetch
  const fetchFn =
    fileName || IS_DEV ? protectedFetchDev : createProductionFetchWrapper(protectedFetch);

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


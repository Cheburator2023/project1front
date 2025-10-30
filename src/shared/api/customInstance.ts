/* eslint-disable default-param-last */
import { useFetchStore } from '@shared/stores/fetchStore';

const IS_DEV = process.env.NODE_ENV === 'development';
const API_PREFIX = IS_DEV ? '/api/rest/v1' : '';

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
  const isBlob = config.responseType === 'blob';

  // Use the development fetch directly, or wrap the production fetch
  const fetchFn = isBlob || IS_DEV ? protectedFetchDev : protectedFetch;

  const response = await fetchFn<T>(
    `${API_PREFIX}${config.url}`,
    queryParams,
    config.data as any,
    config.method,
    isBlob ? 'file' : undefined,
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


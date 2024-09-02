import { useContext, useEffect, useState } from 'react';

import { FetchContext } from './FetchContext';
import { API_ROUTES } from './constants';

export interface MutationProtectedFetchProps<T> {
  body?: T;
  fetchApiRoute: API_ROUTES;
  fetchMethod: 'POST' | 'PUT' | 'DELETE' | 'GET';
  routeParam?: string | number;
  fileName?: string;
  newParams?: Record<string, string>;
  mockedResponse?: T;
}
interface FetchProps<T> {
  apiRoute?: API_ROUTES;
  params?: Record<string, string>;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  mockedResponse?: T;
  delay?: number;
}

const asyncFunc = (delay: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(''), delay);
  });

export const useFetch = <T>({
  apiRoute,
  params,
  mockedResponse,
  method = 'GET',
  delay = 500,
}: FetchProps<T>) => {
  const [responseData, setResponseData] = useState<T | undefined>(mockedResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [refetchStatus, setRefetchStatus] = useState(false);

  const { protectedFetch } = useContext(FetchContext);

  useEffect(() => {
    if (method !== 'GET' || !apiRoute) {
      return;
    }

    setLoading(true);

    // eslint-disable-next-line consistent-return
    (async () => {
      try {
        if (delay) {
          await asyncFunc(delay);
        }

        if (mockedResponse) {
          setLoading(false);
          return mockedResponse;
        }

        const response = await protectedFetch?.<void, T>(apiRoute, params);

        if (response && !response.error) {
          setResponseData(response.data);
          setError('');
        } else {
          setError('Ошибка загрузки');
        }

        setLoading(false);
      } catch {
        setError('Ошибка загрузки');
        setLoading(false);
      }
    })();
  }, [apiRoute, protectedFetch, mockedResponse, method, delay, refetchStatus]);

  const refetch = () => {
    setRefetchStatus((prevStatus) => !prevStatus);
  };

  return {
    // fetch for CREATE, UPDATE, DELETE operations
    mutationProtectedFetch: async <N, M>({
      body,
      fetchApiRoute,
      fetchMethod,
      routeParam,
      fileName,
      newParams = {},
      mockedResponse = undefined,
    }: MutationProtectedFetchProps<N>) => {
      const getRoute = () => {
        if (routeParam && fetchApiRoute) {
          return `${fetchApiRoute}/${routeParam}`;
        }

        return fetchApiRoute || apiRoute;
      };

      const route = getRoute();

      if (mockedResponse) {
        await asyncFunc(1000);
        return Promise.resolve({ data: mockedResponse, error: undefined });
      }

      if (route) {
        return protectedFetch?.<N, M>(route, newParams, body, fetchMethod ?? method, fileName);
      }
    },
    refetch,
    responseData,
    loading,
    error,
  };
};

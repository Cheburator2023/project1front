import { useContext, useEffect, useState } from 'react';

import { FetchContext } from './FetchContext';
import { API_ROUTES } from './constants';

interface FetchProps<T> {
  apiRoute?: API_ROUTES;
  params?: Record<string, string>;
  method?: 'POST' | 'GET' | 'PUT';
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

        const response = await protectedFetch?.<T>(apiRoute, params);

        if (response) {
          setResponseData(response);
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
    protectedFetch: <N, M>(
      body: N,
      newApiRoute?: API_ROUTES,
      newMethod?: 'POST' | 'GET' | 'PUT',
    ) => {
      const route = newApiRoute || apiRoute;

      if (route) {
        return protectedFetch?.<M, N>(route, params, body, newMethod ?? method);
      }
    },
    refetch,
    responseData,
    loading,
    error,
  };
};

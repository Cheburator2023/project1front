import { useContext, useEffect, useState } from 'react';
import qs from 'qs';
import { FetchContext } from './FetchContext';
import { API_ROUTES } from './constants';
import { stringToBoolean } from '../helpers/typeops';

const MOCKED_REQUESTS = stringToBoolean(process.env.MOCKED_REQUESTS);

export interface MutationProtectedFetchProps<T, N> {
  body?: T extends N ? T : any;
  fetchApiRoute: API_ROUTES;
  fetchMethod: 'POST' | 'PUT' | 'DELETE' | 'GET';
  routeParam?: string | number;
  fileName?: string;
  newParams?: Record<string, any>;
  mockedResponse?: N;
}

interface FetchProps<T> {
  apiRoute?: API_ROUTES;
  params?: Record<string, any>;
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
  mockedResponse: _mockedResponse,
  method = 'GET',
  delay = 200,
}: FetchProps<T>) => {
  const mockedResponse = MOCKED_REQUESTS ? _mockedResponse : undefined;
  const [responseData, setResponseData] = useState<T | undefined>(mockedResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refetchStatus, setRefetchStatus] = useState(false);

  const { protectedFetch } = useContext(FetchContext);

  useEffect(() => {
    if (method !== 'GET' || !apiRoute) return;

    setLoading(true);

    (async () => {
      try {
        if (delay) await asyncFunc(delay);
        if (mockedResponse) {
          setLoading(false);
          return mockedResponse;
        }

        const serializedParams = qs.stringify(params, { arrayFormat: 'repeat' });
        const fullUrl = serializedParams ? `${apiRoute}?${serializedParams}` : apiRoute;

        const response = await protectedFetch?.<void, T>(fullUrl, undefined);

        if (response && !response.error) {
          setResponseData(response.data as T);
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
    setRefetchStatus((prev) => !prev);
  };

  return {
    mutationProtectedFetch: async <N, M>({
      body,
      fetchApiRoute,
      fetchMethod,
      routeParam,
      fileName,
      newParams = {},
      mockedResponse: __mockedResponseProtected = undefined,
    }: MutationProtectedFetchProps<N, M>) => {
      const mockedResponseProtected = MOCKED_REQUESTS ? __mockedResponseProtected : undefined;
      const baseRoute = fetchApiRoute || apiRoute;

      const route = routeParam ? `${baseRoute}/${routeParam}` : baseRoute;

      if (mockedResponseProtected) {
        await asyncFunc(1000);
        return Promise.resolve({ data: mockedResponseProtected, error: undefined });
      }

      if (route) {
        const serializedParams = qs.stringify(newParams, { arrayFormat: 'repeat' });
        const fullUrl = serializedParams ? `${route}?${serializedParams}` : route;

        return protectedFetch?.<N, M>(fullUrl, undefined, body, fetchMethod ?? method, fileName);
      }
    },
    refetch,
    responseData,
    loading,
    error,
  };
};

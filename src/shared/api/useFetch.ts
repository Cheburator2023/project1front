/* eslint-disable no-use-before-define */
import { useEffect, useState } from 'react';

import { useFetchStore } from '@shared/stores/fetchStore';
import { API_ROUTES } from './constants';
import { stringToBoolean } from '../helpers/typeops';

const MOCKED_REQUESTS = stringToBoolean(process.env.MOCKED_REQUESTS);

export interface MutationProtectedFetchProps<T, N> {
  // TODO: check this types
  body?: T extends N ? T : any;
  fetchApiRoute: API_ROUTES;
  fetchMethod: 'POST' | 'PUT' | 'DELETE' | 'GET';
  routeParam?: string | number;
  fileName?: string;
  newParams?: Record<string, string>;
  mockedResponse?: N;
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
  mockedResponse: _mockedResponse,
  method = 'GET',
  delay = 200,
}: FetchProps<T>) => {
  const mockedResponse = MOCKED_REQUESTS ? _mockedResponse : undefined;

  const [responseData, setResponseData] = useState<T | undefined>(mockedResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [refetchStatus, setRefetchStatus] = useState(false);

  const { protectedFetch } = useFetchStore();

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
    setRefetchStatus((prevStatus) => !prevStatus);
  };

  return {
    // fetch for CREATE, UPDATE, DELETE operations
    // TODO: check this types
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

      const getRoute = () => {
        if (routeParam && fetchApiRoute) {
          return `${fetchApiRoute}/${routeParam}`;
        }

        return fetchApiRoute || apiRoute;
      };

      const route = getRoute();

      if (mockedResponseProtected) {
        await asyncFunc(1000);
        return Promise.resolve({ data: mockedResponseProtected, error: undefined });
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

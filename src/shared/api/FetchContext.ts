/* eslint-disable no-use-before-define */
import { createContext } from 'react';
import { ErrorResponse, SuccessResponse } from './types';

export const FetchContext = createContext<{
  protectedFetch?: <T, N = void>(
    routeUrl: string,
    params?: Record<string, string>,
    body?: N,
    method?: string,
    fileName?: string,
  ) => Promise<SuccessResponse<T> | ErrorResponse>;
}>({
  protectedFetch: undefined,
});

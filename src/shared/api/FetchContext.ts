import { createContext } from 'react';
import { ErrorResponse, SuccessResponse } from './types';

export const FetchContext = createContext<{
  // eslint-disable-next-line no-use-before-define
  protectedFetch?: <N, T = void>(
    routeUrl: string,
    params?: Record<string, string>,
    body?: N,
    method?: string,
    fileName?: string,
  ) => Promise<SuccessResponse<T> | ErrorResponse>;
}>({
  protectedFetch: undefined,
});

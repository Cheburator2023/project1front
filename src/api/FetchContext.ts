import { createContext } from 'react';

export const FetchContext = createContext<{
  // eslint-disable-next-line no-use-before-define
  protectedFetch?: <T, N = void>(
    routeUrl: string,
    params?: Record<string, string>,
    body?: N,
    method?: string,
  ) => Promise<T>;
}>({
  protectedFetch: undefined,
});

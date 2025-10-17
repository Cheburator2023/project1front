import React from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { DropdownProvider } from '@admiral-ds/react-ui';
import Keycloak from 'keycloak-js';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-enterprise';

import { ColumnsFilter } from '@shared/types';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import RoutesComponent from './Routes';

const GIT_REVISION = process.env.GIT_REVISION;
const RC_STATS = process.env.RC_STATS;

console.log('GIT_REVISION IS:', GIT_REVISION);
console.log('RELEASE_STATS IS:', RC_STATS);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: true,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
    },
  },
});

interface AppProps {
  bridged?: boolean;
  keycloak?: any;
  downloadReportStatus?: boolean;
  columnsFilters?: ColumnsFilter[];
  updateColumnsFilters?: (filters: ColumnsFilter[]) => void;
  setDownloadReportStatus?: (status: boolean) => void;
  user?: Keycloak.KeycloakTokenParsed & {
    family_name: string;
    given_name: string;
    realm_access: {
      roles: string[];
    };
    groups: string[];
    roles: string[];
    preferred_username: string;
  };
  onLogout?: () => void;
}

const IS_DEV = process.env.NODE_ENV === 'development';

const App = ({ user, onLogout, keycloak }: AppProps) => {
  const onLogoutHandler = () => {
    if (onLogout) {
      keycloak.logout({ redirectUri: window.location.origin });
      onLogout();
    }
    localStorage.removeItem('currentCustomer');
  };

  return (
    <div>
      <div id="portal-root" />
      <BrowserRouter basename={IS_DEV ? '/' : 'sum-rm'}>
        <QueryClientProvider client={queryClient}>
          <GlobalStyle />
          <Container>
            <Header user={user} onLogout={onLogoutHandler} />
            <RoutesWrapper>
              <RoutesComponent />
            </RoutesWrapper>
          </Container>
        </QueryClientProvider>
      </BrowserRouter>
    </div>
  );
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
  * {
    font-family: sans-serif;
  }
  .ag-watermark,
  .ag-watermark-text,
  .ag-watermark.ag-opacity-zero,
  div.ag-watermark.ag-opacity-zero,
  div.ag-watermark,
  div.ag-watermark-text {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }

  .ag-filter-apply-panel {
    gap: 8px;
  }

  .ag-ltr .ag-filter-apply-panel-button {
    margin-left: 0;
    width: 100%;
  }
  .ag-row-is-odd {
    background-color: aliceblue ;
  }

  & .ag-custom-cell-value {
    position: relative;
  }
  & .ag-custom-cell-value-changed .ag-custom-cell-value:before {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #00bb2f;
    margin: 18px -10px;
    position: absolute;
  }
  & .ag-custom-cell-value-changed {
    background-color: #15bf3b14;
  }
`;

const Container = styled('div')`
  min-width: 1600px;
`;

const RoutesWrapper = styled('div')`
  position: relative;
`;

export default App;
export * from './theme/theme';


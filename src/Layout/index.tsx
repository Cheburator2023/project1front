import React, { useCallback, useState } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { DropdownProvider } from '@admiral-ds/react-ui';
import Keycloak from 'keycloak-js';
import { FetchContext } from 'src/api';

import { Header } from './Header';
import { DownloadReportContext } from './DownloadReportContext';
import { themes } from './theme/theme';

import { ColumnsFilter } from 'src/modules/Home/TableModels/types';

interface LayoutProps {
  children: React.ReactNode;
  user?: Keycloak.KeycloakTokenParsed & { family_name: string; given_name: string };
  protectedFetch?: <T, N>(
    routeUrl: string,
    params?: Record<string, string>,
    body?: N,
    method?: string,
  ) => Promise<T>;
  goToSum?: () => void;
  onLogout?: () => void;
}

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

const Container = styled.div`
  min-width: 1600px;
`;

const Layout = ({ children, user, protectedFetch, goToSum, onLogout }: LayoutProps) => {
  const [downloadReportStatus, setDownloadReportStatus] = useState(false);
  const [columnsFilters, setColumnsFilters] = useState<Partial<ColumnsFilter>>();

  const updateColumnsFilters = useCallback((newColumnsFilters?: Partial<ColumnsFilter>) => {
    setColumnsFilters(newColumnsFilters);
  }, []);

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <FetchContext.Provider value={{ protectedFetch }}>
      <ThemeProvider theme={themes.light}>
        <DropdownProvider>
          <GlobalStyle />
          <DownloadReportContext.Provider value={{ updateColumnsFilters, downloadReportStatus }}>
            <Container>
              <Header
                user={user}
                downloadReportStatus={downloadReportStatus}
                columnsFilters={columnsFilters}
                updateColumnsFilters={updateColumnsFilters}
                updateDownloadReportStatus={setDownloadReportStatus}
                goToSum={goToSum}
                onLogout={onLogout}
              />
              {children}
            </Container>
          </DownloadReportContext.Provider>
        </DropdownProvider>
      </ThemeProvider>
    </FetchContext.Provider>
  );
};

export default Layout;
export * from './theme/theme';

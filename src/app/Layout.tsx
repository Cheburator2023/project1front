import React, { useCallback, useEffect, useState } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { DropdownProvider } from '@admiral-ds/react-ui';
import Keycloak from 'keycloak-js';

import { FetchContext, DownloadReportContext } from '@shared/api';
import { ColumnsFilter } from '@shared/types';

import { Header } from './Header';
import { themes } from './theme/theme';
import { useAppInjectStore } from '../shared/stores';
import { CUSTOMER_MAP } from '../shared/constants/customers';

interface LayoutProps {
  children: React.ReactNode;
  user?: Keycloak.KeycloakTokenParsed & {
    family_name: string;
    given_name: string;
    realm_access: {
      roles: string[];
    };
    roles: string[];
  };
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
  const { setCurrentCustomer } = useAppInjectStore();

  const updateColumnsFilters = useCallback((newColumnsFilters?: Partial<ColumnsFilter>) => {
    setColumnsFilters(newColumnsFilters);
  }, []);

  useEffect(() => {
    // DEV
    const currentCustomerLS = localStorage.getItem('currentCustomer');

    if (user && (Array.isArray(user?.roles) || Array.isArray(user?.realm_access?.roles))) {
      if (
        user?.roles?.toString().includes('validat') ||
        user?.realm_access.roles?.toString().includes('validat')
      ) {
        setCurrentCustomer(CUSTOMER_MAP.UMRV);
      }
    } else if (currentCustomerLS) {
      setCurrentCustomer(JSON.parse(currentCustomerLS));
    }
  }, [user?.roles, user?.realm_access, setCurrentCustomer]);

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

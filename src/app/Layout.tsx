import React, { useCallback, useEffect, useState } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { DropdownProvider } from '@admiral-ds/react-ui';
import Keycloak from 'keycloak-js';

import { FetchContext, DownloadReportContext } from '@shared/api';
import { ColumnsFilter, Permission, Role } from '@shared/types';

import { useUserStore, useAppInjectStore } from '@src/shared/stores';
import { Header } from './Header';
import { themes } from './theme/theme';

import { CUSTOMER_MAP } from '../shared/constants/customers';

const GIT_REVISION = process.env.GIT_REVISION;
const RC_STATS = process.env.RC_STATS;

console.log('GIT_REVISION IS:', GIT_REVISION);
console.log('RELEASE_STATS IS:', RC_STATS);

interface LayoutProps {
  children: React.ReactNode;
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
  protectedFetch?: <T, N>(
    routeUrl: string,
    params?: Record<string, string>,
    body?: N,
    method?: string,
  ) => Promise<T>;
  goToSum?: () => void;
  onLogout?: () => void;
}

const Layout = ({ children, user, protectedFetch, goToSum, onLogout }: LayoutProps) => {
  const [downloadReportStatus, setDownloadReportStatus] = useState(false);
  const [columnsFilters, setColumnsFilters] = useState<Partial<ColumnsFilter>>();
  const { setCurrentCustomer } = useAppInjectStore();
  const { setUsername, setGroups, setRoles, setPermissions } = useUserStore();

  const updateColumnsFilters = useCallback((newColumnsFilters?: Partial<ColumnsFilter>) => {
    setColumnsFilters(newColumnsFilters);
  }, []);

  useEffect(() => {
    // DEV
    const currentCustomerLS = localStorage.getItem('currentCustomer');

    if (user && (Array.isArray(user?.roles) || Array.isArray(user?.realm_access?.roles))) {
      if (
        user?.groups?.toString().includes('validator') ||
        user?.groups?.toString().includes('ds_validator') ||
        user?.groups?.toString().includes('validator_lead') ||
        user?.groups?.toString().includes('business_customer') ||
        user?.groups?.toString().includes('Validator_lead')
      ) {
        setCurrentCustomer(CUSTOMER_MAP.UMRV);
      }
    } else if (currentCustomerLS) {
      setCurrentCustomer(JSON.parse(currentCustomerLS));
    }

    if (user?.preferred_username) {
      setUsername(user?.preferred_username);
    }

    if (user?.groups) {
      setGroups(user.groups);

      const roles = user.groups.filter((group) =>
        Object.values(Role).includes(group as Role),
      ) as Role[];
      setRoles(roles);
    }

    if (user?.realm_access?.roles) {
      const permissions = user.realm_access.roles.filter((permission) =>
        Object.values(Permission).includes(permission as Permission),
      ) as Permission[];

      setPermissions(permissions);
    }
  }, [user?.roles, user?.realm_access, setCurrentCustomer]);

  const onLogoutHandler = () => {
    if (onLogout) {
      onLogout();
    }
    localStorage.removeItem('currentCustomer');
  };

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
                onLogout={onLogoutHandler}
              />
              <RoutesWrapper>{children}</RoutesWrapper>
            </Container>
          </DownloadReportContext.Provider>
        </DropdownProvider>
      </ThemeProvider>
    </FetchContext.Provider>
  );
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
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

const Container = styled.div`
  min-width: 1600px;
`;

const RoutesWrapper = styled.div`
  position: relative;
`;

export default Layout;
export * from './theme/theme';


/* eslint-disable import/no-unresolved */
// @ts-ignore
import { createBridgeComponent } from '@module-federation/bridge-react/v18';

import { useCallback, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { ThemeProvider } from 'styled-components';
import { DropdownProvider } from '@admiral-ds/react-ui';
import App from './app/App';
import { themes } from './app/theme/theme';

import { T_CONFIG_MAP, T_KEYCLOAK_USER } from './shared/types/infra';
import { ColumnsFilter, Permission, Role } from './shared/types';
import { useFetchStore, useGlobalStore, useUserStore } from './shared/stores';
import { CUSTOMER_MAP } from './shared/constants/customers';
import { Flexbox, Loading } from './shared/ui/atoms';
import { useDeepEffect } from './shared/hooks/useDeepEffect';

export type MFProps = {
  urlConfig?: T_CONFIG_MAP;
  token?: string;
  user?: T_KEYCLOAK_USER;
  userPermissions?: string[];
  navigate?: (to: string) => void;
  protectedFetch?: any;
  bridged?: boolean;
  onLogout?: () => void;
};

const MfeRoot = (props: MFProps) => {
  console.log('MfeRoot >> props:', props);
  const { user, protectedFetch, onLogout } = props;

  const { setCurrentCustomer } = useGlobalStore();
  const { setUsername, setGroups, setRoles, setPermissions } = useUserStore();
  const { setProtectedFetch, protectedFetch: protectedFetchFromStore } = useFetchStore();

  useDeepEffect(() => {
    if (protectedFetch) {
      setProtectedFetch(protectedFetch);
    }
  }, [props, setProtectedFetch]);

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

  return (
    <ThemeProvider theme={themes.light}>
      <DropdownProvider>
        {(!protectedFetchFromStore as any) ? (
          <Flexbox justifyContent="center" alignItems="center" width="100%" height="100%">
            <Loading text="Загрузка mfe свойств..." />
          </Flexbox>
        ) : (
          <App {...props} bridged user={user} onLogout={onLogout} />
        )}
      </DropdownProvider>
    </ThemeProvider>
  );
};

export default createBridgeComponent({
  rootComponent: MfeRoot,
});


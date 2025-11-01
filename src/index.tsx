import React from 'react';
import ReactDOM from 'react-dom/client';

import { ThemeProvider } from 'styled-components';
import { DropdownProvider } from '@admiral-ds/react-ui';
import { themes } from './app/theme/theme';

import App from './app/App';

(window as any).urlConfig = {
  SUM_FRONTEND: 'http://test.host:8002/test',
  SUM_API: 'https://test.host',
  SMART_ANKETA_FRONTEND: 'http://test.host:8004',
  SMART_ANKETA_API: 'http://test.host:8004',
  SUM_RM_API: 'https://test.host/api/rest/v1',
  KEYCLOAK_URL: 'https://test.host/auth',
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ThemeProvider theme={themes.light}>
    <DropdownProvider>
      <App />
    </DropdownProvider>
  </ThemeProvider>,
);


import React from 'react';
import ReactDOM from 'react-dom/client';

import { ThemeProvider } from 'styled-components';
import { DropdownProvider } from '@admiral-ds/react-ui';
import { themes } from './app/theme/theme';

import { Flexbox, Loading } from './shared/ui/atoms';
import App from './app/App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ThemeProvider theme={themes.light}>
    <DropdownProvider>
      <App />
    </DropdownProvider>
  </ThemeProvider>,
);


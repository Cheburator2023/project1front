import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import RoutesComponent from './Routes';
import Layout from './Layout';

export const App = () => (
  <div>
    <BrowserRouter>
      <Layout>
        <RoutesComponent />
      </Layout>
    </BrowserRouter>
  </div>
);

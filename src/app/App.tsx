import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import RoutesComponent from './Routes';
import Layout from './Layout';

export const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Layout>
          <RoutesComponent />
        </Layout>
      </BrowserRouter>
    </div>
  );
};

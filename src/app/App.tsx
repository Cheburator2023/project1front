import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import RoutesComponent from './Routes';
import Layout from './Layout';

const IS_DEV = process.env.NODE_ENV === 'development';

export const App = () => {
  return (
    <div>
      <BrowserRouter basename={IS_DEV ? '/sum-rm' : '/'}>
        <Layout>
          <RoutesComponent />
        </Layout>
      </BrowserRouter>
    </div>
  );
};

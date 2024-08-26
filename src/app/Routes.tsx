import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { Home } from '@pages';

function RoutesComponent() {
  const routes: React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>> | null =
    useRoutes([
      {
        path: '/',
        index: true,
        element: <Home />,
      },
      {
        path: 'charts',
        element: <div>Графики и дашборды</div>,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ]);

  return routes;
}

export default RoutesComponent;

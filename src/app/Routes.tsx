import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { Home, ChartsDashboardPage } from '@pages';

const ROUTE_MAP = [
  {
    path: '/',
    index: true,
    element: <Home />,
  },
  {
    path: 'charts',
    element: <ChartsDashboardPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

function RoutesComponent() {
  const routes: React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>> | null =
    useRoutes(ROUTE_MAP);

  return routes;
}

export default RoutesComponent;


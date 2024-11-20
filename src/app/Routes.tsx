import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { Home, ChartsDashboardPage } from '@pages';
import { Playground } from '@pages/Playground';
import { FutureTableHomePage } from '@pages/Playground/FutureTableHomePage';

const ROUTE_MAP = [
  {
    path: '/',
    index: true,
    element: <Home />,
  },
  {
    path: '/future_table',
    element: <FutureTableHomePage />,
  },
  {
    path: 'charts',
    element: <ChartsDashboardPage />,
  },
  {
    path: '/playground',
    element: <Playground />,
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


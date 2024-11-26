import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { Home, ChartsDashboardPage } from '@pages';
import { Playground } from '@pages/Playground';
import { FutureTableHomePage } from '@pages/Playground/FutureTableHomePage';

export const ROUTES = {
  HOME: '/',
  FUTURE_TABLE: 'future_table',
  CHARTS: 'charts',
  PLAYGROUND: 'playground',
};

const ROUTE_MAP = [
  {
    path: ROUTES.HOME,
    index: true,
    element: <Home />,
  },
  {
    path: ROUTES.FUTURE_TABLE,
    element: <FutureTableHomePage />,
  },
  {
    path: ROUTES.CHARTS,
    element: <ChartsDashboardPage />,
  },
  {
    path: ROUTES.PLAYGROUND,
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


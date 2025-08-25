import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { Home, ChartsDashboardPage } from '@pages';
import { Playground } from '@pages/Playground';

export const ROUTES = {
  HOME: '/',
  MF_HOME_ROUTE: '/sum-rm',
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
    path: ROUTES.MF_HOME_ROUTE,
    element: <Home />,
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


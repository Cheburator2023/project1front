import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { ChartsDashboardPage, ChartsDashboardPageBI, HomePage } from '@pages';
import { Playground } from '@pages/Playground';
import { CompareModelsPage } from '../pages/CompareModelsPage/CompareModelsPage';

export const ROUTES = {
  HOME: '/',
  COMPARE_MODELS: '/compare-models',
  MF_HOME_ROUTE: '/sum-rm',
  CHARTS: 'charts',
  CHARTS_BI: 'charts_bi',
  PLAYGROUND: 'playground',
};

const ROUTE_MAP = [
  {
    path: ROUTES.HOME,
    index: true,
    element: <HomePage />,
  },
  {
    path: ROUTES.MF_HOME_ROUTE,
    element: <HomePage />,
  },
  {
    path: ROUTES.COMPARE_MODELS,
    element: <CompareModelsPage />,
  },
  {
    path: ROUTES.CHARTS,
    element: <ChartsDashboardPage />,
  },
  {
    path: ROUTES.CHARTS_BI,
    element: <ChartsDashboardPageBI />,
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


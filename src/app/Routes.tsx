import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { ChartsDashboardPage, ChartsDashboardPageBI, HomePage } from '@pages';
import { Playground } from '@pages/Playground';
import { CompareModelsPage } from '../pages/CompareModelsPage/CompareModelsPage';
import { AllocationConfirmationPage } from '../features/AllocationConfirmation/pages/AllocationConfirmationPage';

const IS_DEV = process.env.NODE_ENV === 'development';

/** Paths are relative to basename: prod uses `/sum-rm` → home is `/`; dev uses `/` → home is `/sum-rm`. */
export const ROUTES = {
  HOME: IS_DEV ? '/sum-rm' : '/',
  COMPARE_MODELS: '/compare-models',
  ALLOCATION_CONFIRMATION: '/allocation-confirmation',
  MF_HOME_ROUTE: IS_DEV ? '/sum-rm' : '/',
  CHARTS: 'charts',
  CHARTS_BI: 'charts_bi',
  PLAYGROUND: 'playground',
};

const ROUTE_MAP = [
  {
    path: ROUTES.HOME,
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
    path: ROUTES.ALLOCATION_CONFIRMATION,
    element: <AllocationConfirmationPage />,
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


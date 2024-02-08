import { RouteObject } from 'react-router-dom';

import Dashboard from '.';

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
];

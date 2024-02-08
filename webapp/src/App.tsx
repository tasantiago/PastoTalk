import type { Router as RemixRouter } from '@remix-run/router';
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router-dom';

import { ProtectedLayout } from './components/ProtectedLayout';
import { AuthProvider } from './context/AuthProvider';
import { dashboardRoutes } from './modules/dashBoard/routes';
import { firstScreenRoutes } from './modules/firstScreen/routes';
import { loginRoutes } from './modules/loginScreen/routes';

function App() {
  const allRoutesProtected = [...firstScreenRoutes, ...dashboardRoutes];

  const applyProtectedLayout = (routes: RouteObject[]) => {
    return routes.map((route) => ({
      ...route,
      element: <ProtectedLayout>{route.element}</ProtectedLayout>,
    }));
  };

  const router: RemixRouter = createBrowserRouter([
    ...applyProtectedLayout(allRoutesProtected),
    ...loginRoutes,
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

import { ConfigProvider, Spin } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/AuthProvider/useAuth';
import { resourceConfigs } from './modules/records/config';
const DashboardLayout = lazy(() =>
  import('./components/DashboardLayout').then((m) => ({ default: m.DashboardLayout })),
);
const AuthScreen = lazy(() =>
  import('./modules/auth/AuthScreen').then((m) => ({ default: m.AuthScreen })),
);
const Overview = lazy(() =>
  import('./modules/dashboard/Overview').then((m) => ({ default: m.Overview })),
);
const CrudPage = lazy(() =>
  import('./modules/records/CrudPage').then((m) => ({ default: m.CrudPage })),
);
const MembersPage = lazy(() =>
  import('./modules/members/MembersPage').then((m) => ({ default: m.MembersPage })),
);
const ProfileScreen = lazy(() =>
  import('./modules/profile/ProfileScreen').then((m) => ({ default: m.ProfileScreen })),
);
function AppRoutes() {
  const { session, loading } = useAuth();
  if (loading)
    return (
      <div className="full-loading">
        <Spin size="large" />
        <p>Carregando sua conta…</p>
      </div>
    );
  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/dashboard" replace /> : <AuthScreen />}
      />
      <Route
        path="/register"
        element={session ? <Navigate to="/dashboard" replace /> : <AuthScreen register />}
      />
      <Route element={session ? <DashboardLayout /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<Overview />} />
        {Object.entries(resourceConfigs).map(([path, config]) => (
          <Route key={path} path={`/${path}`} element={<CrudPage key={path} config={config} />} />
        ))}
        <Route path="/members" element={<MembersPage />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Route>
      <Route path="*" element={<Navigate to={session ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
export default function App() {
  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        token: {
          colorPrimary: '#427449',
          borderRadius: 10,
          fontFamily: 'Inter, system-ui, sans-serif',
          colorText: '#263529',
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="full-loading">
                <Spin size="large" />
              </div>
            }
          >
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

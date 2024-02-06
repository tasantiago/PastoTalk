import { useAuth } from '../../context/AuthProvider/useAuth';
import { Navigate } from 'react-router-dom';

export const ProtectedLayout = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();

  console.log(auth);
  if (!auth.user?.id) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

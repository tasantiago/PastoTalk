import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { getUserLocalStorage } from '../../context/AuthProvider/util';

export const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  const token = getUserLocalStorage();

  if (!token.user?.id) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

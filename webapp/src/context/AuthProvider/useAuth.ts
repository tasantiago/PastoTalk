import { useContext } from 'react';

import { AuthContext } from './index';
export function useAuth() {
  const a = useContext(AuthContext);
  if (!a) throw new Error('AuthContext ausente');
  return a;
}

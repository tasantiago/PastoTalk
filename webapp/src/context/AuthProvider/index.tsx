import { createContext, useEffect, useState } from 'react';

import { IAuthProvider, IContext, IUser } from './types';
import { getUserLocalStorage, LoginRequest, setUserLocalStorage } from './util';

export const AuthContext = createContext<IContext>({} as IContext);

export const AuthProvider = ({ children }: IAuthProvider) => {
  const [user, setUser] = useState<IUser | null>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUserLocalStorage();
    if (user) {
      setUser(user);
    }
  }, []);

  async function authenticate(username: string, password: string) {
    const response: IUser = await LoginRequest(username, password);

    const payload = { token: response.token, user: response.user };

    setUser(payload);
    setUserLocalStorage(payload);
    setLoading(false);
  }

  function logout() {
    setUser(null);
    setUserLocalStorage(null);
  }
  return (
    <AuthContext.Provider value={{ ...user, authenticate, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

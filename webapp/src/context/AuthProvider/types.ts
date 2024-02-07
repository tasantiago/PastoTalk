export interface IUser {
  token?: string;
  user?: {
    id: string; // uuid é uma string
    nome: string;
  };
}

export interface IContext extends IUser {
  authenticate: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface IAuthProvider {
  children: JSX.Element;
}

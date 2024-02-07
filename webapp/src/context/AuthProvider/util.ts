import { Api } from '../../services/api';
import { AUTHORIZATION_KEY } from '../../shared/constants/authorizationConstants';
import { IUser } from './types';

export function setUserLocalStorage(user: IUser | null) {
  localStorage.setItem(AUTHORIZATION_KEY, JSON.stringify(user));
}

export function getUserLocalStorage() {
  const json = localStorage.getItem(AUTHORIZATION_KEY);

  if (!json) {
    return null;
  }

  const user = JSON.parse(json);

  return user ?? null;
}

export async function LoginRequest(username: string, password: string) {
  try {
    const request = await Api.post('login', { username, password });

    return request.data;
  } catch (error) {
    return null;
  }
}

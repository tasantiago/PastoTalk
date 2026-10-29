import axios from 'axios';

import type { Session } from '../types';
let session: Session | null = null;
export const setApiSession = (s: Session | null) => {
  session = s;
};
export const Api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});
Api.interceptors.request.use((c) => {
  if (session) c.headers.Authorization = `Bearer ${session.token}`;
  return c;
});
Api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401 && e.config?.url !== '/login')
      window.dispatchEvent(new Event('pastotalk:session-expired'));
    return Promise.reject(e);
  },
);
export function errorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (typeof e.response?.data?.erro === 'string') return e.response.data.erro;
    if (e.code === 'ECONNABORTED') return 'O servidor demorou para responder. Tente novamente.';
    if (!e.response)
      return 'Não foi possível acessar o servidor. Verifique sua conexão e tente novamente.';
  }
  return 'Não foi possível concluir a operação. Tente novamente.';
}

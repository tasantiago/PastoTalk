import type { Session } from '../types';
const key = 'pastotalk:session';
export function readSession(): Session | null {
  try {
    const s = JSON.parse(localStorage.getItem(key) || 'null');
    return s &&
      typeof s.token === 'string' &&
      typeof s.user?.id === 'string' &&
      typeof s.user?.nome === 'string'
      ? s
      : null;
  } catch {
    return null;
  }
}
export function saveSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(key, JSON.stringify(s));
    else localStorage.removeItem(key);
  } catch {
    /* Session works in memory when storage is unavailable. */
  }
}

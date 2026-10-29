import { createContext, useContext } from 'react';

import type { Location } from '../types';
interface FarmState {
  locations: Location[];
  selected: number | null;
  loading: boolean;
  reload: () => Promise<void>;
  select: (id: number | null) => void;
}
export const FarmContext = createContext<FarmState | null>(null);
export function useFarm() {
  const f = useContext(FarmContext);
  if (!f) throw new Error('FarmContext ausente');
  return f;
}

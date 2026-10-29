export type Role = 'admin' | 'editor' | 'viewer';
export interface Session {
  token: string;
  user: { id: string; nome: string };
}
export interface Profile {
  id: string;
  name: string;
  email: string;
  username: string;
}
export interface Location {
  id: number;
  name: string;
  address: string;
  dairyCattle: boolean;
  role: Role;
}
export interface Member {
  id: string;
  name: string;
  username: string;
  role: Role;
}
export interface DashboardData {
  locations: number;
  animals: number;
  milk: number;
  income: number;
  expense: number;
  received: number;
  paid: number;
  period: string;
  milkByDay: { date: string; quantity: number }[];
}
export type RecordValue = string | number | boolean | null;
export type FarmRecord = { id: number; [key: string]: RecordValue };

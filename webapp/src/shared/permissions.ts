import type { Role } from '../types';
export const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  editor: 'Colaborador',
  viewer: 'Somente leitura',
};
export const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({ value, label }));
export const canWrite = (r: unknown) => r === 'admin' || r === 'editor';
export const canManage = (r: unknown) => r === 'admin';
export const roleLabel = (r: unknown) => roleLabels[r as Role] || 'Sem acesso';

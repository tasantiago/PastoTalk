export const money = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
export const number = (n: number, places = 3) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: places }).format(n);
export const dateLabel = (s: string) => s.slice(0, 10).split('-').reverse().join('/');
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

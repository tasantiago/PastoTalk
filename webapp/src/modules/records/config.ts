export interface Field {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'url';
  required?: boolean;
  initial?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  options?: { value: string; label: string }[];
}
export interface ResourceConfig {
  resource: string;
  title: string;
  singular: string;
  subtitle: string;
  columns: string[];
  search: string[];
  fields: Field[];
}
const date: Field = { key: 'date', label: 'Data', type: 'date', required: true };
const description: Field = {
  key: 'description',
  label: 'Descrição',
  type: 'text',
  required: true,
  maxLength: 255,
};
const value: Field = {
  key: 'value',
  label: 'Valor total (R$)',
  type: 'number',
  required: true,
  min: 0.01,
  max: 999999999999.99,
  step: 0.01,
};
export const resourceConfigs: Record<string, ResourceConfig> = {
  locations: {
    resource: 'locations',
    title: 'Propriedades',
    singular: 'propriedade',
    subtitle: 'Um lugar para cada parte da sua gestão.',
    columns: ['name', 'address', 'dairyCattle'],
    search: ['name', 'address'],
    fields: [
      { key: 'name', label: 'Nome da propriedade', type: 'text', required: true, maxLength: 100 },
      {
        key: 'address',
        label: 'Endereço / localização',
        type: 'text',
        required: true,
        maxLength: 255,
      },
      { key: 'dairyCattle', label: 'Atividade leiteira', type: 'boolean', initial: true },
    ],
  },
  animals: {
    resource: 'animals',
    title: 'Rebanho',
    singular: 'animal',
    subtitle: 'Acompanhe a trajetória de cada animal.',
    columns: ['name', 'gender', 'birthDate', 'entryDate', 'status'],
    search: ['name'],
    fields: [
      {
        key: 'name',
        label: 'Identificação do animal',
        type: 'text',
        required: true,
        maxLength: 100,
      },
      { key: 'birthDate', label: 'Nascimento', type: 'date', required: true },
      {
        key: 'gender',
        label: 'Sexo',
        type: 'select',
        required: true,
        initial: 'female',
        options: [
          { value: 'female', label: 'Fêmea' },
          { value: 'male', label: 'Macho' },
        ],
      },
      { key: 'entryDate', label: 'Entrada na propriedade', type: 'date', required: true },
      { key: 'deathDate', label: 'Óbito (opcional)', type: 'date' },
      { key: 'saleDate', label: 'Venda (opcional)', type: 'date' },
      { key: 'photoURL', label: 'URL da foto (opcional)', type: 'url', maxLength: 2048 },
    ],
  },
  'milk-productions': {
    resource: 'milk-productions',
    title: 'Produção de leite',
    singular: 'produção',
    subtitle: 'Registre cada ordenha e acompanhe os litros produzidos.',
    columns: ['date', 'quantity'],
    search: ['date', 'quantity'],
    fields: [
      date,
      {
        key: 'quantity',
        label: 'Quantidade (litros)',
        type: 'number',
        required: true,
        min: 0.001,
        max: 99999999999.999,
        step: 0.001,
      },
    ],
  },
  'milk-prices': {
    resource: 'milk-prices',
    title: 'Preço do leite',
    singular: 'preço',
    subtitle: 'O histórico do valor por litro da sua propriedade.',
    columns: ['date', 'price'],
    search: ['date', 'price'],
    fields: [
      date,
      {
        key: 'price',
        label: 'Preço por litro (R$)',
        type: 'number',
        required: true,
        min: 0.0001,
        max: 9999999999.9999,
        step: 0.0001,
      },
    ],
  },
  incomes: {
    resource: 'incomes',
    title: 'Receitas',
    singular: 'receita',
    subtitle: 'Organize entradas e acompanhe recebimentos.',
    columns: ['description', 'date', 'value', 'received'],
    search: ['description', 'date'],
    fields: [
      description,
      date,
      value,
      { key: 'received', label: 'Recebida', type: 'boolean', initial: false },
    ],
  },
  expenses: {
    resource: 'expenses',
    title: 'Despesas',
    singular: 'despesa',
    subtitle: 'Acompanhe custos, pagamentos e compromissos.',
    columns: ['description', 'date', 'value', 'paid', 'installments'],
    search: ['description', 'date'],
    fields: [
      description,
      date,
      value,
      { key: 'paid', label: 'Paga', type: 'boolean', initial: false },
      {
        key: 'installments',
        label: 'Número de parcelas',
        type: 'number',
        required: true,
        min: 1,
        max: 360,
        step: 1,
        initial: 1,
      },
    ],
  },
};

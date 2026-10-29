import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useFarm } from '../../context/FarmContext';
import { Api, errorMessage } from '../../services/api';
import { dateLabel, money, number, today } from '../../shared/format';
import { canManage, canWrite, roleLabel } from '../../shared/permissions';
import type { FarmRecord, RecordValue } from '../../types';
import type { Field, ResourceConfig } from './config';
const labels: Record<string, string> = {
  name: 'Identificação',
  address: 'Localização',
  dairyCattle: 'Atividade',
  gender: 'Sexo',
  birthDate: 'Nascimento',
  entryDate: 'Entrada',
  status: 'Situação',
  date: 'Data',
  description: 'Descrição',
  value: 'Valor total',
  quantity: 'Litros',
  price: 'Preço por litro',
  paid: 'Pagamento',
  received: 'Recebimento',
  installments: 'Parcelas',
};
function show(r: FarmRecord, key: string) {
  const v = r[key];
  if (key === 'status')
    return (
      <Tag color={r.deathDate ? 'default' : r.saleDate ? 'gold' : 'green'}>
        {r.deathDate ? 'Óbito' : r.saleDate ? 'Vendido' : 'Ativo'}
      </Tag>
    );
  if (key === 'gender') return v === 'female' ? 'Fêmea' : 'Macho';
  if (key === 'value') return money(Number(v));
  if (key === 'price') return `${number(Number(v), 4)} R$/L`;
  if (key === 'quantity') return `${number(Number(v))} L`;
  if (key === 'dairyCattle')
    return <Tag color={v ? 'green' : 'default'}>{v ? 'Leiteira' : 'Não leiteira'}</Tag>;
  if (key === 'paid' || key === 'received')
    return (
      <Tag color={v ? 'green' : 'gold'}>
        {v ? (key === 'paid' ? 'Paga' : 'Recebida') : 'Pendente'}
      </Tag>
    );
  if (key.toLowerCase().includes('date')) return v ? dateLabel(String(v)) : '—';
  return v == null ? '—' : String(v);
}
function input(f: Field) {
  if (f.type === 'boolean') return <Switch />;
  if (f.type === 'select') return <Select options={f.options} placeholder="Selecione" />;
  if (f.type === 'number')
    return (
      <InputNumber
        min={f.min}
        max={f.max}
        step={f.step}
        style={{ width: '100%' }}
        decimalSeparator=","
      />
    );
  return (
    <Input
      type={f.type === 'date' ? 'date' : f.type === 'url' ? 'url' : 'text'}
      maxLength={f.maxLength}
    />
  );
}
export function CrudPage({ config }: { config: ResourceConfig }) {
  const farm = useFarm();
  const navigate = useNavigate();
  const isLocations = config.resource === 'locations';
  const writable = canWrite(farm.locations.find((l) => l.id === farm.selected)?.role);
  const [records, setRecords] = useState<FarmRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [toast, holder] = message.useMessage();
  const endpoint = isLocations
    ? '/locations'
    : farm.selected
      ? `/locations/${farm.selected}/${config.resource}`
      : null;
  const scope = useRef(endpoint);
  scope.current = endpoint;
  const request = useRef(0);
  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError('');
    if (!endpoint) {
      setRecords([]);
      setLoading(false);
      return;
    }
    try {
      const { data } = await Api.get<FarmRecord[]>(endpoint);
      if (current === request.current) setRecords(data);
    } catch (e) {
      if (current === request.current) {
        setError(errorMessage(e));
        setRecords([]);
      }
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [endpoint]);
  useEffect(() => {
    setModal(false);
    setSearch('');
    void load();
    return () => {
      request.current++;
    };
  }, [load]);
  const manageable = (id: number) => canManage(farm.locations.find((l) => l.id === id)?.role);
  function open(r?: FarmRecord) {
    setEditing(r?.id ?? null);
    setFormError('');
    form.resetFields();
    form.setFieldsValue(
      Object.fromEntries(
        config.fields.map((f) => [
          f.key,
          r
            ? r[f.key]
            : (f.initial ??
              (f.type === 'date' && f.required
                ? today()
                : f.type === 'boolean'
                  ? false
                  : undefined)),
        ]),
      ),
    );
    setModal(true);
  }
  async function save(v: Record<string, RecordValue>) {
    if (!endpoint || saving) return;
    const saved = endpoint;
    setSaving(true);
    setFormError('');
    const payload = Object.fromEntries(
      config.fields.map((f) => [
        f.key,
        f.type === 'date' && !f.required && !v[f.key]
          ? null
          : f.type === 'boolean'
            ? Boolean(v[f.key])
            : (v[f.key] ?? ''),
      ]),
    );
    try {
      const { data } = editing
        ? await Api.put<FarmRecord>(`${endpoint}/${editing}`, payload)
        : await Api.post<FarmRecord>(endpoint, payload);
      if (scope.current !== saved) return;
      setRecords((old) =>
        editing ? old.map((r) => (r.id === editing ? data : r)) : [data, ...old],
      );
      setModal(false);
      void toast.success('Registro salvo com sucesso.');
      if (isLocations) await farm.reload();
    } catch (e) {
      if (scope.current === saved) setFormError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }
  async function remove(id: number) {
    if (!endpoint || deleting !== null) return;
    const saved = endpoint;
    setDeleting(id);
    try {
      await Api.delete(`${endpoint}/${id}`);
      if (scope.current !== saved) return;
      setRecords((old) => old.filter((r) => r.id !== id));
      void toast.success(isLocations ? 'Propriedade arquivada.' : 'Registro excluído.');
      if (isLocations) await farm.reload();
    } catch (e) {
      void toast.error(errorMessage(e));
    } finally {
      setDeleting(null);
    }
  }
  const columns: ColumnsType<FarmRecord> = config.columns.map((key) => ({
    title: labels[key] || key,
    dataIndex: key,
    key,
    sorter:
      key === 'status'
        ? undefined
        : (a, b) =>
            typeof a[key] === 'number'
              ? Number(a[key]) - Number(b[key])
              : String(a[key]).localeCompare(String(b[key]), 'pt-BR'),
    render: (_v, r) => show(r, key),
  }));
  if (isLocations)
    columns.push({
      title: 'Seu acesso',
      key: 'role',
      render: (_v, r) => roleLabel(farm.locations.find((l) => l.id === r.id)?.role),
    });
  if (isLocations || writable)
    columns.push({
      title: 'Ações',
      key: 'actions',
      render: (_v, r) => (
        <div className="row-actions">
          {isLocations && (
            <Button
              size="small"
              onClick={() => {
                farm.select(r.id);
                navigate('/members');
              }}
            >
              Equipe
            </Button>
          )}
          {(!isLocations || manageable(r.id)) && (
            <>
              <Button
                size="small"
                onClick={() => open(r)}
                aria-label={`Editar ${r.name || r.description || config.singular}`}
              >
                Editar
              </Button>
              <Popconfirm
                title={isLocations ? 'Arquivar esta propriedade?' : 'Excluir este registro?'}
                description={
                  isLocations
                    ? 'Os dados serão preservados, mas sairão da gestão.'
                    : 'Esta ação não pode ser desfeita.'
                }
                okText={isLocations ? 'Arquivar' : 'Excluir'}
                cancelText="Cancelar"
                onConfirm={() => remove(r.id)}
              >
                <Button
                  size="small"
                  danger
                  loading={deleting === r.id}
                  disabled={deleting !== null}
                >
                  {isLocations ? 'Arquivar' : 'Excluir'}
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      ),
    });
  const filtered = useMemo(
    () =>
      records.filter((r) =>
        config.search.some((k) =>
          String(r[k] ?? '')
            .toLocaleLowerCase('pt-BR')
            .includes(search.toLocaleLowerCase('pt-BR')),
        ),
      ),
    [records, config, search],
  );
  return (
    <>
      {holder}
      <div className="page-heading">
        <div>
          <span className="eyebrow">GESTÃO DO CAMPO</span>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        {(isLocations || writable) && (
          <Button
            type="primary"
            size="large"
            disabled={!endpoint || loading || Boolean(error)}
            onClick={() => open()}
          >
            + Adicionar {config.singular}
          </Button>
        )}
      </div>
      {!endpoint ? (
        <div className="surface empty-state">
          <Empty description="Primeiro, cadastre uma propriedade para começar." />
          <Link to="/locations">
            <Button type="primary">Cadastrar propriedade</Button>
          </Link>
        </div>
      ) : (
        <>
          {!isLocations && !writable && (
            <Alert
              type="info"
              showIcon
              className="form-alert"
              message="Seu acesso é somente leitura. Você pode consultar os registros desta propriedade."
            />
          )}
          {error && (
            <Alert
              type="error"
              showIcon
              message={error}
              className="form-alert"
              action={<Button onClick={() => void load()}>Tentar novamente</Button>}
            />
          )}
          <section className="surface records-panel">
            <div className="table-toolbar">
              <strong>{loading ? 'Carregando…' : `${records.length} registros`}</strong>
              <Input.Search
                className="table-search"
                aria-label="Buscar registros"
                placeholder="Buscar nos registros"
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              loading={loading}
              scroll={{ x: 'max-content' }}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                showTotal: (n) => `${n} registros`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      error
                        ? 'Não foi possível carregar os registros.'
                        : search
                          ? 'Nenhum registro encontrado para esta busca.'
                          : 'Nenhum registro ainda.'
                    }
                  />
                ),
              }}
            />
          </section>
          {config.resource === 'expenses' && (
            <p className="helper-text">
              O valor é o total da despesa. As parcelas são informativas; não são gerados
              lançamentos automáticos.
            </p>
          )}
          {config.resource === 'milk-prices' && (
            <p className="helper-text">
              Um preço por data e propriedade. O histórico não gera receitas automaticamente.
            </p>
          )}
        </>
      )}
      <Modal
        title={`${editing ? 'Editar' : 'Adicionar'} ${config.singular}`}
        open={modal && (isLocations ? editing === null || manageable(editing) : writable)}
        onCancel={() => {
          if (!saving) setModal(false);
        }}
        footer={null}
        destroyOnClose
        closable={!saving}
        maskClosable={!saving}
      >
        <p className="modal-context">
          {isLocations
            ? 'Dados da propriedade'
            : farm.locations.find((l) => l.id === farm.selected)?.name}
        </p>
        {formError && <Alert type="error" showIcon message={formError} className="form-alert" />}
        <Form
          form={form}
          layout="vertical"
          onFinish={save}
          disabled={saving}
          requiredMark="optional"
        >
          {config.fields.map((f) => (
            <Form.Item
              key={f.key}
              name={f.key}
              label={f.label}
              valuePropName={f.type === 'boolean' ? 'checked' : 'value'}
              rules={[
                ...(f.required
                  ? [{ required: true, message: `Informe ${f.label.toLowerCase()}.` }]
                  : []),
                ...(f.type === 'text' && f.required
                  ? [{ whitespace: true, message: 'O campo não pode conter apenas espaços.' }]
                  : []),
                ...(f.type === 'url'
                  ? [{ pattern: /^https?:\/\//i, message: 'Use uma URL http:// ou https://.' }]
                  : []),
              ]}
            >
              {input(f)}
            </Form.Item>
          ))}
          <div className="modal-actions">
            <Button disabled={saving} onClick={() => setModal(false)}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Salvar {config.singular}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

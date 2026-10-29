import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
} from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthProvider/useAuth';
import { useFarm } from '../../context/FarmContext';
import { Api, errorMessage } from '../../services/api';
import { canManage, roleLabel, roleOptions } from '../../shared/permissions';
import type { Member, Role } from '../../types';
export function MembersPage() {
  const farm = useFarm();
  const { session } = useAuth();
  const location = farm.locations.find((l) => l.id === farm.selected);
  const admin = canManage(location?.role);
  const endpoint = location ? `/locations/${location.id}/members` : null;
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [toast, holder] = message.useMessage();
  const generation = useRef(0);
  const scope = useRef(endpoint);
  scope.current = endpoint;
  const load = useCallback(async () => {
    const current = ++generation.current;
    setError('');
    setLoading(true);
    try {
      const data = endpoint ? (await Api.get<Member[]>(endpoint)).data : [];
      if (current === generation.current) setMembers(data);
    } catch (e) {
      if (current === generation.current) {
        setError(errorMessage(e));
        setMembers([]);
      }
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [endpoint]);
  useEffect(() => {
    setModal(false);
    setEditing(null);
    void load();
    return () => {
      generation.current++;
    };
  }, [load]);
  const admins = members.filter((m) => m.role === 'admin').length;
  function open(m: Member | null = null) {
    setEditing(m);
    setFormError('');
    form.resetFields();
    form.setFieldsValue({ role: m?.role ?? 'viewer' });
    setModal(true);
  }
  async function save(v: { username: string; role: Role }) {
    if (!endpoint || !admin || saving || busy) return;
    const saved = endpoint;
    setSaving(true);
    setFormError('');
    try {
      if (editing) await Api.put(`${endpoint}/${editing.id}`, { role: v.role });
      else await Api.post(endpoint, { username: v.username.trim(), role: v.role });
      if (scope.current !== saved) return;
      setModal(false);
      void toast.success('Acesso atualizado.');
      if (editing?.id === session?.user.id) await farm.reload();
      else await load();
    } catch (e) {
      if (scope.current === saved) setFormError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }
  async function remove(m: Member) {
    if (!endpoint || !admin || busy || saving) return;
    const saved = endpoint;
    setBusy(m.id);
    setError('');
    try {
      await Api.delete(`${endpoint}/${m.id}`);
      if (scope.current !== saved) return;
      void toast.success('Membro removido da propriedade.');
      if (m.id === session?.user.id) await farm.reload();
      else await load();
    } catch (e) {
      if (scope.current === saved) setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      {holder}
      <div className="page-heading">
        <div>
          <span className="eyebrow">GESTÃO COMPARTILHADA</span>
          <h1>Equipe</h1>
          <p>
            {location
              ? `Quem tem acesso a ${location.name}.`
              : 'Selecione uma propriedade para consultar sua equipe.'}
          </p>
        </div>
        {admin && (
          <Button
            type="primary"
            size="large"
            disabled={loading || Boolean(error) || Boolean(busy)}
            onClick={() => open()}
          >
            + Adicionar membro
          </Button>
        )}
      </div>
      {!location ? (
        <div className="surface empty-state">
          <Empty description="Cadastre uma propriedade para começar." />
          <Link to="/locations">
            <Button type="primary">Cadastrar propriedade</Button>
          </Link>
        </div>
      ) : (
        <>
          <Alert
            type="info"
            showIcon
            className="form-alert"
            message={`Seu acesso: ${roleLabel(location.role)}`}
            description="Administradores gerenciam a propriedade e a equipe. Colaboradores alteram os registros de gestão. Somente leitura permite consultar os dados."
          />
          {error && (
            <Alert
              type="error"
              showIcon
              className="form-alert"
              message={error}
              action={<Button onClick={() => void load()}>Tentar novamente</Button>}
            />
          )}
          <section className="surface records-panel">
            <Table<Member>
              rowKey="id"
              loading={loading}
              dataSource={members}
              pagination={false}
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  title: 'Nome',
                  dataIndex: 'name',
                  render: (name: string, m) => (
                    <>
                      {name}
                      {m.id === session?.user.id && <Tag style={{ marginLeft: 8 }}>Você</Tag>}
                    </>
                  ),
                },
                { title: 'Usuário', dataIndex: 'username' },
                {
                  title: 'Acesso',
                  dataIndex: 'role',
                  render: (role: Role) => (
                    <Tag
                      color={role === 'admin' ? 'green' : role === 'editor' ? 'blue' : 'default'}
                    >
                      {roleLabel(role)}
                    </Tag>
                  ),
                },
                ...(admin
                  ? [
                      {
                        title: 'Ações',
                        key: 'actions',
                        render: (_: unknown, m: Member) => {
                          const last = m.role === 'admin' && admins <= 1;
                          return (
                            <div className="row-actions">
                              <Button
                                size="small"
                                disabled={last || Boolean(busy)}
                                onClick={() => open(m)}
                                aria-label={`Alterar acesso de ${m.username}`}
                              >
                                Alterar acesso
                              </Button>
                              <Popconfirm
                                title={`Remover ${m.name} da propriedade?`}
                                description="Os registros e a conta serão preservados. O acesso será revogado."
                                okText="Remover"
                                cancelText="Cancelar"
                                onConfirm={() => remove(m)}
                              >
                                <Button
                                  size="small"
                                  danger
                                  disabled={last || Boolean(busy)}
                                  loading={busy === m.id}
                                  aria-label={`Remover ${m.username}`}
                                >
                                  Remover
                                </Button>
                              </Popconfirm>
                              {last && <span className="helper-text">Último administrador</span>}
                            </div>
                          );
                        },
                      },
                    ]
                  : []),
              ]}
            />
          </section>
          {admin && (
            <p className="helper-text">
              Adicione uma conta já cadastrada pelo nome de usuário. Para alterar ou remover o
              último administrador, promova outro membro primeiro.
            </p>
          )}
        </>
      )}
      <Modal
        title={editing ? 'Alterar acesso' : 'Adicionar membro'}
        open={modal && admin}
        footer={null}
        onCancel={() => {
          if (!saving) setModal(false);
        }}
        closable={!saving}
        maskClosable={!saving}
        destroyOnClose
      >
        {formError && <Alert type="error" showIcon message={formError} className="form-alert" />}
        {editing ? (
          <p>
            Acesso de <strong>{editing.username}</strong> nesta propriedade.
          </p>
        ) : (
          <p>A pessoa precisa ter uma conta no PastoTalk. O acesso será concedido imediatamente.</p>
        )}
        <Form form={form} layout="vertical" onFinish={save} disabled={saving}>
          {!editing && (
            <Form.Item
              name="username"
              label="Nome de usuário"
              rules={[{ required: true, whitespace: true, message: 'Informe o nome de usuário.' }]}
            >
              <Input maxLength={80} autoComplete="off" />
            </Form.Item>
          )}
          <Form.Item name="role" label="Papel na propriedade" rules={[{ required: true }]}>
            <Select options={roleOptions} />
          </Form.Item>
          <div className="modal-actions">
            <Button disabled={saving} onClick={() => setModal(false)}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {editing ? 'Salvar acesso' : 'Adicionar membro'}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

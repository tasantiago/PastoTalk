import { Alert, Button, Form, Input, message, Spin } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../context/AuthProvider/useAuth';
import { Api, errorMessage } from '../../services/api';
import type { Profile } from '../../types';
export function ProfileScreen() {
  const auth = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, holder] = message.useMessage();
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      form.setFieldsValue((await Api.get<Profile>('/me')).data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [form]);
  useEffect(() => {
    void load();
  }, [load]);
  async function save(v: Profile) {
    setSaving(true);
    setError('');
    try {
      const { data } = await Api.put<Profile>('/me', {
        name: v.name,
        email: v.email,
        username: v.username,
      });
      form.setFieldsValue(data);
      auth.updateName(data.name);
      void toast.success('Perfil atualizado.');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      {holder}
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEU ESPAÇO</span>
          <h1>Minha conta</h1>
          <p>Atualize os dados usados para entrar e compartilhar a gestão.</p>
        </div>
      </div>
      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          className="form-alert"
          action={<Button onClick={() => void load()}>Tentar novamente</Button>}
        />
      )}
      <section className="surface profile-panel">
        {loading ? (
          <Spin />
        ) : (
          <Form form={form} layout="vertical" onFinish={save} disabled={saving}>
            <Form.Item name="name" label="Seu nome" rules={[{ required: true, whitespace: true }]}>
              <Input maxLength={255} />
            </Form.Item>
            <Form.Item name="email" label="E-mail" rules={[{ required: true, type: 'email' }]}>
              <Input maxLength={255} type="email" />
            </Form.Item>
            <Form.Item
              name="username"
              label="Usuário"
              rules={[{ required: true, whitespace: true }]}
            >
              <Input maxLength={80} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              Salvar perfil
            </Button>
          </Form>
        )}
      </section>
    </>
  );
}

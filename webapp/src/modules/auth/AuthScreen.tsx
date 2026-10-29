import { Alert, Button, Form, Input } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthProvider/useAuth';
import { Api, errorMessage } from '../../services/api';
interface Values {
  name: string;
  email: string;
  username: string;
  password: string;
}
export function AuthScreen({ register = false }: { register?: boolean }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function submit(v: Values) {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      if (register) await Api.post('/users', v);
      await auth.login(v.username, v.password);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="auth-layout">
      <section className="auth-story">
        <Link className="brand" to="/login">
          Pasto<span>Talk</span>
          <i>.</i>
        </Link>
        <div>
          <span className="eyebrow">GESTÃO RURAL COM CLAREZA</span>
          <h1>
            Mais cuidado.
            <br />
            Mais controle.
            <br />
            <em>Mais campo.</em>
          </h1>
          <p>
            Do rebanho às finanças, acompanhe sua propriedade e compartilhe a gestão com quem está
            ao seu lado.
          </p>
          <div className="field-lines" aria-hidden="true">
            ⌁⌁⌁
          </div>
        </div>
        <small>Feito para o ritmo da sua fazenda.</small>
      </section>
      <section className="auth-form">
        <div>
          <span className="eyebrow">BEM-VINDO AO PASTOTALK</span>
          <h2>{register ? 'Seu próximo passo começa aqui.' : 'Bom te ver por aqui.'}</h2>
          <p>
            {register
              ? 'Crie sua conta e organize a rotina da propriedade.'
              : 'Entre para acompanhar a sua propriedade.'}
          </p>
          {error && <Alert type="error" showIcon message={error} className="form-alert" />}
          <Form layout="vertical" onFinish={submit} disabled={saving} requiredMark={false}>
            {register && (
              <>
                <Form.Item
                  name="name"
                  label="Seu nome"
                  rules={[{ required: true, whitespace: true, message: 'Informe seu nome.' }]}
                >
                  <Input maxLength={255} autoComplete="name" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="E-mail"
                  rules={[{ required: true, type: 'email', message: 'Informe um e-mail válido.' }]}
                >
                  <Input maxLength={255} type="email" autoComplete="email" />
                </Form.Item>
              </>
            )}
            <Form.Item
              name="username"
              label="Usuário"
              rules={[{ required: true, whitespace: true, message: 'Informe seu usuário.' }]}
            >
              <Input maxLength={80} autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Senha"
              rules={[
                { required: true, message: 'Informe sua senha.' },
                ...(register ? [{ min: 8, message: 'Use pelo menos 8 caracteres.' }] : []),
              ]}
            >
              <Input.Password
                maxLength={72}
                autoComplete={register ? 'new-password' : 'current-password'}
              />
            </Form.Item>
            <Button size="large" block type="primary" htmlType="submit" loading={saving}>
              {register ? 'Criar conta e entrar' : 'Entrar na minha conta'}
            </Button>
          </Form>
          <p className="auth-switch">
            {register ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
            <Link to={register ? '/login' : '/register'}>
              {register ? 'Entrar' : 'Criar conta'}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

import { Alert, Button, Empty, Spin } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthProvider/useAuth';
import { useFarm } from '../../context/FarmContext';
import { Api, errorMessage } from '../../services/api';
import { dateLabel, money, number } from '../../shared/format';
import { canWrite } from '../../shared/permissions';
import type { DashboardData } from '../../types';
export function Overview() {
  const farm = useFarm();
  const { session } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);
  const writable = canWrite(farm.locations.find((l) => l.id === farm.selected)?.role);
  const load = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setError('');
    try {
      const response = await Api.get<DashboardData>(
        `/dashboard${farm.selected ? `?locationID=${farm.selected}` : ''}`,
      );
      if (request === generation.current) setData(response.data);
    } catch (e) {
      if (request === generation.current) {
        setError(errorMessage(e));
        setData(null);
      }
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [farm.selected]);
  useEffect(() => {
    void load();
    return () => {
      generation.current++;
    };
  }, [load]);
  const location = farm.locations.find((l) => l.id === farm.selected);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEU CAMPO EM PERSPECTIVA</span>
          <h1>Olá, {session?.user.nome.split(' ')[0]}.</h1>
          <p>
            {location
              ? `${location.name} · indicadores do mês corrente`
              : 'Um olhar claro sobre o que acontece na sua propriedade.'}
          </p>
        </div>
        <span className="period-chip">
          {data
            ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
                new Date(data.period.slice(0, 10) + 'T12:00:00'),
              )
            : 'Mês corrente'}
        </span>
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
      {loading ? (
        <div className="section-loading">
          <Spin />
        </div>
      ) : !farm.locations.length ? (
        <section className="surface welcome-card">
          <span className="eyebrow">COMECE PELO ESSENCIAL</span>
          <h2>Dê um lugar aos seus planos.</h2>
          <p>
            Cadastre sua primeira propriedade para acompanhar o rebanho, a produção e as finanças.
          </p>
          <Link to="/locations">
            <Button type="primary" size="large">
              Cadastrar propriedade
            </Button>
          </Link>
        </section>
      ) : (
        data && (
          <>
            <section className="metric-grid">
              {[
                {
                  label: 'Animais ativos',
                  value: number(data.animals, 0),
                  path: '/animals',
                  detail: 'No rebanho da propriedade',
                },
                {
                  label: 'Produção no mês',
                  value: `${number(data.milk)} L`,
                  path: '/milk-productions',
                  detail: 'Soma das ordenhas registradas',
                },
                {
                  label: 'Receitas no mês',
                  value: money(data.income),
                  path: '/incomes',
                  detail: 'Entradas previstas e recebidas',
                },
                {
                  label: 'Despesas no mês',
                  value: money(data.expense),
                  path: '/expenses',
                  detail: 'Custos previstos e pagos',
                },
              ].map((m) => (
                <Link className="surface metric-card" key={m.path} to={m.path}>
                  <span>{m.label}</span>
                  <strong>{m.value}</strong>
                  <small>{m.detail}</small>
                </Link>
              ))}
            </section>
            <div className="dashboard-grid">
              <section className="surface chart-panel">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">ROTINA QUE RENDE</span>
                    <h2>Produção de leite</h2>
                  </div>
                  <Link to="/milk-productions">Ver registros →</Link>
                </div>
                {data.milkByDay.length ? (
                  <MilkChart data={data.milkByDay} />
                ) : (
                  <div className="empty-state">
                    <Empty description="Ainda não há produção registrada neste mês." />
                    <Link to="/milk-productions">
                      <Button>{writable ? 'Registrar produção' : 'Consultar produção'}</Button>
                    </Link>
                  </div>
                )}
              </section>
              <section className="surface finance-panel">
                <span className="eyebrow">FINANÇAS DO MÊS</span>
                <h2>O campo em equilíbrio.</h2>
                <div className="balance">
                  <span>Saldo previsto</span>
                  <strong className={data.income - data.expense < 0 ? 'negative' : ''}>
                    {money(data.income - data.expense)}
                  </strong>
                </div>
                <dl>
                  <div>
                    <dt>Recebido</dt>
                    <dd>{money(data.received)}</dd>
                  </div>
                  <div>
                    <dt>Pago</dt>
                    <dd>{money(data.paid)}</dd>
                  </div>
                  <div>
                    <dt>Saldo recebido/pago</dt>
                    <dd>{money(data.received - data.paid)}</dd>
                  </div>
                </dl>
                <p className="helper-text">
                  Totais pela data do lançamento. Produção de leite não gera receitas
                  automaticamente.
                </p>
              </section>
            </div>
            {writable && (
              <section className="quick-actions">
                <h2>Vamos cuidar do próximo passo?</h2>
                <div>
                  {[
                    ['/animals', 'Registrar um animal'],
                    ['/milk-productions', 'Lançar produção'],
                    ['/incomes', 'Adicionar receita'],
                    ['/expenses', 'Adicionar despesa'],
                  ].map(([path, label]) => (
                    <Link className="surface" key={path} to={path}>
                      <strong>{label}</strong>
                      <span>→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )
      )}
    </>
  );
}
function MilkChart({ data }: { data: { date: string; quantity: number }[] }) {
  const max = Math.max(...data.map((d) => d.quantity), 1);
  const x = (i: number) => 48 + (i / Math.max(data.length - 1, 1)) * 580;
  const y = (q: number) => 200 - (q / max) * 155;
  return (
    <div className="milk-chart">
      <svg
        viewBox="0 0 680 250"
        role="img"
        aria-label={`Produção diária. ${data.map((d) => `${dateLabel(d.date)}: ${number(d.quantity)} litros`).join('; ')}`}
      >
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1="48"
              x2="644"
              y1={200 - f * 155}
              y2={200 - f * 155}
              stroke="#e1e8dc"
              strokeDasharray="4 4"
            />
            <text x="0" y={204 - f * 155} fill="#849080" fontSize="11">
              {number(max * f, 0)} L
            </text>
          </g>
        ))}
        {data.length > 1 && (
          <polyline
            points={data.map((d, i) => `${x(i)},${y(d.quantity)}`).join(' ')}
            fill="none"
            stroke="#638c4d"
            strokeWidth="3"
          />
        )}
        {data.map((d, i) => (
          <circle key={d.date} cx={x(i)} cy={y(d.quantity)} r="4" fill="#638c4d">
            <title>
              {dateLabel(d.date)}: {number(d.quantity)} L
            </title>
          </circle>
        ))}
        <text x="48" y="233" fill="#849080" fontSize="12">
          {dateLabel(data[0].date)}
        </text>
        {data.length > 1 && (
          <text x="628" y="233" textAnchor="end" fill="#849080" fontSize="12">
            {dateLabel(data[data.length - 1].date)}
          </text>
        )}
      </svg>
      <p className="helper-text">Cada ponto soma as ordenhas de um dia com produção registrada.</p>
    </div>
  );
}

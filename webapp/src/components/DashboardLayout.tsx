import { Alert, Button, Select, Spin } from 'antd';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider/useAuth';
import { FarmContext } from '../context/FarmContext';
import { Api, errorMessage } from '../services/api';
import type { Location } from '../types';
const nav = [
  ['/dashboard', 'Visão geral', '◫'],
  ['/locations', 'Propriedades', '⌂'],
  ['/members', 'Equipe', '♧'],
  ['/animals', 'Rebanho', '♧'],
  ['/milk-productions', 'Produção de leite', '◉'],
  ['/milk-prices', 'Preço do leite', '＄'],
  ['/incomes', 'Receitas', '↗'],
  ['/expenses', 'Despesas', '↘'],
];
export function DashboardLayout() {
  const auth = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobile, setMobile] = useState(false);
  const selectedRef = useRef<number | null>(null);
  const generation = useRef(0);
  const key = `pastotalk:location:${auth.session?.user.id}`;
  const select = useCallback(
    (id: number | null) => {
      selectedRef.current = id;
      setSelected(id);
      try {
        if (id) localStorage.setItem(key, String(id));
        else localStorage.removeItem(key);
      } catch {
        /* Keep selection in memory. */
      }
    },
    [key],
  );
  const reload = useCallback(
    async (quiet = false) => {
      const current = ++generation.current;
      if (!quiet) setLoading(true);
      setError('');
      try {
        const { data } = await Api.get<Location[]>('/locations');
        if (current !== generation.current) return;
        setLocations(data);
        let saved = selectedRef.current;
        if (!saved) {
          try {
            saved = Number(localStorage.getItem(key));
          } catch {
            saved = null;
          }
        }
        select(data.find((l) => l.id === saved)?.id ?? data[0]?.id ?? null);
      } catch (e) {
        if (current === generation.current) setError(errorMessage(e));
      } finally {
        if (current === generation.current) setLoading(false);
      }
    },
    [key, select],
  );
  useEffect(() => {
    void reload();
    return () => {
      generation.current++;
    };
  }, [reload]);
  useEffect(() => {
    const focus = () => {
      void reload(true);
    };
    window.addEventListener('focus', focus);
    return () => window.removeEventListener('focus', focus);
  }, [reload]);
  return (
    <FarmContext.Provider value={{ locations, selected, loading, reload, select }}>
      <div className="app-shell">
        <aside className={`sidebar ${mobile ? 'is-open' : ''}`}>
          <NavLink className="brand" to="/dashboard" onClick={() => setMobile(false)}>
            Pasto<span>Talk</span>
            <i>.</i>
          </NavLink>
          <span className="sidebar-caption">SUA FAZENDA, MAIS PERTO</span>
          <nav aria-label="Menu principal" onClick={() => setMobile(false)}>
            {nav.map(([path, label, icon]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-symbol" aria-hidden="true">
                  {icon}
                </span>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <NavLink to="/profile" className="user-card" onClick={() => setMobile(false)}>
              <span className="avatar">{auth.session?.user.nome.charAt(0).toUpperCase()}</span>
              <div>
                <strong>{auth.session?.user.nome}</strong>
                <small>Minha conta</small>
              </div>
            </NavLink>
            <Button block onClick={auth.logout}>
              Sair da conta
            </Button>
          </div>
        </aside>
        {mobile && (
          <button
            className="sidebar-overlay"
            aria-label="Fechar menu"
            onClick={() => setMobile(false)}
          />
        )}
        <div className="workspace">
          <header className="topbar">
            <div>
              <button
                className="menu-toggle"
                aria-label="Abrir menu"
                aria-expanded={mobile}
                onClick={() => setMobile(!mobile)}
              >
                ☰
              </button>
              <span className="topbar-label">Gestão da propriedade</span>
            </div>
            <div className="location-picker">
              <label htmlFor="property-select">PROPRIEDADE</label>
              <Select
                id="property-select"
                aria-label="Propriedade selecionada"
                value={selected}
                loading={loading}
                placeholder="Cadastre sua propriedade"
                onChange={select}
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
              />
            </div>
          </header>
          <main className="main-content">
            {error && (
              <Alert
                type="error"
                showIcon
                message={error}
                className="form-alert"
                action={<Button onClick={() => void reload()}>Tentar novamente</Button>}
              />
            )}
            {loading ? (
              <div className="section-loading">
                <Spin />
                <p>Carregando propriedades…</p>
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="section-loading">
                    <Spin />
                  </div>
                }
              >
                {!error && <Outlet />}
              </Suspense>
            )}
          </main>
          <footer className="footer">PastoTalk · Feito para acompanhar o ritmo do campo.</footer>
        </div>
      </div>
    </FarmContext.Provider>
  );
}

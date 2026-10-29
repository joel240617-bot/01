import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  House,
  Building2,
  ChartNoAxesCombined,
  ShieldCheck,
  UserRoundCheck,
  Cctv,
  Bell,
  Database,
  RefreshCw,
  Search,
  Menu,
  ChevronDown,
  X,
} from "lucide-react";
import { useApp } from "../state/AppContext";
import { normalize } from "../utils/calculations";
import { PeriodSelect, Toast, Modal } from "./UI";
import brandReference from "../assets/sidebar-reference.png";
export const nav = [
  { path: "visao-geral", label: "Visão Geral", icon: House },
  { path: "hospitais", label: "Hospitais", icon: Building2 },
  { path: "raio-x", label: "Raio-X", icon: ChartNoAxesCombined },
  { path: "controle-acesso", label: "Controle de Acesso", icon: ShieldCheck },
  { path: "vigilancia", label: "Vigilância", icon: UserRoundCheck },
  { path: "cameras", label: "Câmeras", icon: Cctv },
  { path: "alarmes", label: "Alarmes", icon: Bell },
  { path: "custos", label: "Custos", icon: Database },
  { path: "atualizacao", label: "Atualização", icon: RefreshCw },
];
export function Layout() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState(false);
  const { state, selectHospital } = useApp();
  const navigate = useNavigate();
  const matches = state.hospitals.filter((h) =>
    normalize(h.name + " " + h.city + " " + h.id).includes(normalize(query)),
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Ir para conteúdo
      </a>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <img
            className="brand-reference"
            src={brandReference}
            alt="Athena Saúde — Hospital Maranhense"
          />
          <button
            className="mobile-close icon-button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X />
          </button>
        </div>
        <nav aria-label="Navegação principal">
          {nav.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={`/${path}`} onClick={() => setOpen(false)}>
              <Icon size={23} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div />
          <strong>Athena Saúde</strong>
          <p>
            Cuidando de pessoas,
            <br />
            protegendo o futuro.
          </p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Abrir menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
          <div className="global-search">
            <Search size={20} />
            <input
              aria-label="Busca global de hospitais"
              placeholder="Buscar hospital, cidade ou informação..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
                if (e.key === "Enter" && matches[0]) {
                  selectHospital(matches[0].id);
                  navigate("/raio-x");
                  setQuery("");
                }
              }}
            />
            {query && (
              <div className="search-results">
                {matches.length ? (
                  matches.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        selectHospital(h.id);
                        setQuery("");
                        navigate("/raio-x");
                      }}
                    >
                      <Building2 />
                      <span>
                        <b>{h.name}</b>
                        <small>
                          {h.city} · {h.id}
                        </small>
                      </span>
                    </button>
                  ))
                ) : (
                  <p>Nenhum hospital encontrado.</p>
                )}
              </div>
            )}
          </div>
          <div className="top-period">
            <span>Competência</span>
            <PeriodSelect />
          </div>
          <button
            className="profile"
            onClick={() => setProfile(true)}
            aria-label="Informações do ambiente demonstrativo"
          >
            <span className="avatar">JS</span>
            <span>
              <b>João Silva</b>
              <small>Gestor de Segurança</small>
            </span>
            <ChevronDown size={17} />
          </button>
        </header>
        <main id="main">
          <Outlet />
        </main>
      </div>
      <Toast />
      {profile && (
        <Modal title="Ambiente demonstrativo" onClose={() => setProfile(false)}>
          <div className="modal-body">
            <p>
              João Silva é um perfil ilustrativo das referências. Esta etapa
              permite explorar e editar os dados locais dos hospitais.
            </p>
            <p>
              As alterações permanecem somente nesta sessão e são descartadas ao
              recarregar a aplicação.
            </p>
            <button className="primary" onClick={() => setProfile(false)}>
              Entendido
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

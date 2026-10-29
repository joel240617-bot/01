import {
  useEffect,
  useRef,
  useState,
  useId,
  isValidElement,
  cloneElement,
} from "react";
import type { ReactNode, ReactElement } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Building2,
  MapPin,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useHospital, useApp } from "../state/AppContext";
import { periods, regionals } from "../data/demo";
import { periodName } from "../utils/calculations";
import hospitalReference from "../assets/hospital-reference.png";
export function Panel({
  title,
  icon: Icon,
  actions,
  children,
  className = "",
}: {
  title?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-heading">
          <h2>
            {Icon && <Icon />}
            {title}
          </h2>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
export function Stat({
  label,
  value,
  sub,
  icon: Icon,
  tone = "blue",
  onClick,
  children,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: LucideIcon;
  tone?: string;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const content = (
    <>
      <div className={`stat-icon ${tone}`}>{Icon && <Icon />}</div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {sub && <span className="stat-sub">{sub}</span>}
        {children}
      </div>
    </>
  );
  return onClick ? (
    <button className="stat" onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className="stat">{content}</div>
  );
}
export function Badge({ status }: { status: string }) {
  const style =
    status === "Ativo" || status === "Operacional" || status === "Unidade Ativa"
      ? "green"
      : status === "Inativo"
        ? "gray"
        : "amber";
  return (
    <span className={`badge ${style}`}>
      <i />
      {status}
    </span>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder = "Buscar...",
  label = "Pesquisar",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="search-field">
      <Search size={19} />
      <input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button aria-label="Limpar pesquisa" onClick={() => onChange("")}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  const id = useId();
  const native = isValidElement(children) && typeof children.type === "string";
  return (
    <div className={`field ${error ? "invalid" : ""}`}>
      <label htmlFor={native ? id : undefined}>{label}</label>
      {native
        ? cloneElement(
            children as ReactElement<{
              id?: string;
              "aria-describedby"?: string;
            }>,
            { id, "aria-describedby": error ? `${id}-error` : undefined },
          )
        : children}
      {error && (
        <small id={`${id}-error`} role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
export function PeriodSelect() {
  const { period, setPeriod } = useApp();
  return (
    <div className="select-icon">
      <CalendarDays size={18} />
      <select
        aria-label="Competência"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
      >
        {[...periods].reverse().map((p) => (
          <option key={p} value={p}>
            {periodName(p)}
          </option>
        ))}
      </select>
    </div>
  );
}
export function HospitalSelect() {
  const { hospitalId, selectHospital, state } = useApp();
  return (
    <select
      aria-label="Hospital selecionado"
      value={hospitalId}
      onChange={(e) => selectHospital(e.target.value)}
    >
      {state.hospitals.map((h) => (
        <option value={h.id} key={h.id}>
          {h.name}
        </option>
      ))}
    </select>
  );
}
export function HospitalBanner({ compact = false }: { compact?: boolean }) {
  const { hospital, state, hospitalId, period } = useHospital();
  if (!hospital) return null;
  const last = state.changes.find(
    (c) => c.hospitalId === hospitalId && c.period === period,
  );
  return (
    <div className={`hospital-banner ${compact ? "compact" : ""}`}>
      <div className="hospital-placeholder">
        <img src={hospitalReference} alt="Hospital Maranhense" />
      </div>
      <div className="hospital-info">
        <h2>{hospital.name}</h2>
        <div>
          <span>
            <MapPin /> {hospital.city} - MA
          </span>
          <span>
            <Building2 /> Regional:{" "}
            {regionals.find((r) => r.id === hospital.regionalId)?.name}
          </span>
        </div>
      </div>
      <div className="hospital-state">
        <Badge
          status={
            hospital.status === "Ativo" ? "Unidade Ativa" : hospital.status
          }
        />
        <small>
          {last
            ? `Atualização local: ${new Date(last.date).toLocaleString("pt-BR")}`
            : hospital.id === "HM001"
              ? "Última atualização: 15/04/2025 às 10:30"
              : "Base demonstrativa · referência visual"}
        </small>
      </div>
    </div>
  );
}

export function HospitalReferencePhoto() {
  return (
    <div className="reference-photo" aria-label="Hospital Maranhense">
      <img src={hospitalReference} alt="Hospital Maranhense" />
    </div>
  );
}
export function Empty({
  text = "Nenhum registro encontrado.",
  action,
}: {
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <Search />
      <h3>{text}</h3>
      <p>Experimente outros filtros ou cadastre um registro.</p>
      {action}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const focus = document.activeElement as HTMLElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      focus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Fechar janela"
          onClick={onClose}
        >
          <X />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sort?: (row: T) => string | number;
}
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  initialPageSize = 10,
  label = "Registros",
}: {
  rows: T[];
  columns: Column<T>[];
  initialPageSize?: number;
  label?: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: number }>({
    key: "",
    dir: 1,
  });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(initialPageSize);
  useEffect(() => setPage(1), [rows.length, sort, size]);
  const col = columns.find((c) => c.key === sort.key);
  const sorted = col?.sort
    ? [...rows].sort((a, b) => {
        const x = col.sort!(a),
          y = col.sort!(b);
        return (
          (typeof x === "number" && typeof y === "number"
            ? x - y
            : String(x).localeCompare(String(y), "pt-BR")) * sort.dir
        );
      })
    : rows;
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const safePage = Math.min(page, pages);
  const visible = sorted.slice((safePage - 1) * size, safePage * size);
  return (
    <>
      {!rows.length ? (
        <Empty />
      ) : (
        <>
          <div className="table-scroll">
            <table aria-label={label}>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      aria-sort={
                        sort.key === c.key
                          ? sort.dir === 1
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                    >
                      {c.sort ? (
                        <button
                          onClick={() =>
                            setSort({
                              key: c.key,
                              dir: sort.key === c.key ? -sort.dir : 1,
                            })
                          }
                        >
                          {c.label}
                          <ArrowDownUp size={12} />
                        </button>
                      ) : (
                        c.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    {columns.map((c) => (
                      <td key={c.key}>{c.render(r)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>
              Mostrando {(safePage - 1) * size + 1} a{" "}
              {Math.min(safePage * size, rows.length)} de {rows.length}{" "}
              registros
            </span>
            <div>
              <label>
                Itens por página{" "}
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                >
                  {[8, 10, 20, 50].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <button
                className="icon-button"
                aria-label="Página anterior"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="page-number">{safePage}</span>
              <button
                className="icon-button"
                aria-label="Próxima página"
                disabled={safePage === pages}
                onClick={() => setPage(safePage + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
export function Toast() {
  const { message, notify } = useApp();
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => notify(""), 5000);
      return () => clearTimeout(t);
    }
  }, [message, notify]);
  return message ? (
    <div className="toast" role="status">
      <CheckCircle2 />
      <span>{message}</span>
      <button
        className="icon-button"
        aria-label="Fechar aviso"
        onClick={() => notify("")}
      >
        <X size={16} />
      </button>
    </div>
  ) : null;
}

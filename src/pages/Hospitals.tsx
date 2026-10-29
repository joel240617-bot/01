import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Eye } from "lucide-react";
import { useApp } from "../state/AppContext";
import { regionals } from "../data/demo";
import {
  Panel,
  Field,
  SearchField,
  Badge,
  DataTable,
  Modal,
} from "../components/UI";
import type { Column } from "../components/UI";
import type { Hospital } from "../types";
import {
  quantity,
  byCategory,
  cost,
  money,
  normalize,
} from "../utils/calculations";
export function HospitalTable({ rows }: { rows: Hospital[] }) {
  const { state, period, selectHospital } = useApp();
  const navigate = useNavigate();
  const records = (h: Hospital) =>
    (state.monthly[period] ?? []).filter((r) => r.hospitalId === h.id);
  const columns: Column<Hospital>[] = [
    { key: "id", label: "Código", render: (h) => h.id, sort: (h) => h.id },
    {
      key: "name",
      label: "Hospital",
      render: (h) => (
        <button
          className="hospital-link"
          onClick={() => {
            selectHospital(h.id);
            navigate("/raio-x");
          }}
        >
          <span className="hospital-thumb">
            <Building2 />
          </span>
          <b>{h.name}</b>
        </button>
      ),
      sort: (h) => h.name,
    },
    {
      key: "city",
      label: "Cidade",
      render: (h) => h.city,
      sort: (h) => h.city,
    },
    {
      key: "regional",
      label: "Regional",
      render: (h) => regionals.find((r) => r.id === h.regionalId)?.name,
    },
    {
      key: "units",
      label: "Unidades",
      render: (h) => state.units.filter((u) => u.hospitalId === h.id).length,
    },
    ...(["acesso", "vigilancia", "cameras", "alarmes"] as const).map((cat) => ({
      key: cat,
      label: {
        acesso: "Controle de Acesso",
        vigilancia: "Vigilância",
        cameras: "Câmeras",
        alarmes: "Alarmes",
      }[cat],
      render: (h: Hospital) => quantity(byCategory(records(h), cat)),
      sort: (h: Hospital) => quantity(byCategory(records(h), cat)),
    })),
    {
      key: "cost",
      label: "Custo Mensal",
      render: (h) => <b>{money(cost(records(h)))}</b>,
      sort: (h) => cost(records(h)),
    },
    {
      key: "status",
      label: "Status",
      render: (h) => <Badge status={h.status} />,
    },
    {
      key: "actions",
      label: "Ações",
      render: (h) => (
        <button
          className="icon-button bordered"
          aria-label={`Abrir ${h.name}`}
          onClick={() => {
            selectHospital(h.id);
            navigate("/raio-x");
          }}
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];
  return <DataTable rows={rows} columns={columns} label="Lista de hospitais" />;
}
export function Hospitals() {
  const { state, dispatch, notify } = useApp();
  const [search, setSearch] = useState(""),
    [regional, setRegional] = useState(""),
    [city, setCity] = useState(""),
    [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", city: "", regionalId: "ma" });
  const filtered = state.hospitals.filter(
    (h) =>
      normalize(h.name + " " + h.city + " " + h.id).includes(
        normalize(search),
      ) &&
      (!regional || h.regionalId === regional) &&
      (!city || h.city === city) &&
      (!status || h.status === status),
  );
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Hospitais</h1>
          <p>
            Consulte os hospitais e suas unidades com a estrutura consolidada do
            Raio-X.
          </p>
        </div>
        <button className="primary" onClick={() => setOpen(true)}>
          <Plus size={20} /> Novo hospital
        </button>
      </div>
      <div className="filter-panel hospital-filters">
        <Field label="Buscar hospital">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Digite o nome do hospital, cidade ou código..."
          />
        </Field>
        <Field label="Regional">
          <select
            value={regional}
            onChange={(e) => setRegional(e.target.value)}
          >
            <option value="">Todas as regionais</option>
            {regionals.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cidade">
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Todas as cidades</option>
            {[...new Set(state.hospitals.map((h) => h.city))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option>Ativo</option>
            <option>Em implantação</option>
            <option>Inativo</option>
          </select>
        </Field>
      </div>
      <Panel
        title="Lista de Hospitais"
        icon={Building2}
        actions={<small>{filtered.length} hospitais encontrados</small>}
      >
        <HospitalTable rows={filtered} />
      </Panel>
      {open && (
        <Modal
          title="Novo hospital demonstrativo"
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name.trim() || !form.city.trim()) {
                setError("Preencha o nome e a cidade.");
                return;
              }
              if (
                state.hospitals.some(
                  (h) => normalize(h.name) === normalize(form.name.trim()),
                )
              ) {
                setError("Já existe um hospital com esse nome.");
                return;
              }
              dispatch({
                type: "HOSPITAL",
                hospital: {
                  ...form,
                  name: form.name.trim(),
                  city: form.city.trim(),
                  id: `HM${String(state.hospitals.length + 1).padStart(3, "0")}`,
                  status: "Em implantação",
                },
              });
              notify("Hospital demonstrativo cadastrado nesta sessão.");
              setOpen(false);
              setForm({ name: "", city: "", regionalId: "ma" });
              setError("");
            }}
            noValidate
          >
            <div className="modal-body">
              <p className="form-context">
                Cadastro local. A unidade começa sem postos, equipamentos ou
                custos.
              </p>
              <Field label="Nome do hospital *">
                <input
                  autoFocus
                  value={form.name}
                  maxLength={100}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Cidade *">
                <input
                  value={form.city}
                  maxLength={80}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Field>
              <Field label="Regional">
                <select
                  value={form.regionalId}
                  onChange={(e) =>
                    setForm({ ...form, regionalId: e.target.value })
                  }
                >
                  {regionals.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </Field>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <footer className="modal-footer">
              <button
                type="button"
                className="secondary"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="primary">
                Cadastrar hospital
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </>
  );
}

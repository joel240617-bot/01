import { useState } from "react";
import { RefreshCw, Plus, ClipboardList } from "lucide-react";
import { useHospital } from "../state/AppContext";
import {
  Panel,
  HospitalSelect,
  PeriodSelect,
  Field,
  DataTable,
  SearchField,
  Badge,
} from "../components/UI";
import { RecordEditor, RecordActions } from "../components/RecordEditor";
import { categories } from "../types";
import { money, monthlyCost, normalize } from "../utils/calculations";
export function Update() {
  const { records, hospitalId, period } = useHospital();
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const filtered = records.filter(
    (r) =>
      (!category || r.category === category) &&
      normalize(r.description + " " + r.location).includes(normalize(search)),
  );
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Atualização do Raio-X</h1>
          <p>
            Atualize a estrutura, os quantitativos e os valores do hospital
            nesta sessão.
          </p>
        </div>
        <button className="primary" onClick={() => setAdding(true)}>
          <Plus size={18} /> Novo registro
        </button>
      </div>
      <div className="filter-panel four-filters">
        <Field label="Hospital">
          <HospitalSelect />
        </Field>
        <Field label="Competência">
          <PeriodSelect />
        </Field>
        <Field label="Categoria">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {Object.entries(categories).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pesquisar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Buscar registro..."
          />
        </Field>
      </div>
      <div className="info-banner">
        <RefreshCw />
        <span>
          As alterações atualizam automaticamente o Raio-X, os custos e o
          consolidado regional.
          <small>
            Dados demonstrativos. Ao recarregar a página, as alterações desta
            sessão serão descartadas.
          </small>
        </span>
      </div>
      {adding && (
        <RecordEditor
          key={hospitalId + period}
          inline
          onClose={() => setAdding(false)}
        />
      )}
      <Panel title="Registros do hospital" icon={ClipboardList}>
        <DataTable
          rows={filtered}
          label="Registros para atualização"
          columns={[
            {
              key: "name",
              label: "Identificação",
              render: (r) => r.description,
              sort: (r) => r.description,
            },
            {
              key: "category",
              label: "Categoria",
              render: (r) => categories[r.category],
              sort: (r) => r.category,
            },
            { key: "location", label: "Local", render: (r) => r.location },
            {
              key: "quantity",
              label: "Quantidade",
              render: (r) => r.quantity,
              sort: (r) => r.quantity,
            },
            {
              key: "price",
              label: "Valor unitário / mensalidade",
              render: (r) => money(r.unitValue),
              sort: (r) => r.unitValue,
            },
            {
              key: "cost",
              label: "Custo mensal",
              render: (r) => <b>{money(monthlyCost(r))}</b>,
              sort: (r) => monthlyCost(r),
            },
            {
              key: "status",
              label: "Situação",
              render: (r) => <Badge status={r.status} />,
            },
            {
              key: "actions",
              label: "Ações",
              render: (r) => <RecordActions record={r} />,
            },
          ]}
        />
      </Panel>
    </>
  );
}

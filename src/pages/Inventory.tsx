import { useState } from "react";
import {
  Sun,
  Moon,
  Users,
  Database,
  Plus,
  ShieldCheck,
  UserRoundCheck,
  Cctv,
  Bell,
  CheckCircle2,
  Wrench,
  Clock3,
  Building2,
  ChartNoAxesCombined,
  PieChart,
  SlidersHorizontal,
} from "lucide-react";
import type { Category, SecurityRecord } from "../types";
import { categories } from "../types";
import { useHospital } from "../state/AppContext";
import {
  Panel,
  Stat,
  Field,
  SearchField,
  HospitalBanner,
  HospitalReferencePhoto,
  PeriodSelect,
  Badge,
  DataTable,
} from "../components/UI";
import type { Column } from "../components/UI";
import { RecordEditor, RecordActions } from "../components/RecordEditor";
import { Donut, ShiftBars } from "../components/Charts";
import {
  cost,
  money,
  quantity,
  byCategory,
  split,
  normalize,
  monthlyCost,
  percent,
} from "../utils/calculations";
const icons = {
  acesso: ShieldCheck,
  vigilancia: UserRoundCheck,
  cameras: Cctv,
  alarmes: Bell,
};
export function Inventory({ category }: { category: Category }) {
  const { records, hospital, units } = useHospital();
  const [search, setSearch] = useState(""),
    [unit, setUnit] = useState(""),
    [shift, setShift] = useState(""),
    [status, setStatus] = useState(""),
    [type, setType] = useState("");
  const [newRecord, setNew] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const list = byCategory(records, category);
  const filtered = list.filter(
    (r) =>
      normalize(r.description + " " + r.location + " " + r.id).includes(
        normalize(search),
      ) &&
      (!unit || r.unitId === unit) &&
      (!shift || r.shift === shift) &&
      (!status || r.status === status) &&
      (!type || r.type === type),
  );
  const isPost = category === "acesso" || category === "vigilancia";
  const totals = split(list, category);
  const operating = quantity(list.filter((r) => r.status === "Ativo")),
    maintenance = quantity(list.filter((r) => r.status === "Em manutenção"));
  const total = quantity(list);
  const totalCost = cost(list);
  const active = list.filter((r) => r.status !== "Inativo");
  const retentionGroups = [...new Set(active.map((r) => r.retention))]
    .sort((a, b) => a - b)
    .map((d) => ({
      key: String(d),
      label: `${d} dias`,
      value: quantity(active.filter((r) => r.retention === d)),
    }));
  const standard = [...retentionGroups].sort((a, b) => b.value - a.value)[0];
  const columns: Column<SecurityRecord>[] = [
    {
      key: "id",
      label: "ID",
      render: (r) => (
        <span title={r.id}>{r.id.length > 18 ? r.id.slice(0, 8) : r.id}</span>
      ),
      sort: (r) => r.id,
    },
    {
      key: "description",
      label: isPost ? "Posto" : category === "cameras" ? "Local" : "Sistema",
      render: (r) => <b className="normal-weight">{r.description}</b>,
      sort: (r) => r.description,
    },
    ...(category !== "alarmes"
      ? [
          {
            key: "unit",
            label: isPost ? "Local" : "Setor",
            render: (r: SecurityRecord) =>
              units.find((u) => u.id === r.unitId)?.name ?? r.location,
          },
        ]
      : []),
    ...(!isPost
      ? [
          {
            key: "type",
            label: "Tipo",
            render: (r: SecurityRecord) => (
              <span className={category === "alarmes" ? "type-badge" : ""}>
                {r.type}
              </span>
            ),
            sort: (r: SecurityRecord) => r.type,
          },
        ]
      : []),
    ...(isPost
      ? [
          {
            key: "shift",
            label: "Turno",
            render: (r: SecurityRecord) => (
              <span className="shift-label">
                {r.shift === "Diurno" ? (
                  <Sun className="sun" size={17} />
                ) : (
                  <Moon size={17} />
                )}{" "}
                {r.shift}
              </span>
            ),
            sort: (r: SecurityRecord) => r.shift,
          },
          {
            key: "hours",
            label: "Cobrança",
            render: (r: SecurityRecord) =>
              r.billing === "hora"
                ? `${r.hours}h / mês`
                : r.billing === "mensalidade"
                  ? "Mensalidade"
                  : "Por posto / mês",
          },
        ]
      : []),
    ...(category === "alarmes"
      ? [
          {
            key: "location",
            label: "Localização",
            render: (r: SecurityRecord) => r.location,
          },
        ]
      : []),
    {
      key: "quantity",
      label: "Quantidade",
      render: (r) =>
        `${r.quantity}${category === "alarmes" ? " sistema(s)" : ""}`,
      sort: (r) => r.quantity,
    },
    ...(category === "cameras"
      ? [
          {
            key: "retention",
            label: "Tempo de Gravação",
            render: (r: SecurityRecord) => `${r.retention} dias`,
            sort: (r: SecurityRecord) => r.retention,
          },
        ]
      : []),
    {
      key: "price",
      label: "Valor Unitário (R$)",
      render: (r) => (
        <span>
          {money(r.unitValue)}
          {r.billing === "mensalidade" && (
            <small className="cell-sub">mensalidade fixa</small>
          )}
        </span>
      ),
      sort: (r) => r.unitValue,
    },
    {
      key: "cost",
      label: "Custo Mensal (R$)",
      render: (r) => <b>{money(monthlyCost(r))}</b>,
      sort: (r) => monthlyCost(r),
    },
    {
      key: "status",
      label: "Situação",
      render: (r) => (
        <Badge
          status={!isPost && r.status === "Ativo" ? "Operacional" : r.status}
        />
      ),
      sort: (r) => r.status,
    },
    {
      key: "actions",
      label: "Ações",
      render: (r) => <RecordActions record={r} />,
    },
  ];
  const filters = (
    <div className="filter-panel">
      <Field label={isPost ? "Setor / Local" : "Localização"}>
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="">Todos os locais</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={isPost ? "Turno" : "Tipo"}>
        {isPost ? (
          <select value={shift} onChange={(e) => setShift(e.target.value)}>
            <option value="">Todos os turnos</option>
            <option>Diurno</option>
            <option>Noturno</option>
          </select>
        ) : (
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Todos os tipos</option>
            {[...new Set(list.map((r) => r.type))].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Situação">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todas as situações</option>
          <option>Ativo</option>
          <option>Em manutenção</option>
          <option>Inativo</option>
        </select>
      </Field>
      <Field label="Competência">
        <PeriodSelect />
      </Field>
      <Field label="Buscar registro">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Buscar por local, setor ou ID..."
        />
      </Field>
    </div>
  );
  const stats = (
    <div className="stats five-stats">
      {isPost ? (
        <>
          <Stat
            label="Postos Diurnos"
            icon={Sun}
            value={totals.day}
            sub="postos ativos"
          />
          <Stat
            label="Postos Noturnos"
            icon={Moon}
            value={totals.night}
            sub="postos ativos"
            tone="purple"
          />
          <Stat
            label="Total de Postos"
            icon={Users}
            value={totals.total}
            sub={
              category === "vigilancia"
                ? "postos de vigilância"
                : "postos de acesso"
            }
          />
          <Stat
            label="Custo Médio por Posto"
            icon={Database}
            value={money(totals.total ? totals.cost / totals.total : 0)}
            sub="por posto (mês)"
          />
        </>
      ) : (
        <>
          <Stat
            label={
              category === "cameras"
                ? "Total de Câmeras"
                : "Sistemas Instalados"
            }
            icon={icons[category]}
            value={total}
            sub={category === "cameras" ? "unidades" : "sistemas"}
          />
          <Stat
            label="Operacionais"
            icon={CheckCircle2}
            tone="green"
            value={operating}
            sub={`(${percent(operating, total)})`}
          />
          <Stat
            label="Em manutenção"
            icon={Wrench}
            tone="amber"
            value={maintenance}
            sub={`(${percent(maintenance, total)})`}
          />
          <Stat
            label={
              category === "cameras" ? "Tempo de Gravação" : "Áreas Cobertas"
            }
            icon={category === "cameras" ? Database : Building2}
            value={
              category === "cameras"
                ? standard
                  ? `${standard.key} dias`
                  : "—"
                : category === "alarmes" && hospital?.id === "HM001"
                  ? 12
                  : new Set(active.map((r) => r.unitId)).size
            }
            sub={
              category === "cameras"
                ? "retenção predominante"
                : "áreas / setores"
            }
          />
        </>
      )}
      <Stat
        label={isPost ? "Custo Mensal Total" : "Custo Mensal"}
        icon={Database}
        value={money(totalCost)}
        sub="total da unidade"
      />
    </div>
  );
  const table = (
    <Panel
      title={
        isPost
          ? `Postos de ${categories[category]}`
          : category === "cameras"
            ? "Lista de Câmeras"
            : "Lista de Sistemas de Alarme"
      }
      icon={icons[category]}
      actions={
        <div className="inventory-actions">
          {category === "cameras" && (
            <>
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Buscar por local, setor ou ID..."
              />
              <button
                className="secondary small-button"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
              >
                <SlidersHorizontal size={15} /> Filtros
              </button>
            </>
          )}
          <button className="primary small-button" onClick={() => setNew(true)}>
            <Plus size={16} />{" "}
            {isPost
              ? "Novo posto"
              : category === "cameras"
                ? "Nova câmera"
                : "Novo sistema"}
          </button>
        </div>
      }
    >
      <DataTable
        initialPageSize={isPost ? 8 : 10}
        columns={columns}
        rows={filtered}
        label={categories[category]}
      />
    </Panel>
  );
  const shiftItems = ["Diurno", "Noturno"].map((s) => ({
    label: s,
    quantity: quantity(list.filter((r) => r.shift === s)),
    value: cost(list.filter((r) => r.shift === s)),
  }));
  return (
    <>
      <div className="page-title">
        <div>
          {isPost && (
            <div className="breadcrumbs">
              {hospital?.name} <span>›</span> Raio-X <span>›</span>{" "}
              {categories[category]}
            </div>
          )}
          <h1>{categories[category]}</h1>
          <p>
            {category === "cameras"
              ? `Visão da estrutura de câmeras instaladas e da capacidade de gravação de ${hospital?.name}.`
              : category === "alarmes"
                ? `Raio-X dos sistemas de alarme instalados no ${hospital?.name} e sua estrutura de custos mensais.`
                : category === "acesso"
                  ? `Visão detalhada dos postos de controle de acesso e seus custos no ${hospital?.name}.`
                  : `Raio-X dos postos de vigilância patrimonial e seus custos mensais.`}
          </p>
        </div>
        {category !== "cameras" && <HospitalReferencePhoto />}
      </div>
      {category === "cameras" && <HospitalBanner />}
      {category === "acesso" ? (
        <>
          {filters}
          {stats}
        </>
      ) : (
        <>
          {stats}
          {(category !== "cameras" || showFilters) && filters}
        </>
      )}
      {category === "cameras" ? (
        <div className="camera-grid">
          {table}
          <Panel title="Retenção de Gravações" icon={Database}>
            <Donut
              items={retentionGroups}
              currency={false}
              totalLabel="câmeras no total"
            />
            <div className="retention-note">
              <Clock3 />
              <span>
                Tempo de gravação predominante
                <strong>
                  {standard ? `${standard.key} dias` : "Sem câmeras"}
                </strong>
                {standard &&
                  `para ${percent(standard.value, total)} das câmeras`}
              </span>
            </div>
          </Panel>
        </div>
      ) : (
        table
      )}
      {isPost ? (
        <div className={category === "vigilancia" ? "two-columns" : "stack"}>
          <Panel
            title={`Resumo Financeiro ${category === "acesso" ? "do Controle de Acesso" : "da Vigilância"}`}
            icon={Database}
          >
            {category === "acesso" ? (
              <div className="finance-summary">
                {shiftItems.map((s) => (
                  <div key={s.label}>
                    {s.label === "Diurno" ? <Sun className="sun" /> : <Moon />}
                    <span>
                      Subtotal {s.label}
                      <strong>{money(s.value)}</strong>
                      <small>{s.quantity} postos</small>
                    </span>
                  </div>
                ))}
                <div>
                  <Database />
                  <span>
                    Custo Mensal Total<strong>{money(totalCost)}</strong>
                    <small>{total} postos</small>
                  </span>
                </div>
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Turno</th>
                      <th>Postos</th>
                      <th>Custo médio por posto</th>
                      <th>Custo Mensal</th>
                      <th>Participação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftItems.map((s) => (
                      <tr key={s.label}>
                        <td>{s.label}</td>
                        <td>{s.quantity}</td>
                        <td>{money(s.quantity ? s.value / s.quantity : 0)}</td>
                        <td>{money(s.value)}</td>
                        <td>{percent(s.value, totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td>{total}</td>
                      <td>{money(total ? totalCost / total : 0)}</td>
                      <td>{money(totalCost)}</td>
                      <td>{totalCost ? "100%" : "0%"}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Panel>
          {category === "vigilancia" && (
            <Panel
              title="Quantidade de Postos e Custo por Turno"
              icon={ChartNoAxesCombined}
            >
              <ShiftBars items={shiftItems} />
            </Panel>
          )}
        </div>
      ) : category === "cameras" ? (
        <div className="overview-bottom">
          <Panel title="Total de Câmeras por Setor" icon={ChartNoAxesCombined}>
            <div className="sector-cards">
              {units
                .filter((u) => list.some((r) => r.unitId === u.id))
                .map((u) => (
                  <div key={u.id}>
                    <Building2 />
                    <span>{u.name}</span>
                    <b>{quantity(list.filter((r) => r.unitId === u.id))}</b>
                    <small>
                      {percent(
                        quantity(list.filter((r) => r.unitId === u.id)),
                        total,
                      )}
                    </small>
                  </div>
                ))}
            </div>
          </Panel>
          <Panel title="Custo Mensal por Setor" icon={Database}>
            <table>
              <tbody>
                {units
                  .filter((u) => list.some((r) => r.unitId === u.id))
                  .map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>
                        {money(cost(list.filter((r) => r.unitId === u.id)))}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total da Unidade</td>
                  <td>{money(totalCost)}</td>
                </tr>
              </tfoot>
            </table>
          </Panel>
        </div>
      ) : (
        <div className="two-columns alarm-bottom">
          <Panel title="Resumo dos Sistemas de Alarme" icon={PieChart}>
            <div className="summary-strip alarm-summary">
              <div>
                <b>{total}</b>
                <span>sistemas no total</span>
              </div>
              <div>
                <b className="green-text">{operating}</b>
                <span>operacionais</span>
              </div>
              <div>
                <b className="amber-text">{maintenance}</b>
                <span>em manutenção</span>
              </div>
              <div>
                <b>{active.reduce((s, r) => s + r.devices, 0)}</b>
                <span>dispositivos / sensores</span>
              </div>
            </div>
          </Panel>
          <Panel
            title="Distribuição do Custo Mensal por Tipo de Sistema"
            icon={ChartNoAxesCombined}
          >
            <Donut
              items={[...new Set(list.map((r) => r.type))].map((t) => ({
                key: t,
                label: t,
                value: cost(list.filter((r) => r.type === t)),
              }))}
            />
          </Panel>
        </div>
      )}
      <p className="page-footnote">
        Indicadores referem-se ao hospital e à competência selecionados. Os
        filtros restringem a lista de registros.
      </p>
      {newRecord && (
        <RecordEditor category={category} onClose={() => setNew(false)} />
      )}
    </>
  );
}

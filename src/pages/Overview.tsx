import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  UserRoundCheck,
  Cctv,
  Bell,
  Database,
  PieChart,
  ChartNoAxesCombined,
} from "lucide-react";
import { useApp } from "../state/AppContext";
import { regionals } from "../data/demo";
import {
  Field,
  PeriodSelect,
  Panel,
  Stat,
  SearchField,
  Badge,
} from "../components/UI";
import { Donut } from "../components/Charts";
import {
  quantity,
  byCategory,
  cost,
  money,
  categoryTotals,
  percent,
  normalize,
} from "../utils/calculations";
import { categoryRoutes } from "./RaioX";
export function Overview() {
  const { state, regionalId, selectRegional, period, selectHospital } =
    useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const hospitals = state.hospitals.filter((h) => h.regionalId === regionalId);
  const ids = new Set(hospitals.map((h) => h.id));
  const records = (state.monthly[period] ?? []).filter((r) =>
    ids.has(r.hospitalId),
  );
  const total = cost(records);
  const ranking = hospitals
    .map((h) => ({
      ...h,
      cost: cost(records.filter((r) => r.hospitalId === h.id)),
    }))
    .sort((a, b) => b.cost - a.cost);
  const regional = regionals.find((r) => r.id === regionalId)?.name;
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Visão Geral da Regional</h1>
          <p>
            Panorama consolidado dos hospitais da regional {regional} – Raio-X
            hospitalar
          </p>
        </div>
        <div className="title-filters">
          <Field label="Regional">
            <select
              value={regionalId}
              onChange={(e) => selectRegional(e.target.value)}
            >
              {regionals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Competência">
            <PeriodSelect />
          </Field>
        </div>
      </div>
      <div className="stats regional-stats">
        <Stat
          icon={Building2}
          label="Hospitais"
          value={hospitals.length}
          sub="hospitais"
          onClick={() => navigate("/hospitais")}
        />
        <Stat
          icon={Building2}
          label="Unidades"
          value={state.units.filter((u) => ids.has(u.hospitalId)).length}
          sub="setores cadastrados"
          onClick={() => navigate("/hospitais")}
        />
        {(
          [
            {
              key: "acesso",
              icon: ShieldCheck,
              label: "Postos de Controle de Acesso",
            },
            {
              key: "vigilancia",
              icon: UserRoundCheck,
              label: "Postos de Vigilância",
            },
            { key: "cameras", icon: Cctv, label: "Câmeras" },
            { key: "alarmes", icon: Bell, label: "Sistemas de Alarme" },
          ] as const
        ).map((c) => (
          <Stat
            key={c.key}
            icon={c.icon}
            label={c.label}
            value={quantity(byCategory(records, c.key))}
            sub={
              c.key === "alarmes"
                ? "sistemas"
                : c.key === "cameras"
                  ? "unidades"
                  : "postos"
            }
            onClick={() => navigate("/hospitais")}
          />
        ))}
        <Stat
          icon={Database}
          label="Custo Mensal Consolidado"
          value={money(total)}
          onClick={() => navigate("/hospitais")}
        />
      </div>
      <div className="two-columns overview-main">
        <Panel title="Distribuição do custo mensal por serviço" icon={PieChart}>
          <p className="muted small">
            Participação de cada serviço no custo total da regional {regional}
          </p>
          <Donut items={categoryTotals(records)} />
        </Panel>
        <Panel
          title="Resumo consolidado da regional"
          icon={ChartNoAxesCombined}
        >
          <p className="muted small">
            Totais e indicadores do Raio-X hospitalar – {regional}
          </p>
          <div className="regional-summary">
            {(
              [
                {
                  key: "acesso",
                  icon: ShieldCheck,
                  label: "Postos de Controle de Acesso",
                },
                {
                  key: "vigilancia",
                  icon: UserRoundCheck,
                  label: "Postos de Vigilância",
                },
                { key: "cameras", icon: Cctv, label: "Câmeras em operação" },
                { key: "alarmes", icon: Bell, label: "Sistemas de Alarme" },
              ] as const
            ).map((c) => (
              <Stat
                key={c.key}
                label={c.label}
                icon={c.icon}
                value={quantity(
                  byCategory(records, c.key).filter(
                    (r) => c.key !== "cameras" || r.status === "Ativo",
                  ),
                )}
                sub="total da regional"
              />
            ))}
          </div>
        </Panel>
      </div>
      <div className="overview-bottom">
        <Panel
          title={`Hospitais da regional ${regional}`}
          icon={Building2}
          actions={
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Buscar hospital..."
            />
          }
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Cidade</th>
                  <th>Postos de Acesso</th>
                  <th>Vigilância</th>
                  <th>Câmeras</th>
                  <th>Alarmes</th>
                  <th>Custo Mensal (R$)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {hospitals
                  .filter((h) =>
                    normalize(h.name + " " + h.city).includes(
                      normalize(search),
                    ),
                  )
                  .map((h) => {
                    const rs = records.filter((r) => r.hospitalId === h.id);
                    return (
                      <tr key={h.id}>
                        <td>
                          <button
                            className="text-link"
                            onClick={() => {
                              selectHospital(h.id);
                              navigate("/raio-x");
                            }}
                          >
                            <b>{h.name}</b>
                          </button>
                        </td>
                        <td>{h.city}</td>
                        {(
                          Object.keys(
                            categoryRoutes,
                          ) as (keyof typeof categoryRoutes)[]
                        ).map((c) => (
                          <td key={c}>{quantity(byCategory(rs, c))}</td>
                        ))}
                        <td>{money(cost(rs))}</td>
                        <td>
                          <Badge status={h.status} />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {!hospitals.some((h) =>
              normalize(h.name + " " + h.city).includes(normalize(search)),
            ) && <p className="empty">Nenhum hospital encontrado.</p>}
          </div>
        </Panel>
        <Panel title="Maiores custos da regional" icon={Database}>
          <p className="muted small">
            Hospitais com maior custo mensal – {regional}
          </p>
          <div className="ranking">
            {ranking.map((h, i) => (
              <button
                key={h.id}
                onClick={() => {
                  selectHospital(h.id);
                  navigate("/raio-x");
                }}
              >
                <span className="rank-number">{i + 1}</span>
                <span>
                  <b>{h.name}</b>
                  <small>{h.city}</small>
                  <i
                    style={{
                      width: `${Math.max(3, (h.cost / (ranking[0]?.cost || 1)) * 100)}%`,
                    }}
                  />
                </span>
                <span>
                  <b>{money(h.cost)}</b>
                  <small>{percent(h.cost, total)}</small>
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

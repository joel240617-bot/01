import { useState } from "react";
import {
  Database,
  ShieldCheck,
  UserRoundCheck,
  Cctv,
  Bell,
  ChartNoAxesCombined,
  PieChart,
  ClipboardList,
} from "lucide-react";
import { useHospital } from "../state/AppContext";
import { periods } from "../data/demo";
import { categories } from "../types";
import type { Category } from "../types";
import {
  Panel,
  Stat,
  Field,
  HospitalSelect,
  PeriodSelect,
} from "../components/UI";
import { Donut, CostBars } from "../components/Charts";
import {
  cost,
  money,
  byCategory,
  quantity,
  categoryTotals,
  percent,
  periodName,
} from "../utils/calculations";
export function Costs() {
  const { records, state, hospitalId, period, hospital } = useHospital();
  const [category, setCategory] = useState("");
  const [comparison, setComparison] = useState("2025-03");
  const selected = category
    ? byCategory(records, category as Category)
    : records;
  const previous = (state.monthly[comparison] ?? []).filter(
    (r) => r.hospitalId === hospitalId,
  );
  const total = cost(selected);
  const previousTotal = cost(
    category ? byCategory(previous, category as Category) : previous,
  );
  const values = categoryTotals(records);
  const icons = {
    acesso: ShieldCheck,
    vigilancia: UserRoundCheck,
    cameras: Cctv,
    alarmes: Bell,
  };
  const change = (now: number, before: number) =>
    before ? (
      <span className={`change ${now <= before ? "down" : "up"}`}>
        {now <= before ? "↓" : "↑"}{" "}
        {(((now - before) / before) * 100).toLocaleString("pt-BR", {
          maximumFractionDigits: 1,
        })}
        %
      </span>
    ) : (
      <span className="muted small">Sem base de comparação</span>
    );
  return (
    <>
      <div className="page-title costs-title">
        <div>
          <h1>Custos</h1>
          <p>
            Custos mensais consolidados da estrutura de segurança de{" "}
            {hospital?.name} (Raio-X).
          </p>
        </div>
      </div>
      <div className="filter-panel four-filters">
        <Field label="Competência">
          <PeriodSelect />
        </Field>
        <Field label="Comparar com">
          <select
            value={comparison}
            onChange={(e) => setComparison(e.target.value)}
          >
            {periods.map((p) => (
              <option key={p} value={p}>
                {periodName(p)}
              </option>
            ))}
          </select>
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
        <Field label="Hospital">
          <HospitalSelect />
        </Field>
      </div>
      <div className="stats five-stats cost-stats">
        <Stat
          label={category ? "Total da Categoria" : "Custo Mensal Total"}
          icon={Database}
          value={money(total)}
        >
          {change(total, previousTotal)}
          <small>
            vs. {periodName(comparison)}
            <br />({money(previousTotal)})
          </small>
        </Stat>
        {values.map((v) => (
          <Stat
            key={v.key}
            label={v.label}
            icon={icons[v.key]}
            value={money(v.value)}
          >
            {change(v.value, cost(byCategory(previous, v.key)))}
            <small>
              vs. {periodName(comparison)}
              <br />({money(cost(byCategory(previous, v.key)))})
            </small>
          </Stat>
        ))}
      </div>
      <div className="cost-chart-grid">
        <Panel title="Evolução do custo mensal" icon={ChartNoAxesCombined}>
          <p className="muted small">
            {category
              ? categories[category as Category]
              : "Total dos custos de segurança"}{" "}
            · {hospital?.name}
          </p>
          <CostBars
            items={periods
              .filter((p) => p <= period)
              .map((p) => ({
                period: p,
                value: cost(
                  (state.monthly[p] ?? []).filter(
                    (r) =>
                      r.hospitalId === hospitalId &&
                      (!category || r.category === category),
                  ),
                ),
              }))}
          />
        </Panel>
        <Panel title="Distribuição de custos por categoria" icon={PieChart}>
          <p className="muted small">
            Participação de cada categoria no custo mensal
          </p>
          <Donut
            items={values.filter((v) => !category || v.key === category)}
            onSelect={setCategory}
          />
        </Panel>
      </div>
      <Panel
        className="cost-detail"
        title="Detalhamento dos custos por categoria"
        icon={ClipboardList}
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Memória de cálculo</th>
                <th>Custo Mensal (R$)</th>
                <th>Participação</th>
              </tr>
            </thead>
            <tbody>
              {values
                .filter((v) => !category || v.key === category)
                .map((v) => (
                  <tr key={v.key}>
                    <td>{v.label}</td>
                    <td>
                      {quantity(byCategory(records, v.key))}{" "}
                      {v.key === "alarmes"
                        ? "sistemas"
                        : v.key === "cameras"
                          ? "unidades"
                          : "postos"}
                    </td>
                    <td>Soma dos registros ativos por modelo de cobrança</td>
                    <td>
                      <b>{money(v.value)}</b>
                    </td>
                    <td>{percent(v.value, total)}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Total mensal</td>
                <td>{money(total)}</td>
                <td>{total ? "100%" : "0%"}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>
    </>
  );
}

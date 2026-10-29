import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  UserRoundCheck,
  Cctv,
  Bell,
  Database,
  ClipboardList,
  Tag,
  Clock3,
} from "lucide-react";
import { useHospital } from "../state/AppContext";
import {
  Panel,
  Stat,
  HospitalBanner,
  HospitalSelect,
  Empty,
} from "../components/UI";
import { Donut } from "../components/Charts";
import {
  split,
  quantity,
  byCategory,
  cost,
  money,
  categoryTotals,
  periodName,
} from "../utils/calculations";

export const categoryRoutes = {
  acesso: "/controle-acesso",
  vigilancia: "/vigilancia",
  cameras: "/cameras",
  alarmes: "/alarmes",
};
export function RaioX() {
  const { records, hospital, state, hospitalId, period } = useHospital();
  const navigate = useNavigate();
  if (!hospital) return <Empty text="Selecione um hospital." />;
  const acesso = split(records, "acesso"),
    vig = split(records, "vigilancia"),
    totals = categoryTotals(records),
    total = cost(records);
  const groups = [
    ...["Diurno", "Noturno"].map((s) => ({
      label: `Controle de Acesso – Posto ${s}`,
      items: records.filter((r) => r.category === "acesso" && r.shift === s),
      category: "acesso" as const,
    })),
    ...["Diurno", "Noturno"].map((s) => ({
      label: `Vigilância – Posto ${s}`,
      items: records.filter(
        (r) => r.category === "vigilancia" && r.shift === s,
      ),
      category: "vigilancia" as const,
    })),
    {
      label: "Sistema de Câmeras (CFTV)",
      items: byCategory(records, "cameras"),
      category: "cameras" as const,
    },
    {
      label: "Sistemas de Alarme",
      items: byCategory(records, "alarmes"),
      category: "alarmes" as const,
    },
  ];
  const changes = state.changes.filter(
    (c) => c.hospitalId === hospitalId && c.period === period,
  );
  return (
    <>
      <div className="page-title">
        <h1>Raio-X do Hospital</h1>
        <HospitalSelect />
      </div>
      <HospitalBanner />
      <div className="stats raio-stats">
        <Stat
          label="Postos de Controle de Acesso"
          icon={ShieldCheck}
          value={
            <span className="split-value">
              <span>
                {acesso.day}
                <small>Dia</small>
              </span>
              <span>
                {acesso.night}
                <small>Noite</small>
              </span>
            </span>
          }
          onClick={() => navigate("/controle-acesso")}
        />
        <Stat
          label="Postos de Vigilância"
          icon={UserRoundCheck}
          value={
            <span className="split-value">
              <span>
                {vig.day}
                <small>Dia</small>
              </span>
              <span>
                {vig.night}
                <small>Noite</small>
              </span>
            </span>
          }
          onClick={() => navigate("/vigilancia")}
        />
        <Stat
          label="Câmeras"
          icon={Cctv}
          value={quantity(byCategory(records, "cameras"))}
          sub="unidades"
          onClick={() => navigate("/cameras")}
        />
        <Stat
          label="Sistemas de Alarme"
          icon={Bell}
          value={quantity(byCategory(records, "alarmes"))}
          sub="sistemas"
          onClick={() => navigate("/alarmes")}
        />
        <Stat
          label="Custo Mensal (Controle de Acesso)"
          icon={Database}
          value={money(acesso.cost)}
          onClick={() => navigate("/custos")}
        />
        <Stat
          label="Custo Mensal (Vigilância)"
          icon={Database}
          value={money(vig.cost)}
          onClick={() => navigate("/custos")}
        />
        <Stat
          label="Custo Mensal Total"
          icon={Database}
          value={money(total)}
          onClick={() => navigate("/custos")}
        />
      </div>
      <div className="raio-grid">
        <div className="stack">
          <Panel
            title="Resumo do Raio-X"
            icon={ClipboardList}
            actions={<small>Estrutura e custos de segurança da unidade.</small>}
          >
            <div className="summary-strip">
              {[
                {
                  value: acesso.total,
                  label: "postos de acesso total (dia e noite)",
                },
                {
                  value: vig.total,
                  label: "postos de vigilância total (dia e noite)",
                },
                {
                  value: quantity(
                    byCategory(records, "cameras").filter(
                      (r) => r.status === "Ativo",
                    ),
                  ),
                  label: "câmeras em operação",
                },
                {
                  value: quantity(byCategory(records, "alarmes")),
                  label: "sistemas de alarme",
                },
                {
                  value: money(total),
                  label: "custo mensal total com segurança",
                },
              ].map((i) => (
                <div key={i.label}>
                  <b>{i.value}</b>
                  <span>{i.label}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Detalhamento dos serviços" icon={ClipboardList}>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Serviço / Categoria</th>
                    <th>Quantidade</th>
                    <th>Valor unitário médio</th>
                    <th>Custo Mensal (R$)</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={g.label}>
                      <td>
                        <button
                          className="text-link"
                          onClick={() => navigate(categoryRoutes[g.category])}
                        >
                          {g.label}
                        </button>
                      </td>
                      <td>
                        {quantity(g.items)}{" "}
                        {g.category === "cameras"
                          ? "unidades"
                          : g.category === "alarmes"
                            ? "sistemas"
                            : "postos"}
                      </td>
                      <td>
                        {g.items.some((r) => r.billing === "mensalidade")
                          ? "Mensalidade por registro"
                          : money(
                              quantity(g.items)
                                ? cost(g.items) / quantity(g.items)
                                : 0,
                            )}
                      </td>
                      <td>
                        <b>{money(cost(g.items))}</b>
                      </td>
                      <td>
                        {g.category === "acesso" || g.category === "vigilancia"
                          ? "Cobrança por posto / contrato"
                          : "Manutenção e monitoramento"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <div className="two-columns">
            <Panel title="Valores unitários" icon={Tag}>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Serviço / Categoria</th>
                      <th>Faixa de valores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.map((t) => {
                      const items = byCategory(records, t.key).filter(
                        (r) => r.status !== "Inativo",
                      );
                      const min = Math.min(...items.map((r) => r.unitValue)),
                        max = Math.max(...items.map((r) => r.unitValue));
                      return (
                        <tr key={t.key}>
                          <td>
                            {t.label}
                            <small className="cell-sub">
                              Conforme unidade de cobrança
                            </small>
                          </td>
                          <td>
                            {items.length
                              ? min === max
                                ? money(min)
                                : `${money(min)} a ${money(max)}`
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
            <Panel title="Custos operacionais mensais" icon={Database}>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Serviço / Categoria</th>
                      <th>Custo mensal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.map((t) => (
                      <tr key={t.key}>
                        <td>{t.label}</td>
                        <td>{money(t.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total mensal</td>
                      <td>{money(total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Panel>
          </div>
        </div>
        <div className="stack">
          <Panel title="Custo mensal por serviço" icon={Clock3}>
            <Donut
              items={totals}
              onSelect={(k) =>
                navigate(categoryRoutes[k as keyof typeof categoryRoutes])
              }
            />
          </Panel>
          <Panel title="Atualizações recentes do Raio-X" icon={Clock3}>
            <p className="muted small">
              Alterações desta sessão · {periodName(period)}
            </p>
            <div className="timeline">
              {changes.length ? (
                changes.slice(0, 5).map((c) => (
                  <div key={c.id}>
                    <time>
                      {new Date(c.date).toLocaleDateString("pt-BR")}
                      <small>
                        {new Date(c.date).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </time>
                    <span>{c.description}</span>
                  </div>
                ))
              ) : (
                <p>Nenhuma alteração nesta sessão.</p>
              )}
            </div>
            <button
              className="text-link"
              onClick={() => navigate("/atualizacao")}
            >
              Atualizar estrutura do hospital →
            </button>
          </Panel>
        </div>
      </div>
    </>
  );
}

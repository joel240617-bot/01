import { categories } from "../types";
import type { Category, SecurityRecord } from "../types";
export const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );
export const number = (n: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
export const percent = (n: number, total: number) =>
  `${number(total ? (n / total) * 100 : 0)}%`;
export const periodName = (p: string) => {
  const s = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${p}-01T12:00:00Z`));
  return s.charAt(0).toUpperCase() + s.slice(1);
};
export const shortPeriod = (p: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(`${p}-01T12:00:00Z`))
    .replace(". de ", "/");
export function monthlyCost(r: SecurityRecord): number {
  if (r.status === "Inativo") return 0;
  const cents = Math.round(r.unitValue * 100);
  const amount =
    r.billing === "mensalidade"
      ? cents
      : r.billing === "hora"
        ? cents * r.quantity * r.hours
        : cents * r.quantity;
  return Math.round(amount) / 100;
}
export const cost = (rs: SecurityRecord[]) =>
  Math.round(rs.reduce((s, r) => s + Math.round(monthlyCost(r) * 100), 0)) /
  100;
export const quantity = (rs: SecurityRecord[]) =>
  rs.filter((r) => r.status !== "Inativo").reduce((s, r) => s + r.quantity, 0);
export const byCategory = (rs: SecurityRecord[], c: Category) =>
  rs.filter((r) => r.category === c);
export const split = (rs: SecurityRecord[], c: Category) => {
  const list = byCategory(rs, c);
  return {
    day: quantity(list.filter((r) => r.shift === "Diurno")),
    night: quantity(list.filter((r) => r.shift === "Noturno")),
    total: quantity(list),
    cost: cost(list),
  };
};
export const categoryTotals = (rs: SecurityRecord[]) =>
  (Object.keys(categories) as Category[]).map((key) => ({
    key,
    label: categories[key],
    value: cost(byCategory(rs, key)),
  }));
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
export function validateRecord(r: SecurityRecord): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!r.description.trim())
    errors.description = "Informe a identificação do registro.";
  if (!r.unitId) errors.unitId = "Selecione uma unidade ou setor.";
  if (!Number.isInteger(r.quantity) || r.quantity < 1)
    errors.quantity = "Informe uma quantidade inteira maior que zero.";
  if (!Number.isFinite(r.unitValue) || r.unitValue < 0 || r.unitValue > 1e9)
    errors.unitValue = "Informe um valor entre zero e R$ 1 bilhão.";
  if (
    r.billing === "hora" &&
    (!Number.isFinite(r.hours) || r.hours <= 0 || r.hours > 744)
  )
    errors.hours = "Informe entre 0,01 e 744 horas por posto no mês.";
  if (
    r.category === "cameras" &&
    (!Number.isInteger(r.retention) || r.retention < 1)
  )
    errors.retention = "Informe o número de dias de retenção.";
  if (
    r.category === "alarmes" &&
    (!Number.isInteger(r.devices) || r.devices < 0)
  )
    errors.devices = "Informe uma quantidade inteira válida.";
  if (!Number.isFinite(monthlyCost(r)) || monthlyCost(r) > 1e12)
    errors.unitValue = "O custo calculado excede o limite permitido.";
  return errors;
}

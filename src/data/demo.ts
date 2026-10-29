import type {
  AppState,
  Hospital,
  Regional,
  SecurityRecord,
  Unit,
  Category,
} from "../types";
export const regionals: Regional[] = [
  { id: "ma", name: "Maranhão" },
  { id: "sul", name: "Sul do Maranhão" },
];
export const periods = [
  "2024-11",
  "2024-12",
  "2025-01",
  "2025-02",
  "2025-03",
  "2025-04",
];
export const hospitals: Hospital[] = [
  {
    id: "HM001",
    name: "Hospital Maranhense",
    city: "São Luís",
    regionalId: "ma",
    status: "Ativo",
  },
  {
    id: "HM002",
    name: "Hospital de Imperatriz",
    city: "Imperatriz",
    regionalId: "sul",
    status: "Ativo",
  },
  {
    id: "HM003",
    name: "Hospital de Bacabal",
    city: "Bacabal",
    regionalId: "ma",
    status: "Ativo",
  },
  {
    id: "HM004",
    name: "Hospital de Caxias",
    city: "Caxias",
    regionalId: "ma",
    status: "Ativo",
  },
  {
    id: "HM005",
    name: "Hospital de Timon",
    city: "Timon",
    regionalId: "ma",
    status: "Ativo",
  },
  {
    id: "HM006",
    name: "Hospital de Santa Inês",
    city: "Santa Inês",
    regionalId: "ma",
    status: "Em implantação",
  },
];
const unitNames = [
  "Recepção",
  "Emergência",
  "Internação",
  "UTI",
  "Centro Cirúrgico",
  "Estacionamento",
  "Administrativo",
  "Área Externa",
];
const units: Unit[] = hospitals.flatMap((h) =>
  unitNames.map((name, i) => ({
    id: `${h.id}-U${i + 1}`,
    hospitalId: h.id,
    name,
  })),
);
function row(
  category: Category,
  n: number,
  description: string,
  unit: number,
  quantity: number,
  unitValue: number,
  extra: Partial<SecurityRecord> = {},
): SecurityRecord {
  const prefix = {
    acesso: "AC",
    vigilancia: "VIG",
    cameras: "CAM",
    alarmes: "ALM",
  }[category];
  return {
    id: `${prefix}-${String(n).padStart(3, "0")}`,
    hospitalId: "HM001",
    unitId: `HM001-U${unit}`,
    category,
    description,
    location: unitNames[unit - 1],
    quantity,
    unitValue,
    shift: "Diurno",
    billing:
      category === "acesso" || category === "vigilancia" ? "posto" : "unidade",
    hours: 360,
    status: "Ativo",
    type: "",
    retention: 30,
    devices: 0,
    notes: "",
    ...extra,
  };
}
const base: SecurityRecord[] = [
  row("acesso", 1, "Portaria Principal", 1, 2, 18500),
  row("acesso", 2, "Acesso Visitantes", 1, 2, 17350),
  row("acesso", 3, "Recepção Principal", 1, 3, 16800),
  row("acesso", 4, "Estacionamento", 6, 2, 16200),
  row("acesso", 5, "Pronto Atendimento", 2, 2, 18950, { shift: "Noturno" }),
  row("acesso", 6, "Centro Cirúrgico", 5, 2, 19200, { shift: "Noturno" }),
  row("acesso", 7, "UTI Adulto", 4, 2, 18700, { shift: "Noturno" }),
  row("acesso", 8, "UTI Pediátrica", 4, 2, 17600, { shift: "Noturno" }),
  row("acesso", 9, "Acesso Administrativo", 7, 3, 17100),
  row("vigilancia", 1, "Portaria Principal", 1, 2, 18500),
  row("vigilancia", 2, "Ronda Externa", 8, 4, 16800, { shift: "Noturno" }),
  row("vigilancia", 3, "Pronto Atendimento", 2, 3, 17950),
  row("vigilancia", 4, "Estacionamento", 6, 3, 16300, { shift: "Noturno" }),
  row("vigilancia", 5, "Bloco Administrativo", 7, 2, 17200),
  row("vigilancia", 6, "Internação", 3, 5, 17800),
  row("vigilancia", 7, "UTI", 4, 5, 18200, { shift: "Noturno" }),
  row("vigilancia", 8, "Recepção Central", 1, 3, 17750),
  row("vigilancia", 9, "Centro Cirúrgico", 5, 3, 17900),
  row("cameras", 1, "Recepção Principal", 1, 4, 320, {
    type: "Dome",
    retention: 15,
  }),
  row("cameras", 2, "Entrada de Emergência", 2, 6, 280, { type: "Bullet" }),
  row("cameras", 3, "Corredor - Ala A", 3, 8, 320, { type: "Dome" }),
  row("cameras", 4, "UTI Adulto", 4, 10, 350, { type: "Dome" }),
  row("cameras", 5, "Centro Cirúrgico 1", 5, 8, 350, { type: "Dome" }),
  row("cameras", 6, "Estacionamento Principal", 6, 12, 280, { type: "Bullet" }),
  row("cameras", 7, "Área Administrativa", 7, 10, 320, {
    type: "Dome",
    retention: 60,
  }),
  row("cameras", 8, "Corredor - Ala B", 3, 8, 320, { type: "Dome" }),
  row("cameras", 9, "Sala de Espera", 1, 8, 320, {
    type: "Dome",
    retention: 15,
  }),
  row("cameras", 10, "Portão de Serviço", 6, 4, 280, {
    type: "Bullet",
    status: "Em manutenção",
    retention: 90,
  }),
  row("cameras", 11, "Pronto Atendimento", 2, 8, 350, { type: "Dome" }),
  row("alarmes", 1, "Alarme Perimetral", 8, 1, 3400, {
    type: "Perimetral",
    devices: 4,
    billing: "mensalidade",
  }),
  row("alarmes", 2, "Alarme de Incêndio", 5, 1, 3840, {
    type: "Incêndio",
    devices: 12,
    billing: "mensalidade",
  }),
  row("alarmes", 3, "Alarme Técnico", 4, 1, 2080, {
    type: "Técnico",
    devices: 8,
    billing: "mensalidade",
  }),
  row("alarmes", 4, "Alarme de Pânico", 1, 1, 2700, {
    type: "Pânico",
    devices: 15,
    billing: "mensalidade",
  }),
  row("alarmes", 5, "Central de Gases", 4, 1, 2520, {
    type: "Técnico",
    devices: 6,
    billing: "mensalidade",
    status: "Em manutenção",
  }),
  row("alarmes", 6, "Casa de Máquinas", 8, 1, 3560, {
    type: "Técnico",
    devices: 10,
    billing: "mensalidade",
  }),
];
export function createDemoState(): AppState {
  const records = hospitals.flatMap((h, index) =>
    base
      .filter((_, i) => index === 0 || i % (index + 1) === 0)
      .map((r) => ({
        ...r,
        id: index ? `${h.id}-${r.id}` : r.id,
        hospitalId: h.id,
        unitId: r.unitId.replace("HM001", h.id),
        quantity: index
          ? Math.max(1, Math.round(r.quantity * 0.55))
          : r.quantity,
      })),
  );
  const factors = [0.91, 0.94, 0.97, 0.98, 1.01, 1];
  return {
    hospitals: structuredClone(hospitals),
    units: structuredClone(units),
    monthly: Object.fromEntries(
      periods.map((p, i) => [
        p,
        records.map((r) => ({
          ...r,
          unitValue: Math.round(r.unitValue * factors[i] * 100) / 100,
        })),
      ]),
    ),
    changes: [],
  };
}

export type Category = "acesso" | "vigilancia" | "cameras" | "alarmes";
export type Shift = "Diurno" | "Noturno";
export type Billing = "posto" | "hora" | "unidade" | "mensalidade";
export type Status = "Ativo" | "Em manutenção" | "Inativo";
export interface Regional {
  id: string;
  name: string;
}
export interface Hospital {
  id: string;
  regionalId: string;
  name: string;
  city: string;
  status: "Ativo" | "Em implantação" | "Inativo";
}
export interface Unit {
  id: string;
  hospitalId: string;
  name: string;
}
export interface SecurityRecord {
  id: string;
  hospitalId: string;
  unitId: string;
  category: Category;
  description: string;
  location: string;
  shift: Shift;
  quantity: number;
  billing: Billing;
  unitValue: number;
  hours: number;
  status: Status;
  type: string;
  retention: number;
  devices: number;
  notes: string;
}
export interface Change {
  id: string;
  hospitalId: string;
  period: string;
  date: string;
  description: string;
}
export interface AppState {
  hospitals: Hospital[];
  units: Unit[];
  monthly: Record<string, SecurityRecord[]>;
  changes: Change[];
}
export type AppAction =
  | { type: "SAVE"; period: string; record: SecurityRecord }
  | { type: "STATUS"; period: string; id: string; status: Status }
  | { type: "HOSPITAL"; hospital: Hospital }
  | { type: "UNIT"; unit: Unit };
export const categories: Record<Category, string> = {
  acesso: "Controle de Acesso",
  vigilancia: "Vigilância",
  cameras: "Câmeras",
  alarmes: "Alarmes",
};
export const billingLabels: Record<Billing, string> = {
  posto: "Por posto / mês",
  hora: "Por hora / posto",
  unidade: "Por unidade / mês",
  mensalidade: "Mensalidade fixa",
};

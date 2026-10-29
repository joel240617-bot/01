import type { AppState, AppAction } from "../types";
export function reducer(state: AppState, action: AppAction): AppState {
  if (action.type === "HOSPITAL")
    return { ...state, hospitals: [...state.hospitals, action.hospital] };
  if (action.type === "UNIT")
    return { ...state, units: [...state.units, action.unit] };
  const records = state.monthly[action.period] ?? [];
  const old = records.find(
    (r) => r.id === (action.type === "SAVE" ? action.record.id : action.id),
  );
  if (action.type === "STATUS" && !old) return state;
  const record =
    action.type === "SAVE"
      ? { ...action.record, description: action.record.description.trim() }
      : { ...old!, status: action.status };
  const description =
    action.type === "STATUS"
      ? `${record.description}: ${record.status.toLowerCase()}`
      : old
        ? `${record.description}: ${old.quantity} → ${record.quantity}; valor atualizado`
        : `${record.description}: registro incluído`;
  return {
    ...state,
    monthly: {
      ...state.monthly,
      [action.period]: old
        ? records.map((r) => (r.id === record.id ? record : r))
        : [...records, record],
    },
    changes: [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        period: action.period,
        hospitalId: record.hospitalId,
        description,
      },
      ...state.changes,
    ],
  };
}

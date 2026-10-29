import { createContext, useContext, useReducer, useState } from "react";
import type { ReactNode, Dispatch } from "react";
import { createDemoState } from "../data/demo";
import { reducer } from "./reducer";
import type { AppState, AppAction } from "../types";
interface Context {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  hospitalId: string;
  selectHospital: (id: string) => void;
  regionalId: string;
  selectRegional: (id: string) => void;
  period: string;
  setPeriod: (p: string) => void;
  message: string;
  notify: (s: string) => void;
}
const AppContext = createContext<Context | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createDemoState);
  const [hospitalId, setHospital] = useState("HM001");
  const [regionalId, setRegional] = useState("ma");
  const [period, setPeriod] = useState("2025-04");
  const [message, notify] = useState("");
  function selectHospital(id: string) {
    setHospital(id);
    const h = state.hospitals.find((h) => h.id === id);
    if (h) setRegional(h.regionalId);
  }
  function selectRegional(id: string) {
    setRegional(id);
    if (state.hospitals.find((h) => h.id === hospitalId)?.regionalId !== id)
      setHospital(state.hospitals.find((h) => h.regionalId === id)?.id ?? "");
  }
  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        hospitalId,
        selectHospital,
        regionalId,
        selectRegional,
        period,
        setPeriod,
        message,
        notify,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("Provider ausente");
  return context;
}
export function useHospital() {
  const app = useApp();
  return {
    ...app,
    hospital: app.state.hospitals.find((h) => h.id === app.hospitalId),
    records: (app.state.monthly[app.period] ?? []).filter(
      (r) => r.hospitalId === app.hospitalId,
    ),
    units: app.state.units.filter((u) => u.hospitalId === app.hospitalId),
  };
}

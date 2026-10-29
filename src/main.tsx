import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Provider } from "./state/AppContext";
import { Layout } from "./components/Layout";
import { RaioX } from "./pages/RaioX";
import { Overview } from "./pages/Overview";
import { Hospitals } from "./pages/Hospitals";
import { Inventory } from "./pages/Inventory";
import { Costs } from "./pages/Costs";
import { Update } from "./pages/Update";
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-500.css";
import "@fontsource/roboto/latin-600.css";
import "@fontsource/roboto/latin-700.css";
import "./styles/app.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/raio-x" replace />} />
            <Route path="raio-x" element={<RaioX />} />
            <Route path="visao-geral" element={<Overview />} />
            <Route path="hospitais" element={<Hospitals />} />
            <Route
              path="controle-acesso"
              element={<Inventory key="acesso" category="acesso" />}
            />
            <Route
              path="vigilancia"
              element={<Inventory key="vigilancia" category="vigilancia" />}
            />
            <Route
              path="cameras"
              element={<Inventory key="cameras" category="cameras" />}
            />
            <Route
              path="alarmes"
              element={<Inventory key="alarmes" category="alarmes" />}
            />
            <Route path="custos" element={<Costs />} />
            <Route path="atualizacao" element={<Update />} />
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>Página não encontrada</h1>
                  <p>Selecione uma área no menu ou volte ao Raio-X.</p>
                  <Link className="primary" to="/raio-x">
                    Abrir Raio-X
                  </Link>
                </div>
              }
            />
          </Route>
        </Routes>
      </HashRouter>
    </Provider>
  </React.StrictMode>,
);

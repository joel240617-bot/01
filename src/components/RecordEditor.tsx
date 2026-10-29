import { useState } from "react";
import type { FormEvent } from "react";
import {
  Eye,
  Pencil,
  Power,
  Plus,
  Save,
  Info,
  MoreVertical,
} from "lucide-react";
import { useHospital } from "../state/AppContext";
import { categories, billingLabels } from "../types";
import type {
  SecurityRecord,
  Category,
  Billing,
  Status,
  Shift,
} from "../types";
import {
  money,
  monthlyCost,
  validateRecord,
  periodName,
} from "../utils/calculations";
import { Modal, Field, Badge, Panel } from "./UI";
export function RecordEditor({
  record,
  category = "acesso",
  onClose,
  inline = false,
}: {
  record?: SecurityRecord;
  category?: Category;
  onClose: () => void;
  inline?: boolean;
}) {
  const { hospitalId, hospital, units, dispatch, period, notify } =
    useHospital();
  const [draft, setDraft] = useState<SecurityRecord>(
    record
      ? { ...record }
      : {
          id: crypto.randomUUID(),
          hospitalId,
          unitId: units[0]?.id ?? "",
          category,
          description: "",
          location: units[0]?.name ?? "",
          shift: "Diurno",
          quantity: 1,
          billing:
            category === "acesso" || category === "vigilancia"
              ? "posto"
              : "unidade",
          unitValue: 0,
          hours: 360,
          status: "Ativo",
          type:
            category === "cameras"
              ? "Dome"
              : category === "alarmes"
                ? "Perimetral"
                : "",
          retention: 30,
          devices: 0,
          notes: "",
        },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(false);
  const [newUnit, setNewUnit] = useState("");
  const set = <K extends keyof SecurityRecord>(
    key: K,
    value: SecurityRecord[K],
  ) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setConfirm(false);
  };
  const isPost = draft.category === "acesso" || draft.category === "vigilancia";
  function submit(e: FormEvent) {
    e.preventDefault();
    const e2 = validateRecord(draft);
    if (draft.unitId === "new" && !newUnit.trim())
      e2.unitId = "Informe o nome do setor.";
    setErrors(e2);
    if (Object.keys(e2).length) {
      setConfirm(false);
      return;
    }
    setConfirm(true);
  }
  function save() {
    let saved = { ...draft };
    if (draft.unitId === "new") {
      const id = crypto.randomUUID();
      dispatch({
        type: "UNIT",
        unit: { id, hospitalId, name: newUnit.trim() },
      });
      saved = { ...draft, unitId: id, location: newUnit.trim() };
    }
    dispatch({ type: "SAVE", period, record: saved });
    notify("Registro atualizado nesta sessão. Indicadores recalculados.");
    onClose();
  }
  const form = (
    <form onSubmit={submit} noValidate>
      <div className="modal-body">
        <div className="form-context">
          <Info size={18} />
          <span>
            {hospital?.name} · {periodName(period)}
            <small>
              Alteração local; os outros meses serão preservados nesta sessão.
            </small>
          </span>
        </div>
        <div className="form-grid">
          <Field label="Categoria">
            <select
              value={draft.category}
              disabled={Boolean(record)}
              onChange={(e) => {
                const c = e.target.value as Category;
                setDraft((d) => ({
                  ...d,
                  category: c,
                  billing:
                    c === "acesso" || c === "vigilancia" ? "posto" : "unidade",
                  type:
                    c === "cameras"
                      ? "Dome"
                      : c === "alarmes"
                        ? "Perimetral"
                        : "",
                }));
                setConfirm(false);
              }}
            >
              {Object.entries(categories).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Unidade / setor *" error={errors.unitId}>
            <select
              value={draft.unitId}
              onChange={(e) => {
                setDraft((d) => ({
                  ...d,
                  unitId: e.target.value,
                  location:
                    units.find((u) => u.id === e.target.value)?.name ?? "",
                }));
                setConfirm(false);
              }}
            >
              <option value="">Selecione...</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
              <option value="new">+ Cadastrar novo setor</option>
            </select>
          </Field>
          {draft.unitId === "new" && (
            <Field label="Nome do novo setor *">
              <input
                value={newUnit}
                onChange={(e) => {
                  setNewUnit(e.target.value);
                  setConfirm(false);
                }}
              />
            </Field>
          )}
          <Field label="Identificação / descrição *" error={errors.description}>
            <input
              autoFocus
              value={draft.description}
              maxLength={120}
              onChange={(e) => set("description", e.target.value)}
              aria-invalid={Boolean(errors.description)}
            />
          </Field>
          <Field label="Localização">
            <input
              value={draft.location}
              maxLength={120}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
          {isPost && (
            <Field label="Turno">
              <select
                value={draft.shift}
                onChange={(e) => set("shift", e.target.value as Shift)}
              >
                <option>Diurno</option>
                <option>Noturno</option>
              </select>
            </Field>
          )}
          <Field
            label={
              draft.category === "alarmes"
                ? "Quantidade de sistemas *"
                : "Quantidade *"
            }
            error={errors.quantity}
          >
            <input
              type="number"
              min="1"
              step="1"
              value={draft.quantity}
              onChange={(e) => set("quantity", e.target.valueAsNumber)}
              aria-invalid={Boolean(errors.quantity)}
            />
          </Field>
          <Field label="Modelo de cobrança">
            <select
              value={draft.billing}
              onChange={(e) => set("billing", e.target.value as Billing)}
            >
              {Object.entries(billingLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={
              draft.billing === "mensalidade"
                ? "Mensalidade total (R$) *"
                : "Valor unitário (R$) *"
            }
            error={errors.unitValue}
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.unitValue}
              onChange={(e) => set("unitValue", e.target.valueAsNumber)}
              aria-invalid={Boolean(errors.unitValue)}
            />
          </Field>
          {draft.billing === "hora" && (
            <Field label="Horas mensais por posto *" error={errors.hours}>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="744"
                value={draft.hours}
                onChange={(e) => set("hours", e.target.valueAsNumber)}
              />
            </Field>
          )}
          <Field label="Situação">
            <select
              value={draft.status}
              onChange={(e) => set("status", e.target.value as Status)}
            >
              <option>Ativo</option>
              <option>Em manutenção</option>
              <option>Inativo</option>
            </select>
          </Field>
          {!isPost && (
            <Field label="Tipo">
              <select
                value={draft.type}
                onChange={(e) => set("type", e.target.value)}
              >
                {(draft.category === "cameras"
                  ? ["Dome", "Bullet", "PTZ", "Outro"]
                  : ["Perimetral", "Incêndio", "Técnico", "Pânico", "Outro"]
                ).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          )}
          {draft.category === "cameras" && (
            <Field
              label="Retenção das gravações (dias) *"
              error={errors.retention}
            >
              <input
                type="number"
                min="1"
                step="1"
                value={draft.retention}
                onChange={(e) => set("retention", e.target.valueAsNumber)}
              />
            </Field>
          )}
          {draft.category === "alarmes" && (
            <Field label="Dispositivos / sensores" error={errors.devices}>
              <input
                type="number"
                min="0"
                step="1"
                value={draft.devices}
                onChange={(e) => set("devices", e.target.valueAsNumber)}
              />
            </Field>
          )}
          <Field label="Observações">
            <textarea
              rows={2}
              value={draft.notes}
              maxLength={500}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>
        <div className="calculation">
          <div>
            <span>Custo mensal calculado</span>
            <small>
              {draft.billing === "mensalidade"
                ? "Mensalidade fixa do registro"
                : draft.billing === "hora"
                  ? "Quantidade × horas mensais × valor por hora"
                  : "Quantidade × valor unitário"}
              {draft.status === "Inativo" ? " · Inativo: custo zero" : ""}
            </small>
          </div>
          <strong>
            {Number.isFinite(monthlyCost(draft))
              ? money(monthlyCost(draft))
              : "Confira os valores"}
          </strong>
        </div>
        {confirm && (
          <div className="confirm-box" role="status">
            Confirma a atualização de <b>{draft.description}</b> em{" "}
            {periodName(period)}? Os indicadores deste hospital e da regional
            serão recalculados.
          </div>
        )}
      </div>
      <footer className="modal-footer">
        <button type="button" className="secondary" onClick={onClose}>
          Cancelar
        </button>
        {confirm ? (
          <button type="button" className="primary" onClick={save}>
            <Save size={17} /> Confirmar e salvar
          </button>
        ) : (
          <button className="primary" type="submit">
            <Save size={17} /> Revisar alteração
          </button>
        )}
      </footer>
    </form>
  );
  return inline ? (
    <Panel
      title={record ? "Editar registro" : "Novo registro"}
      icon={Plus}
      className="inline-editor"
    >
      {form}
    </Panel>
  ) : (
    <Modal
      title={record ? "Editar registro" : "Novo registro"}
      onClose={onClose}
    >
      {form}
    </Modal>
  );
}
export function RecordActions({ record }: { record: SecurityRecord }) {
  const [mode, setMode] = useState<"view" | "edit" | "status" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { dispatch, period, notify, units } = useHospital();
  const isPost =
    record.category === "acesso" || record.category === "vigilancia";
  return (
    <>
      <div
        className={`row-actions ${isPost ? "post-actions" : ""} ${
          record.category === "vigilancia" ? "vigilancia-actions" : ""
        }`}
      >
        {isPost && (
          <button
            className="icon-button more-actions"
            aria-label={`Mais ações de ${record.description}`}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreVertical size={18} />
          </button>
        )}
        <button
          className={`icon-button ${isPost ? "compat-action" : ""} ${
            record.category === "vigilancia" ? "post-view-action" : ""
          }`}
          aria-label={`Ver ${record.description}`}
          onClick={() => setMode("view")}
        >
          <Eye size={17} />
        </button>
        <button
          className={`icon-button ${isPost ? "compat-action" : ""}`}
          aria-label={`Editar ${record.description}`}
          onClick={() => setMode("edit")}
        >
          <Pencil size={16} />
        </button>
        <button
          className={`icon-button ${isPost ? "compat-action" : ""}`}
          aria-label={`${record.status === "Inativo" ? "Reativar" : "Inativar"} ${record.description}`}
          onClick={() => setMode("status")}
        >
          <Power size={16} />
        </button>
        {isPost && menuOpen && (
          <div className="row-action-menu">
            <button
              onClick={() => {
                setMode("view");
                setMenuOpen(false);
              }}
            >
              Ver registro
            </button>
            <button
              onClick={() => {
                setMode("edit");
                setMenuOpen(false);
              }}
            >
              Editar registro
            </button>
            <button
              onClick={() => {
                setMode("status");
                setMenuOpen(false);
              }}
            >
              {record.status === "Inativo" ? "Reativar" : "Inativar"}
            </button>
          </div>
        )}
      </div>
      {mode === "edit" && (
        <RecordEditor record={record} onClose={() => setMode(null)} />
      )}
      {mode === "view" && (
        <Modal title={record.description} onClose={() => setMode(null)}>
          <div className="modal-body">
            <dl className="details">
              <div>
                <dt>Categoria</dt>
                <dd>{categories[record.category]}</dd>
              </div>
              <div>
                <dt>Setor</dt>
                <dd>{units.find((u) => u.id === record.unitId)?.name}</dd>
              </div>
              <div>
                <dt>Local</dt>
                <dd>{record.location}</dd>
              </div>
              <div>
                <dt>Quantidade</dt>
                <dd>{record.quantity}</dd>
              </div>
              <div>
                <dt>Cobrança</dt>
                <dd>{billingLabels[record.billing]}</dd>
              </div>
              <div>
                <dt>Valor unitário / mensalidade</dt>
                <dd>{money(record.unitValue)}</dd>
              </div>
              <div>
                <dt>Custo mensal</dt>
                <dd>{money(monthlyCost(record))}</dd>
              </div>
              <div>
                <dt>Situação</dt>
                <dd>
                  <Badge status={record.status} />
                </dd>
              </div>
            </dl>
            {record.notes && <p>{record.notes}</p>}
            <button className="primary" onClick={() => setMode("edit")}>
              <Pencil size={16} /> Editar registro
            </button>
          </div>
        </Modal>
      )}
      {mode === "status" && (
        <Modal
          title={
            record.status === "Inativo"
              ? "Reativar registro"
              : "Inativar registro"
          }
          onClose={() => setMode(null)}
        >
          <div className="modal-body">
            <p>
              Confirma{" "}
              {record.status === "Inativo" ? "a reativação" : "a inativação"} de{" "}
              <b>{record.description}</b> em {periodName(period)}?
            </p>
            <p>Os quantitativos e custos serão recalculados nesta sessão.</p>
          </div>
          <footer className="modal-footer">
            <button className="secondary" onClick={() => setMode(null)}>
              Cancelar
            </button>
            <button
              className="primary"
              onClick={() => {
                dispatch({
                  type: "STATUS",
                  id: record.id,
                  period,
                  status: record.status === "Inativo" ? "Ativo" : "Inativo",
                });
                notify("Situação atualizada nesta sessão.");
                setMode(null);
              }}
            >
              Confirmar
            </button>
          </footer>
        </Modal>
      )}
    </>
  );
}

import test from "node:test";
import assert from "node:assert/strict";
import { createDemoState } from "../src/data/demo";
import {
  monthlyCost,
  cost,
  quantity,
  split,
  categoryTotals,
  validateRecord,
} from "../src/utils/calculations";
import { reducer } from "../src/state/reducer";
const original = createDemoState();
const base = original.monthly["2025-04"][0];
test("cobrança mensal por posto usa quantidade e centavos", () => {
  assert.equal(
    monthlyCost({ ...base, quantity: 3, unitValue: 10.15, billing: "posto" }),
    30.45,
  );
});
test("valor por hora inclui horas por posto", () => {
  assert.equal(
    monthlyCost({
      ...base,
      billing: "hora",
      quantity: 2,
      hours: 180,
      unitValue: 25.5,
    }),
    9180,
  );
});
test("mensalidade fixa não multiplica quantidade", () => {
  assert.equal(
    monthlyCost({
      ...base,
      billing: "mensalidade",
      quantity: 6,
      unitValue: 2500,
    }),
    2500,
  );
});
test("inativação exclui quantidade e custo, manutenção mantém cobrança", () => {
  assert.equal(monthlyCost({ ...base, status: "Inativo" }), 0);
  assert.equal(quantity([{ ...base, status: "Inativo" }]), 0);
  assert.equal(
    monthlyCost({ ...base, status: "Em manutenção" }),
    monthlyCost(base),
  );
});
test("dados de referência: 20 postos de acesso, 30 de vigilância, 86 câmeras e 6 alarmes", () => {
  const rs = original.monthly["2025-04"].filter(
    (r) => r.hospitalId === "HM001",
  );
  assert.deepEqual(
    [
      split(rs, "acesso").total,
      split(rs, "vigilancia").total,
      quantity(rs.filter((r) => r.category === "cameras")),
      quantity(rs.filter((r) => r.category === "alarmes")),
    ],
    [20, 30, 86, 6],
  );
  assert.equal(split(rs, "acesso").day, 12);
  assert.equal(split(rs, "vigilancia").night, 12);
});
test("totais financeiros reconciliam categorias, hospitais e regional", () => {
  const rs = original.monthly["2025-04"];
  assert.equal(
    cost(rs),
    Math.round(categoryTotals(rs).reduce((s, r) => s + r.value, 0) * 100) / 100,
  );
  assert.equal(
    cost(rs),
    original.hospitals.reduce(
      (s, h) => s + cost(rs.filter((r) => r.hospitalId === h.id)),
      0,
    ),
  );
});
test("edição é isolada à competência e hospital e atualiza o consolidado", () => {
  const changed = reducer(original, {
    type: "SAVE",
    period: "2025-04",
    record: { ...base, quantity: base.quantity + 1 },
  });
  assert.equal(
    cost(changed.monthly["2025-04"]) - cost(original.monthly["2025-04"]),
    base.unitValue,
  );
  assert.deepEqual(changed.monthly["2025-03"], original.monthly["2025-03"]);
  assert.deepEqual(
    changed.monthly["2025-04"].filter((r) => r.hospitalId === "HM002"),
    original.monthly["2025-04"].filter((r) => r.hospitalId === "HM002"),
  );
  assert.equal(changed.changes.length, 1);
  assert.equal(original.changes.length, 0);
});
test("inativar e reativar preserva o registro", () => {
  const off = reducer(original, {
    type: "STATUS",
    period: "2025-04",
    id: base.id,
    status: "Inativo",
  });
  assert.equal(
    off.monthly["2025-04"].length,
    original.monthly["2025-04"].length,
  );
  assert.equal(
    cost(original.monthly["2025-04"]) - cost(off.monthly["2025-04"]),
    monthlyCost(base),
  );
  const on = reducer(off, {
    type: "STATUS",
    period: "2025-04",
    id: base.id,
    status: "Ativo",
  });
  assert.equal(cost(on.monthly["2025-04"]), cost(original.monthly["2025-04"]));
});
test("validação rejeita negativos, frações, ausência de descrição e campos não numéricos", () => {
  assert.ok(validateRecord({ ...base, quantity: -1 }).quantity);
  assert.ok(validateRecord({ ...base, quantity: 1.5 }).quantity);
  assert.ok(validateRecord({ ...base, unitValue: NaN }).unitValue);
  assert.ok(validateRecord({ ...base, unitValue: -1 }).unitValue);
  assert.ok(validateRecord({ ...base, description: " " }).description);
  assert.ok(validateRecord({ ...base, billing: "hora", hours: 0 }).hours);
  assert.deepEqual(validateRecord(base), {});
});
test("inserção cria registro sem substituir outros", () => {
  const row = { ...base, id: "novo", description: "Novo posto" };
  const next = reducer(original, {
    type: "SAVE",
    period: "2025-04",
    record: row,
  });
  assert.equal(
    next.monthly["2025-04"].length,
    original.monthly["2025-04"].length + 1,
  );
  assert.equal(
    cost(next.monthly["2025-04"]) - cost(original.monthly["2025-04"]),
    monthlyCost(row),
  );
});

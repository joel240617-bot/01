const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.env.BASE_URL || "http://127.0.0.1:5173";
(async () => {
  const browser = await chromium.launch({
    headless: true,
    slowMo: 60,
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({
    viewport: { width: 1672, height: 941 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let checks = 0;
  const ok = (condition, message) => {
    assert.ok(condition, message);
    checks++;
    console.log("PASS", message);
  };
  const navigate = async (route) => {
    await page.goto(base + "/#/" + route);
    await page.locator("h1").waitFor();
  };
  const link = async (name) => {
    await page
      .getByRole("navigation")
      .getByRole("link", { name, exact: true })
      .click();
  };
  try {
    for (const route of [
      "raio-x",
      "visao-geral",
      "hospitais",
      "controle-acesso",
      "vigilancia",
      "cameras",
      "alarmes",
      "custos",
      "atualizacao",
    ]) {
      await navigate(route);
      ok(await page.locator("h1").isVisible(), `rota ${route}`);
    }
    await navigate("controle-acesso");
    const baseline = await page.locator(".stat").last().textContent();
    await page
      .getByRole("button", { name: "Editar Portaria Principal", exact: true })
      .click();
    await page.getByLabel("Quantidade *", { exact: true }).fill("-1");
    await page.getByRole("button", { name: "Revisar alteração" }).click();
    ok(
      await page
        .getByRole("alert")
        .filter({ hasText: "quantidade inteira" })
        .isVisible(),
      "validação de quantidade negativa",
    );
    await page.getByLabel("Quantidade *", { exact: true }).fill("3");
    await page.getByRole("button", { name: "Revisar alteração" }).click();
    await page.getByRole("button", { name: "Confirmar e salvar" }).click();
    ok(
      (await page.locator(".stat").last().textContent()) !== baseline,
      "edição recalcula custo",
    );
    ok(
      (await page.locator(".stat").nth(2).textContent()).includes("21"),
      "edição recalcula postos",
    );
    await link("Raio-X");
    ok(
      (await page.locator(".summary-strip").textContent()).includes("21"),
      "Raio-X acompanha edição",
    );
    await link("Controle de Acesso");
    await page
      .getByLabel("Competência", { exact: true })
      .first()
      .selectOption("2025-03");
    ok(
      (await page.locator(".stat").nth(2).textContent()).includes("20"),
      "competência anterior preservada",
    );
    await page
      .getByLabel("Competência", { exact: true })
      .first()
      .selectOption("2025-04");
    await page
      .getByRole("button", { name: "Inativar Portaria Principal", exact: true })
      .click();
    await page.getByRole("button", { name: "Cancelar", exact: true }).click();
    ok(
      (await page.locator(".stat").nth(2).textContent()).includes("21"),
      "cancelar inativação preserva dados",
    );
    await page
      .getByRole("button", { name: "Inativar Portaria Principal", exact: true })
      .click();
    await page.getByRole("button", { name: "Confirmar", exact: true }).click();
    ok(
      (await page.locator(".stat").nth(2).textContent()).includes("18"),
      "inativação reduz quantitativo",
    );
    await page
      .getByRole("button", { name: "Reativar Portaria Principal", exact: true })
      .click();
    await page.getByRole("button", { name: "Confirmar", exact: true }).click();
    ok(
      (await page.locator(".stat").nth(2).textContent()).includes("21"),
      "reativação restaura quantitativo",
    );
    await page.getByLabel("Turno", { exact: true }).selectOption("Noturno");
    ok(
      (await page.getByRole("table").locator("tbody tr").count()) === 4,
      "filtro por turno",
    );
    await page.getByLabel("Turno", { exact: true }).selectOption("");
    await page.getByRole("button", { name: "Próxima página" }).click();
    ok(
      (await page.getByRole("table").locator("tbody tr").count()) === 1,
      "paginação de registros",
    );
    await page.getByRole("button", { name: "Página anterior" }).click();
    await page.getByRole("button", { name: "Quantidade", exact: true }).click();
    ok(
      (
        await page.getByRole("table").locator("tbody tr").first().textContent()
      ).includes("AC-002"),
      "ordenação por quantidade",
    );
    await page.getByLabel("Pesquisar", { exact: true }).fill("zzzzzz");
    ok(
      await page
        .getByRole("heading", { name: "Nenhum registro encontrado." })
        .isVisible(),
      "estado vazio da pesquisa",
    );
    await page.getByRole("button", { name: "Limpar pesquisa" }).click();
    await page.getByRole("button", { name: "Novo posto" }).click();
    await page
      .getByLabel("Identificação / descrição *")
      .fill("Posto de teste local");
    await page.getByLabel("Modelo de cobrança").selectOption("hora");
    await page.getByLabel("Horas mensais por posto *").fill("100");
    await page.getByLabel("Valor unitário (R$) *").fill("10");
    await page.getByRole("button", { name: "Revisar alteração" }).click();
    await page.getByRole("button", { name: "Confirmar e salvar" }).click();
    ok(
      (await page.locator(".stat").nth(2).textContent()).includes("22"),
      "criação de posto por hora",
    );
    await link("Raio-X");
    await page.getByLabel("Hospital selecionado").selectOption("HM002");
    const other = await page.locator(".summary-strip").textContent();
    ok(!other.includes("22postos"), "troca de hospital troca dados");
    await link("Câmeras");
    ok(
      (await page.locator(".hospital-info").textContent()).includes(
        "Imperatriz",
      ),
      "hospital preservado ao navegar",
    );
    await link("Hospitais");
    await page.getByRole("button", { name: "Novo hospital" }).click();
    await page.getByLabel("Nome do hospital *").fill("Hospital Teste Local");
    await page.getByLabel("Cidade *").fill("São Luís");
    await page.getByRole("button", { name: "Cadastrar hospital" }).click();
    ok(
      await page
        .getByRole("button", { name: "Hospital Teste Local", exact: true })
        .isVisible(),
      "cadastro de hospital",
    );
    await page
      .getByRole("button", { name: "Hospital Teste Local", exact: true })
      .click();
    ok(
      (await page.locator(".summary-strip").textContent())
        .replace(/\u00a0/g, " ")
        .includes("R$ 0,00"),
      "hospital novo inicia vazio",
    );
    await link("Atualização");
    await page
      .getByRole("button", { name: "Novo registro", exact: true })
      .click();
    await page.getByLabel("Unidade / setor *").selectOption("new");
    await page.getByLabel("Nome do novo setor *").fill("Recepção");
    await page.getByLabel("Identificação / descrição *").fill("Portaria Teste");
    await page.getByLabel("Valor unitário (R$) *").fill("100");
    await page.getByRole("button", { name: "Revisar alteração" }).click();
    await page.getByRole("button", { name: "Confirmar e salvar" }).click();
    ok(
      (await page.getByRole("table").textContent()).includes("Portaria Teste"),
      "cadastro de setor e registro em hospital vazio",
    );
    await link("Visão Geral");
    await page.getByLabel("Regional", { exact: true }).selectOption("sul");
    ok(
      (await page.locator("main").textContent()).includes("Imperatriz"),
      "filtro regional",
    );
    ok(
      !(await page.getByRole("table").textContent()).includes("Bacabal"),
      "consolidado isolado por regional",
    );
    await link("Custos");
    await page.getByLabel("Categoria", { exact: true }).selectOption("alarmes");
    ok(
      (await page.locator(".cost-chart-grid .chart-legend button").count()) ===
        1,
      "filtro de categoria nos custos",
    );
    await page.getByLabel("Busca global de hospitais").fill("Marannnn");
    ok(
      await page.getByText("Nenhum hospital encontrado.").isVisible(),
      "busca global vazia",
    );
    await page.getByLabel("Busca global de hospitais").fill("Maranhense");
    await page.locator(".search-results button").click();
    ok(
      (await page.locator(".hospital-info").textContent()).includes(
        "Maranhense",
      ),
      "busca global navega ao hospital",
    );
    await navigate("nao-existe");
    ok(
      await page
        .getByRole("heading", { name: "Página não encontrada" })
        .isVisible(),
      "rota inexistente",
    );
    await navigate("raio-x");
    await page.reload();
    await page.locator(".summary-strip").waitFor();
    ok(
      (await page.locator(".summary-strip").textContent()).includes("20postos"),
      "recarregar restaura dados demonstrativos",
    );
    for (const width of [768, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of [
        "raio-x",
        "visao-geral",
        "hospitais",
        "controle-acesso",
        "vigilancia",
        "cameras",
        "alarmes",
        "custos",
        "atualizacao",
      ]) {
        await navigate(route);
        ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `sem transbordamento ${route} em ${width}px`,
        );
      }
    }
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Raio-X", exact: true })
      .click();
    ok(
      await page
        .getByRole("heading", { name: "Raio-X do Hospital" })
        .isVisible(),
      "menu móvel",
    );
    ok(errors.length === 0, `sem erros de execução (${errors.join("; ")})`);
    console.log(`${checks} verificações passaram.`);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

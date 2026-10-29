# Raio-X Hospitalar — frontend local

Aplicação React + TypeScript com navegação, filtros, formulários e cálculos locais para a estrutura de segurança hospitalar. Implementada a partir das oito referências fornecidas. Todos os hospitais, valores, usuário e períodos exibidos pertencem a uma base demonstrativa.

## Executar

Requer Node.js 22 ou superior e npm.

```sh
npm ci
npm run dev
```

Abra o endereço impresso pelo Vite, normalmente `http://localhost:5173`. A tela inicial é `/#/raio-x`. As alterações são mantidas apenas na memória da aba; recarregar restaura os exemplos.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Para os testes do navegador, mantenha `npm run dev` em outro terminal e execute `npm run test:e2e`. O teste usa Chromium em `/usr/bin/chromium`, se disponível. Em outros ambientes, instale o navegador com `npx playwright install chromium` ou indique `CHROMIUM_PATH`. `BASE_URL` permite testar outro endereço local.

Não há script de lint; a verificação de tipos é estrita e a formatação pode ser conferida com `npm run format:check`.

## Telas

| Tela | Rota |
| --- | --- |
| Raio-X do hospital | /#/raio-x |
| Visão geral regional | /#/visao-geral |
| Hospitais | /#/hospitais |
| Controle de acesso | /#/controle-acesso |
| Vigilância | /#/vigilancia |
| Câmeras | /#/cameras |
| Alarmes | /#/alarmes |
| Custos | /#/custos |
| Atualização | /#/atualizacao |

HashRouter permite servir a aplicação em hospedagem estática sem rotas no servidor. Rotas desconhecidas apresentam uma página de retorno.

## Organização

- `src/types`: entidades tipadas e modalidades de cobrança.
- `src/data/demo.ts`: regionais, hospitais, unidades, inventário e cenários mensais.
- `src/state`: Context API, reducer imutável, seleção de hospital/regional/competência e eventos da sessão.
- `src/utils/calculations.ts`: quantitativos, cálculos em centavos, validação e formatação.
- `src/components`: layout, campos, cards, tabelas ordenáveis/paginadas, modais, editor, ações e gráficos SVG.
- `src/pages`: telas da aplicação.
- `src/styles/app.css`: tokens, composição das telas e responsividade.
- `tests`: regras de cálculo, integridade de alterações e fluxos do navegador.
- `docs/REFERENCIAS.md`: inventário visual, diferenças e tratamento dos dados das imagens.

## Funcionalidades locais

Seleção regional e hospitalar; manutenção do hospital entre seções; competência mensal; busca global e por tabela; filtros; ordenação; paginação; cadastro de hospital e setor; inclusão e edição de postos, câmeras e alarmes; confirmação de inativação e reativação; cancelamento; validação; revisão da alteração; atualização imediata de indicadores; comparação mensal; memória de cálculo; linha do tempo da sessão; menu móvel, diálogos com foco e suporte a teclado.

## Regras financeiras

- Por posto ou unidade: quantidade × valor unitário.
- Por hora: quantidade de postos × horas mensais por posto × valor horário.
- Mensalidade fixa: valor total do registro, sem multiplicação por quantidade.
- Inativos não somam quantitativos nem custos. Manutenção mantém a cobrança contratual.
- Médias por posto são indicadores calculados; não substituem a regra individual de cobrança.
- Alterações em um mês não alteram os outros meses nem outro hospital.
- Não há cálculo de efetivo profissional a partir de postos.

## Limites desta etapa

Sem banco de dados, backend de persistência, login real, Google Sheets, Google Drive, sincronização, planos de ação ou monitoramento ao vivo. Não há armazenamento em localStorage. A consulta anterior ao Drive foi utilizada somente para obter as referências durante o desenvolvimento.

As tabelas podem rolar horizontalmente no celular para preservar as informações. A identidade textual e os espaços de imagem devem ser substituídos pelos arquivos institucionais originais quando disponibilizados. A fidelidade visual não é pixel a pixel; consulte a documentação de referências.

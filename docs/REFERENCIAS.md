# Referências visuais e decisões

As oito imagens do Drive foram abertas e analisadas. Todas têm 1672 × 941 pixels (aproximadamente 16:9).

| Imagem | Rota | Elementos específicos |
| --- | --- | --- |
| RAIO X.png | /#/raio-x | Faixa do hospital, sete cards, resumo, detalhamento, valores, custos e atualizações |
| VISÃO GERAL.png | /#/visao-geral | Seleção regional, sete indicadores, rosca, resumo regional, hospitais e ranking |
| HOSPITAIS.png | /#/hospitais | Busca, filtros, cadastro e tabela de hospitais |
| CONTROLE DE ACESSO.png | /#/controle-acesso | Filtros antes dos cards, postos por turno e resumo financeiro |
| VIGILANCIA.png | /#/vigilancia | Cards, filtros, tabela de postos, resumo financeiro e gráfico por turno |
| CAMERAS.png | /#/cameras | Identificação da unidade, cards, inventário, retenção, setores e custos |
| ALARMES.png | /#/alarmes | Cards operacionais, filtros, sistemas, resumo e custos por tipo |
| CUSTOS.png | /#/custos | Competência, comparação, categoria, hospital, custos, evolução e detalhamento |
| Sem imagem específica | /#/atualizacao | Mesmo design system, formulário e registros da unidade |

## Elementos compartilhados

Sidebar azul-marinho de 255px, cabeçalho de 60px, fundo azul muito claro, cards brancos, bordas suaves, raios de 6–9px, títulos azul-escuros e seleção azul-vivo. Ícones Lucide próximos das referências; tabelas de alta densidade; filtros alinhados; números em BRL. Tokens e regras responsivas estão em `src/styles/app.css`.

Paleta aproximada por inspeção visual: sidebar #06264a; títulos #061047; destaque #0076ff; fundo #f6faff; cards #ffffff; bordas #e0ebf6; texto auxiliar #54719b. Roboto foi escolhida por aproximação visual; o arquivo/família original não foi fornecido. Fontes são empacotadas localmente.

## Limitações visuais reconhecidas

- Não foram recebidos arquivos originais dos logotipos e fotografias. Os espaços usam identificação textual e um símbolo neutro de edifício; não há recriação do logotipo oficial.
- Ícones, fonte, algumas larguras e alturas de tabelas não são idênticos às imagens. Não se declara correspondência pixel a pixel.
- Foram acrescentados controles reais de inclusão, edição, inativação, seleção de hospital e avisos discretos de demonstração.
- Paginação, conteúdo adicional de memória de cálculo e variação no número de registros tornam algumas telas mais longas que as referências.
- A linha do tempo registra apenas alterações realizadas nesta sessão. Não contém eventos fictícios apresentados como histórico real.

## Consistência dos números

Os dados das imagens não reconciliam entre si. Por exemplo, o total de R$ 904.800,00 mostrado em Custos não inclui os R$ 30.100,00 de câmeras e R$ 20.100,00 de alarmes também exibidos na mesma tela. A referência de Alarmes soma R$ 18.100,00 nas seis linhas, mas informa R$ 20.100,00 no total.

A implementação calcula todos os totais a partir dos registros locais. No exemplo principal são 20 postos de acesso (12 diurnos e 8 noturnos), 30 de vigilância (18 diurnos e 12 noturnos), 86 câmeras (82 operacionais) e 6 sistemas de alarme. Valores financeiros são ilustrativos e coerentes com as regras de cobrança. Sistemas de alarme são contados separadamente dos sensores.

Os cinco meses anteriores são cenários sintéticos, derivados de fatores declarados em `src/data/demo.ts`, exclusivamente para demonstrar seleção e comparação de competências. Não representam histórico oficial. As alterações afetam apenas a competência selecionada.

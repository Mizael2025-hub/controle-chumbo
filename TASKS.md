# TASKS.md — Tarefa Atual

> **Regra:** uma tarefa por vez. Ao concluir, mova para Histórico e escreva a próxima.

---

## ▶️ TAREFA ATUAL

### Título
Supabase Fase D — migrations, auth real, RLS

### Objetivo
Migrar de `DATA_SOURCE=local` para Supabase: migrations SQL, login real, repositories `.supabase.ts`, RLS por role e sync outbox.

### Referências
- `docs/DATABASE.md`, `docs/DEV_MODE.md`, `docs/SECURITY.md`

---

## ⏸️ PRÓXIMAS TAREFAS (Backlog)

_(nenhuma — Fase B concluída; próximo marco = Fase D)_
---

## ✅ HISTÓRICO DE TAREFAS CONCLUÍDAS

| Data | Tarefa | Arquivos |
|---|---|---|
| 2026-06-05 | UI/UX navegação + modais | modal-actions, InicioLink, headers padronizados, estoque sem atalhos |
| 2026-06-05 | Melhorias Relatórios | filtros cascata, resumo kg/barras, obs vendas, card consumo |
| 2026-06-05 | Relatórios (Fase B t9) | relatorio-repository/service/actions/client, /relatorios, filtros URL+store, CSV |
| 2026-06-04 | Fase PWA: reset DB, estoque unificado, contagem | reset-dados-operacionais, estoque-view, contagem-estoque, contextual-action-bar |
| 2026-06-04 | UX mobile + consumo + split mover | contextual-action-bar, grade-scroll, estoque-celula, monte split, /consumo, historico monte |
| 2026-06-03 | Saída (Fase B t8) | saida-repository/service/actions/client, /saida, calcular-status-pos-estorno |
| 2026-06-03 | Cadastro modelos grade | polaridade, placas_por_grade, modelos-panel, Dexie v2, BUSINESS_RULES §6 |
| 2026-06-03 | Entrada (Fase B t7) | entrada-repository/service/actions/client, validar-grade-entrada, UI /entrada |
| 2026-06-02 | Fase A — Documentação | docs/, AGENTS.md, PROJECT_MAP.md |
| 2026-06-02 | Scaffold (Fase B t1) | Next.js, deps, PWA, tokens iOS |
| 2026-06-02 | Infra (Fase B t2) | data-source, auth mock, date-time, errors |
| 2026-06-02 | Offline (Fase B t3) | Dexie PT-BR, outbox, LoginGate, HeaderSyncStatus, /api/sync |
| 2026-06-02 | Cadastros base (Fase B t4) | repositories, services, actions, UI /configuracoes/cadastros |
| 2026-06-02 | Estoque visualização (Fase B t5) | Liga→Lotes→grade, saldos derivados, /estoque |
| 2026-06-02 | Operações monte (Fase B t6) | reserva, baixa, mover, devolver, DnD grade |

---

## 📋 SESSÕES DE TRABALHO

### Sessão 2026-06-05 (UI/UX navegação + modais)
- **Objetivo:** Espaçamento rodapé modais, padronizar link Início, remover atalhos do estoque
- **Concluído:** `.modal-actions` em 11 modais, `InicioLink`, headers Contagem/Consumo/Relatórios/Entrada
- **Pendente:** Supabase Fase D
- **Problemas encontrados:** nenhum

### Sessão 2026-06-05 (Melhorias Relatórios)
- **Objetivo:** Filtros cascata, card resumo, observação vendas, ajustes UI consumo/entrada
- **Concluído:** popup filtros 6 dimensões, resumo reativo, obs em saídas, CSV filtrado
- **Pendente:** Supabase Fase D
- **Problemas encontrados:** nenhum

### Sessão 2026-06-05 (Relatórios — Fase B encerrada)
- **Objetivo:** Relatórios com filtros persistentes, drill-down e export CSV
- **Concluído:** `/relatorios` 4 abas, Zustand+URL, CSV admin, redirect `/estoque/historico`
- **Pendente:** Supabase Fase D
- **Problemas encontrados:** nenhum

### Sessão 2026-06-04 (Fase PWA auditoria + estoque unificado)
- **Objetivo:** Reset operacional, unificar saída no estoque, visual grade, barra ações, contagem física
- **Concluído:** reset Dexie/SQL, /saida→/estoque, EstoqueView seleção+dropdown, contagem Dexie v4
- **Pendente:** Relatórios (próximo backlog)
- **Problemas encontrados:** nenhum

# TASKS.md — Tarefa Atual

> **Regra:** uma tarefa por vez. Ao concluir, mova para Histórico e escreva a próxima.

---

## ▶️ TAREFA ATUAL

**Validar correções pós-migração** — reproduzir fluxos em produção após deploy:
1. Vercel: confirmar `DATA_SOURCE=supabase` e `NEXT_PUBLIC_DATA_SOURCE=supabase` (valores exatos, rebuild)
2. Supabase: aplicar `202606110002_grants_authenticated.sql` (histórico remoto divergente — SQL manual se `db push` falhar)
3. Estoque: reservar monte → borda azul visível → menu **Cancelar reserva** (não “Reserva”)
4. Relatórios: abas Entradas / Saídas / Reservas / Consumo carregam sem erro

---

## ⏸️ PRÓXIMAS TAREFAS (Backlog)

1. **RLS por role** — migration `202606020007_rls_roles.sql` (endurecimento opcional pós-MVP)
2. **Auth Supabase produção** — habilitar Leaked Password Protection no Dashboard
3. **Redirect URLs Vercel** — confirmar Site URL após deploy final
4. **Performance média** — imports condicionais Dexie, N+1 relatórios, staleTime cadastros

> **Backup navegação:** tag Git `restore/pre-nav-2026-06-05` — ver `RESTORE.md`

---

## ✅ HISTÓRICO DE TAREFAS CONCLUÍDAS

| Data | Tarefa | Arquivos |
|---|---|---|
| 2026-06-11 | Fix pós-migração: cancelar reserva no menu, visual reservado, grants authenticated, debug relatório/estoque | monte-elegivel-operacao.ts, saida-acoes-painel.tsx, estoque-celula-monte.tsx, relatorio/estoque/monte-actions.ts, relatorios-view.tsx, 202606110002_grants_authenticated.sql, TASKS.md, PROJECT_MAP.md |
| 2026-06-11 | Fix sort_order setor + perf middleware/Dexie + grants service_role | format-number.ts, cadastro-actions.ts, cadastro-repository.supabase.ts, repository-utils.ts, cadastro-client.ts, middleware.ts, 202606110001_grants_service_role.sql, TASKS.md, PROJECT_MAP.md |
| 2026-06-09 | Fix cadastro setor + performance auth/debug | get-session-context.ts, get-user.ts, get-user-role.ts, *-actions.ts, setores-panel.tsx, cadastro-service.ts, cadastro-actions.ts, agent-log.ts, layout.tsx, middleware.ts, TASKS.md, PROJECT_MAP.md |
| 2026-06-09 | Auditoria Supabase + CI/CD GitHub/Vercel | supabase/migrations/202606090001_security_functions.sql, .gitignore, TASKS.md, PROJECT_MAP.md |
| 2026-06-08 | Supabase Fase D — migrations, auth, repos, sync | supabase/migrations/*, reset_completo_projeto.sql, database.types.ts, *-repository.supabase.ts, auth-actions, /login, middleware, /api/sync, server-repositories |
| 2026-06-08 | Filtros relatório overlay cascata | modal-overlay.tsx, globals.css (backdrop nested) |
| 2026-06-08 | FIFO consumo por ordem de liberação | ordenar-montes-liberacao, consumo-repository.local, BUSINESS_RULES §3.6 |
| 2026-06-05 | Navegação web/mobile (sidebar + dock) | app-sidebar, app-tab-bar, nav-add-menu, nav-config, RESTORE.md |
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

### Sessão 2026-06-08 (Supabase Fase D)
- **Objetivo:** Migrations SQL, auth real, repositories `.supabase.ts`, RLS MVP, sync outbox
- **Concluído:** 7 migrations, reset SQL, types, 7 repos Supabase, `/login`, middleware, `/api/sync`, factories server/client separadas, services com `requireRepo`
- **Pendente (manual):** aplicar migrations no projeto remoto, seed admin, trocar `DATA_SOURCE=supabase` no `.env.local`
- **Problemas encontrados:** boundary client/server exigiu split `*-repositories.server.ts`; `useRepo` renomeado para `requireRepo` (ESLint hooks)

### Sessão 2026-06-05 (UI/UX navegação + modais)
- **Objetivo:** Espaçamento rodapé modais, padronizar link Início, remover atalhos do estoque
- **Concluído:** `.modal-actions` em 11 modais, `InicioLink`, headers Contagem/Consumo/Relatórios/Entrada
- **Problemas encontrados:** nenhum

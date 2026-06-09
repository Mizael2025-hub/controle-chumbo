# PROJECT_MAP.md — Mapa Vivo do Projeto

> Inventário planejado e status da construção. Identidade (nome, offline) em `AGENTS.md`.

---

## Informações do Projeto

- **Versão atual:** 0.14.1
- **Última atualização deste mapa:** 2026-06-09 (Fix cadastro setor + performance auth/debug)
- **DATA_SOURCE atual:** supabase (produção remota `ykuxfwxzizhrrgdmkvbk`)
- **Stack:** Next.js 16 + Dexie (local) | Supabase (produção) + Tailwind v4 + Design System iOS

---

## Status Geral

| Módulo | Status | Observação |
|--------|--------|------------|
| Documentação Fase A | ✅ Concluído | `docs/FASE_A_CHECKLIST.md` |
| Scaffold Next.js | ✅ Concluído | Next 16, deps, tokens iOS, PWA |
| Infra (factory, auth, errors, date-time) | ✅ Concluído | Factory local/server split; ActionResponse |
| Offline/PWA | ✅ Concluído | Dexie PT-BR, outbox, LoginGate, HeaderSyncStatus |
| Autenticação | ✅ Concluído | Mock local; `/login` + Supabase Auth quando `DATA_SOURCE=supabase` |
| Cadastros base | ✅ Concluído | 7 entidades; `/configuracoes/cadastros` |
| Estoque (grade) | ✅ Concluído | Liga → Lotes → grade; saldos derivados; leitura operador+admin |
| Operações monte | ✅ Concluído | reserva, baixa, mover, devolver, DnD (admin) |
| Entrada (lotes) | ✅ Concluído | `/entrada` 2 passos, grade 10×5, soma live (sem NF na UI) |
| Saída / liberação | ✅ Unificado | Ações no `/estoque` (admin); `/saida` redireciona |
| Contagem física (auditoria) | ✅ Concluído | `/estoque/contagem` rascunho Dexie v4 |
| Consumo | ✅ Concluído | `/consumo` formulário + alocação automática |
| Relatórios | ✅ Concluído | `/relatorios` 4 abas, filtros cascata URL+store, resumo kg/barras, drill-down, CSV admin |
| Configurações / Admin | ✅ Parcial | cadastros + reset operacional + limpar dispositivo |
| Supabase produção | ✅ Ativo | Projeto `controle_chumbo` sa-east-1; RLS MVP; admin seedado |

**Legenda:** ✅ Concluído | 🔄 Em andamento | ⚠️ Com pendências | ⬜ Não iniciado

---

## Rotas Planejadas

| Rota | Status | Observação |
|------|--------|------------|
| `/` | ✅ | Infra + mock user + links estoque/entrada/cadastros |
| `/entrada` | ✅ | 2 passos: data/liga/lote → grade 10×5 + soma live (admin) |
| `/saida` | ✅ | Redirect → `/estoque` |
| `/estoque/contagem` | ✅ | Auditoria física; rascunho `contagem_estoque_linha` |
| `/consumo` | ✅ | Formulário consumo setor (operador + admin) |
| `/api/sync` | ✅ | UPSERT_ROW / DELETE_ROW via admin client (LWW) |
| `/login` | ✅ | Email/senha Supabase; middleware redireciona se não autenticado |
| `/configuracoes/cadastros` | ✅ | Hub + 7 sub-rotas CRUD |
| `/configuracoes/cadastros/ligas` | ✅ | Cor de liga (chave_cor) |
| `/configuracoes/cadastros/setores` | ✅ | slug auto (nome), tipo producao/saida_direta |
| `/configuracoes/cadastros/destinos` | ✅ | Seed VRLA, Óxido, Venda, Teleiras, Exportação |
| `/configuracoes/cadastros/maquinas` | ✅ | FK setor_id |
| `/configuracoes/cadastros/operadores` | ✅ | |
| `/configuracoes/cadastros/turnos` | ✅ | |
| `/configuracoes/cadastros/modelos` | ✅ | Grade: nome, polaridade, placas/grade, ordem; Dexie v2 |
| `/estoque` | ✅ | Grade + seleção admin + barra Ações (dropdown) + saldos flex-row |
| `/relatorios` | ✅ | 4 abas, filtros período+cascata URL+store, card resumo, CSV admin |
| `/estoque/historico` | ✅ | Redirect → `/relatorios?aba=saidas` |

---

## Offline / Dexie

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/offline/db.ts` | Dexie `controle-chumbo-offline` **v4** + `contagem_estoque_linha` |
| `src/lib/offline/reset-dados-operacionais.ts` | TRUNCATE operacional (preserva cadastros) |
| `src/lib/offline/outbox.ts` | Fila FIFO com UUID idempotency |
| `src/lib/offline/outbox-executor.ts` | Sync → `/api/sync` (só se `NEXT_PUBLIC_DATA_SOURCE=supabase`) |
| `src/lib/offline/clear-local-data.ts` | Limpeza total IndexedDB + cache + SW |
| `src/lib/offline/conflict-resolver.ts` | LWW por `updated_at` |

### Tabelas Dexie (PT-BR)

`usuarios`, `ligas`, `lotes`, `setores`, `maquinas`, `montes`, `destinos_saida`, `transacoes_saida`, `eventos_monte`, `operadores`, `turnos`, `modelos_produto`, `apontamentos_consumo`, `alocacoes_consumo`, `contagem_estoque_linha`, `outbox`

### Componentes offline

| Arquivo | Descrição |
|---------|-----------|
| `login-gate.tsx` | Bloqueia abertura sem internet |
| `header-sync-status.tsx` | Online / Sincronizando / Offline / Erro |
| `offline-sync-provider.tsx` | Sync a cada 30s + eventos rede |
| `app-providers.tsx` | LoginGate + QueryProvider + Sync + AppShellClient |

### Layout / navegação

| Arquivo | Descrição |
|---------|-----------|
| `app-shell-client.tsx` | Shell responsivo: `app-main-scroll` com rolagem limitada acima da dock |
| `app-sidebar.tsx` | Barra lateral teal fixa (desktop): Início, Estoque, +, Relatório, Config |
| `app-tab-bar.tsx` | Dock pílula flutuante em `#app-dock-root` (fora do overflow-hidden) |
| `nav-add-menu.tsx` | Menu "+" via portal; z-index `--z-mobile-modal` / `--z-mobile-modal-nested` |
| `nav-config.ts` | Fonte única de rotas, ícones e regras de visibilidade por role |
| `app-header.tsx` | Cabeçalho sticky mobile com link **Início** (`lg:hidden`) |
| `modal-overlay.tsx` | Portal `fixed` no `body`; cascata z-200/210; scroll lock com contador; backdrop nested mais escuro |
| `contextual-action-bar.tsx` | Barra de seleção; `z-index: --z-mobile-contextual` (acima da dock) |
| `inicio-link.tsx` | *(legado — removido das páginas; nav persistente substitui)* |
| `globals.css` | Tokens `--z-mobile-*`, `--dock-reserva`, `data-dock-visible`, `.mobile-sheet-card`, `.btn-modal-secondary`, `.mobile-page-card` |
| `layout.tsx` | `data-dock-visible` no `<body>` quando navegação ativa |
| `RESTORE.md` | Instruções para voltar ao tag `restore/pre-nav-2026-06-05` |

---

## Estoque (visualização)

| Camada | Arquivo | Descrição |
|--------|---------|-----------|
| Types | `lib/types/status-monte.ts` | Status DISPONIVEL, RESERVADO, PARCIAL, CONSUMIDO |
| Saldos | `lib/estoque/calcular-saldos.ts` | No estoque (almox) / reservado no estoque / no setor |
| Repositories | `repositories/estoque-repository*.ts` | Dados brutos ligas, lotes, montes |
| Factory | `lib/data-source/estoque-repositories.ts` | getEstoqueRepository + client local |
| Service | `services/estoque-service.ts` | VisaoEstoque + setores_por_id |
| Actions | `actions/estoque-actions.ts` | listarVisaoEstoqueAction |
| Client | `lib/estoque/estoque-client.ts` | Dexie no browser (local) |
| UI | `components/features/estoque/*`, `grade-scroll-container`, `app/estoque/page.tsx` | Tabs, seleção, `SaidaAcoesPainel`, estados visuais célula; cabeçalho com `InicioLink` (sem atalhos Contagem/Liberações) |
| UI | `components/ui/contextual-action-bar.tsx`, `acoes-dropdown-menu.tsx` | Limpar seleção + menu Ações para cima |

**Permissão:** `operador` leitura + sheet; `admin` seleção + 5 operações de saída/reserva na grade.

---

## Operações monte

| Camada | Arquivo | Descrição |
|--------|---------|-----------|
| Types | `lib/types/tipo-evento-monte.ts` | RESERVA, CANCELAMENTO_RESERVA, MOVIDO_PARA_SETOR, DEVOLVIDO_ALMOXARIFADO |
| Baixa | `lib/monte/calcular-baixa.ts` | Peso proporcional por barras |
| Validations | `validations/monte/monte-schema.ts` | Zod para 6 operações |
| Repositories | `repositories/monte-repository*.ts` | montes, eventos_monte, transacoes_saida |
| Service | `services/monte-service.ts` | Regras BUSINESS_RULES §3.3–3.5 |
| Actions | `actions/monte-actions.ts` | Server actions |
| Client | `lib/monte/monte-client.ts` | Dexie no browser (local) |
| UI | `monte-detalhe-sheet`, `monte-acoes-modais`, `estoque-grade` DnD | Modais + arrastar células |

---

## Cadastros base

| Camada | Arquivo | Descrição |
|--------|---------|-----------|
| Types | `lib/types/chave-cor-liga.ts`, `setor-tipo.ts` | Enums de domínio |
| Validations | `validations/cadastros/cadastro-schema.ts` | Zod PT-BR |
| Repositories | `repositories/cadastro-repository*.ts` | Dexie local + Supabase implementado |
| Factory | `lib/data-source/cadastro-repositories.ts` | getXxxRepository + client local |
| Service | `services/cadastro-service.ts` | Regras + admin + seed destinos |
| Actions | `actions/cadastro-actions.ts` | Server actions via `server-repositories` |
| Client | `lib/cadastros/cadastro-client.ts` | Dexie no browser (DATA_SOURCE=local) |
| UI | `components/features/cadastros/*` | Hub + painéis CRUD iOS |
| Modelos | `modelos-panel.tsx` | Grade: polaridade, placas_por_grade, unicidade nome+polaridade |
| Types | `lib/types/polaridade-modelo.ts`, `tipo-produto-modelo.ts` | Enums de domínio |
| Seed | `lib/cadastros/seed-destinos.ts` | VRLA, Óxido, Venda, Teleiras, Exportação |

**Permissão:** somente `admin` (PCP). Operador vê tela de acesso negado.

---

## Entrada (lotes + grade)

| Camada | Arquivo | Descrição |
|--------|---------|-----------|
| Validação grade | `lib/entrada/validar-grade-entrada.ts` | Soma pilhas, duplicatas, conferência vs iniciais |
| Validations | `validations/entrada/entrada-schema.ts` | Zod criar lote + células |
| Repositories | `repositories/entrada-repository*.ts` | Transação Dexie lote + montes |
| Factory | `lib/data-source/entrada-repositories.ts` | getEntradaRepository + client local |
| Service | `services/entrada-service.ts` | Admin, UNIQUE número/liga, data não futura |
| Actions | `actions/entrada-actions.ts` | criarEntradaAction |
| Client | `lib/entrada/entrada-client.ts` | Dexie no browser (local) |
| Constantes grade | `lib/entrada/grade-entrada-constants.ts` | 10 colunas × 5 linhas fixo na entrada |
| UI | `components/features/entrada/*`, `app/entrada/page.tsx` | 2 passos, painel soma da grade em tempo real; `InicioLink` no cabeçalho |

**Permissão:** somente `admin` (PCP).

---

## Saída (liberação agrupada + estorno)

| Camada | Arquivo | Descrição |
|--------|---------|-----------|
| Status pós-estorno | `lib/monte/calcular-status-pos-estorno.ts` | Recalcula DISPONIVEL/PARCIAL/RESERVADO |
| Validations | `validations/saida/saida-schema.ts` | Zod baixaAgrupada (+ setor_id, observacao) + estornar |
| Elegibilidade | `lib/saida/monte-elegivel-operacao.ts` | Regras por tipo de operação |
| Repositories | `repositories/saida-repository*.ts` | Transação Dexie atômica; listagem transacoes_saida |
| Factory | `lib/data-source/saida-repositories.ts` | getSaidaRepository + client local |
| Service | `services/saida-service.ts` | baixaAgrupada, estornar, listar liberações |
| Actions | `actions/saida-actions.ts` | Server actions |
| Client | `lib/saida/saida-client.ts` | Dexie no browser (local) |
| UI | `saida-nova-liberacao`, `saida-grade-selecao`, `saida-acoes-painel`, `monte-historico-modal` | ContextualActionBar + ícones + histórico monte |

---

## Consumo (apontamento diário)

| Camada | Arquivo | Descrição |
|--------|---------|-----------|
| Alocação | `lib/consumo/alocar-barras.ts` | Distribui barras entre montes do setor |
| Ordenação FIFO | `lib/consumo/ordenar-montes-liberacao.ts` | Consumo automático por `movido_setor_em` |
| Validations | `validations/consumo/consumo-schema.ts` | Zod criar + listar lotes |
| Repositories | `repositories/consumo-repository*.ts` | Dexie apontamento + alocações |
| Factory | `lib/data-source/consumo-repositories.ts` | getConsumoRepository |
| Service | `services/consumo-service.ts` | Regras §3.6, saldo setor |
| Actions | `actions/consumo-actions.ts` | Server actions |
| Client | `lib/consumo/consumo-client.ts` | Dexie browser |
| UI | `components/features/consumo/consumo-form.tsx`, `app/consumo/page.tsx` | Formulário mobile-first; `InicioLink` no cabeçalho |

**Permissão:** `operador` e `admin`.

> Saída/liberação: somente `admin` — ver seção Saída abaixo.

---

## Relatórios

| Camada | Arquivo | Descrição |
|--------|---------|-----------|
| Validations | `validations/relatorio/relatorio-schema.ts` | Zod aba + período (default 7 dias) + filtros multiselect URL |
| Store | `stores/relatorio-filtros-store.ts` | Zustand filtros (período + cascata) |
| Hook | `hooks/use-relatorio-filtros.ts` | Sync URL ↔ store |
| Lib | `lib/relatorio/filtros-relatorio.ts` | Cascata, totais, filtrar resultado |
| Lib | `lib/saida/atualizar-grupo-liberacao-view.ts` | Metadados grupo saída (obs, liga, setor) |
| Repositories | `repositories/relatorio-repository*.ts` | Consultas por período Dexie |
| Factory | `lib/data-source/relatorio-repositories.ts` | getRelatorioRepository |
| Service | `services/relatorio-service.ts` | 4 abas, detalhes, CSV UTF-8 `;` com filtros |
| Actions | `actions/relatorio-actions.ts` | Server actions |
| Client | `lib/relatorio/relatorio-client.ts` | Dexie no browser (local) |
| UI | `components/features/relatorios/*`, `app/relatorios/page.tsx` | Abas, filtros sheet + modais categoria, resumo, drill-down; `InicioLink` no cabeçalho |

**Permissão:** `operador` e `admin` leem; export CSV e estorno na aba Saídas somente `admin`.

**Filtros cascata (por aba, multiselect):** entradas (liga); saídas (destino, liga, setor); consumo (setor, máquina, operador, liga, turno). Reservas: só período no menu Filtros.

**Período padrão:** últimos 7 dias (alterável apenas no menu Filtros).

**UI extra:** card resumo peso/barras (entradas, saídas, consumo); observação em vendas no card de saída.

---

## Server Actions

| Arquivo | Status |
|---------|--------|
| `auth-actions.ts` | ✅ login/logout Supabase + mock local |
| `local-data-actions.ts` | ✅ autorização admin limpeza |
| `cadastro-actions.ts` | ✅ CRUD 7 entidades cadastro |
| `estoque-actions.ts` | ✅ listar visão estoque |
| `monte-actions.ts` | ✅ reserva, baixa, mover (split), devolver, trocar posição, histórico |
| `entrada-actions.ts` | ✅ criar lote + grade inicial |
| `saida-actions.ts` | ✅ baixa agrupada, listar liberações, estornar |
| `consumo-actions.ts` | ✅ criar apontamento, listar lotes setor |
| `relatorio-actions.ts` | ✅ consultar, exportar CSV, detalhes entrada/consumo |

---

## Supabase (Fase D)

| Camada | Arquivo | Descrição |
|--------|---------|-----------|
| Reset | `supabase/scripts/reset_completo_projeto.sql` | DROP SCHEMA public (rodar uma vez no projeto reutilizado) |
| Migrations | `supabase/migrations/202606020001` … `008` | schema core, cadastros, consumo, usuarios, triggers, RLS MVP, seed destinos |
| Types | `src/lib/supabase/database.types.ts` | Tipos Postgres (manual; regenerar após deploy) |
| Admin | `src/lib/supabase/admin.ts` | Client service_role (server-only) |
| Utils | `src/lib/supabase/repository-utils.ts` | Helpers mapeamento row ↔ domínio |
| Sync | `src/lib/supabase/sync-handler.ts` | UPSERT_ROW / DELETE_ROW com LWW |
| Auth | `src/lib/auth/get-session-context.ts`, `get-user.ts`, `get-user-role.ts` | `React.cache()` — uma chamada auth+perfil por request; `getActionContext()` para server actions |
| Middleware | `src/middleware.ts` | Protege rotas quando `DATA_SOURCE=supabase` |
| Login | `src/app/login/page.tsx`, `auth-actions.ts` | Formulário email/senha iOS |
| API | `src/app/api/sync/route.ts` | Despacho outbox offline |
| Repositories | `src/repositories/*-repository.supabase.ts` | 7 implementações (cadastro, estoque, monte, entrada, saída, consumo, relatório) |
| Factory client | `src/lib/data-source/*-repositories.ts` | Exports locais (client-safe) |
| Dispatch | `src/lib/data-source/client-dispatch.ts` | `*-client.ts` → Dexie (local) ou server actions (supabase) |
| Factory server | `src/lib/data-source/*-repositories.server.ts` | Getters Supabase com `server-only` |
| Re-export | `src/lib/data-source/server-repositories.ts` | Import central para actions |

**RLS MVP:** qualquer usuário `authenticated` tem acesso total (pool da fábrica). Endurecimento por role (`202606020007_rls_roles.sql`) adiado.

**Deploy manual:** reset SQL → migrations na ordem → criar usuário Auth → `INSERT INTO usuarios` → `.env.local` com keys → `DATA_SOURCE=supabase`.

---

## Variáveis de Ambiente

```bash
DATA_SOURCE=local                    # ou supabase após deploy
NEXT_PUBLIC_DATA_SOURCE=local        # espelho client — deve ser igual
NEXT_PUBLIC_APP_TIMEZONE=America/Sao_Paulo

# Supabase (quando DATA_SOURCE=supabase)
NEXT_PUBLIC_SUPABASE_URL=https://[projeto].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...              # server-only
```

> Sync/outbox no browser só ativa quando ambos = `supabase`.

---

## Decisões Técnicas

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-06-02 | `NEXT_PUBLIC_DATA_SOURCE` espelha `DATA_SOURCE` | Client precisa saber se sync ativo |
| 2026-06-02 | Outbox/sync desligado em `local` | DEV_MODE.md |
| 2026-06-02 | Zustand `sync-status-store` | HeaderSyncStatus + provider |
| 2026-06-02 | LoginGate no layout raiz | Internet obrigatória na abertura |
| 2026-06-02 | `cadastroClient` no browser | Dexie/IndexedDB só no client em modo local |
| 2026-06-02 | Seed destinos na primeira listagem | ENTREVISTA_PROJETO.md §3 |
| 2026-06-09 | `getSessionContext` com `React.cache()` | Reduz chamadas duplicadas auth/usuarios por page view |
| 2026-06-09 | Debug desligado em produção | `agentLog` no-op; `MobileDebugProbe` só dev; `api/debug-log` fora do middleware |
| 2026-06-09 | Slug setor inativo liberado | `garantirSlugUnicoSetor` ignora `is_active=false` |
| 2026-06-08 | Split `*-repositories.server.ts` | Evitar import de `server-only` em clients offline |
| 2026-06-08 | Services com `requireRepo()` | Repositório injetado por action (server) ou client (local) |
| 2026-06-05 | `InicioLink` + `.modal-actions` | Navegação padronizada; respiro nos rodapés de modais |
| 2026-06-05 | Atalhos Contagem/Liberações removidos do `/estoque` | Acesso via home (`/`) |

---

## Backlog

✅ **Fase B concluída** | ✅ **Fase D código concluída** — próximo: deploy manual Supabase + RLS por role (opcional)

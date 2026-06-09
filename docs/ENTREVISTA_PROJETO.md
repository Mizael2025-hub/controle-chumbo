# ENTREVISTA_PROJETO.md — Contexto do Controle de Chumbo

> **Objetivo:** registrar decisões de produto antes do código.  
> **Status:** Fase A — **validado e sincronizado** com `BUSINESS_RULES.md` (2026-06-02).  
> **Canônico:** `docs/BUSINESS_RULES.md` + `docs/DATABASE.md` + `AGENTS.md`.

---

## Decisões já confirmadas (não reabrir sem motivo)

| # | Tema | Decisão |
|---|------|---------|
| D1 | Nomenclatura do banco | PT-BR `snake_case` sem acento |
| D2 | Escopo do app | Módulo isolado (só chumbo) |
| D3 | Migração de dados | Não — banco vazio |
| D4 | Destino de liberação/saída | Lista cadastrável (`destinos_saida`) |
| D5 | Offline | Sim — login exige internet; operação offline depois |
| D6 | DATA_SOURCE inicial | `local` (Dexie) até aprovação para Supabase |
| D7 | Perfis na fábrica | **Operador de setor** = role `operador` (só consumo + leitura); **PCP** = role `admin` (tudo) |
| D8 | Role `supervisor` | No schema; **não usado no MVP** |

---

## 1. Identidade e uso

| Pergunta | Resposta registrada | Ref. doc | Validação |
|----------|---------------------|----------|-----------|
| Nome oficial do app | **Controle de Chumbo** | `AGENTS.md` | ☑ OK |
| Descrição em uma frase | Sistema offline-first que espelha montes em grade 2D, controla kg/barras, consumo diário e auditoria na fábrica | `AGENTS.md` | ☑ OK |
| Quem usa no dia a dia | **PCP** (estoque, reserva, baixa, estorno, cadastros, ajustes, usuários) — login `admin`. **Operador de setor** (consumo) — login `operador`. | `BUSINESS_RULES.md` §1 | ☑ OK |
| Dispositivo principal | Tablet **1200×1920 px** (chão de fábrica); celular secundário (375px); desktop para relatórios/gestão PCP | `BUSINESS_RULES.md` §4 | ☑ OK |
| Usuários simultâneos | **3 a 8** tablets, mesmo estoque compartilhado | `BUSINESS_RULES.md` §1 | ☑ OK |

---

## 2. Grade e espelho físico

| Pergunta | Resposta registrada | Ref. doc | Validação |
|----------|---------------------|----------|-----------|
| Tamanho máximo da grade | **10 colunas × 5 linhas** (x 0–9, y 0–4) | `DATABASE.md` → `montes` | ☑ OK |
| Tamanho típico | **5×3 a 7×4** por lote | `BUSINESS_RULES.md` §3 | ☑ OK |
| Células vazias na grade | Sim — slots vazios sem registro `montes` | `BUSINESS_RULES.md` §3 | ☑ OK |
| Drag-and-drop no MVP | Sim — atualiza `posicao_x` / `posicao_y` | `FLUXOS_EXEMPLO.md` | ☑ OK |
| Swap entre dois montes | Sim — mesmo lote | `BUSINESS_RULES.md` §3 | ☑ OK |

---

## 3. Destinos e setores

| Pergunta | Resposta registrada | Ref. doc | Validação |
|----------|---------------------|----------|-----------|
| `destinos_saida` vs `setores` | Cadastros separados | `DATABASE.md` | ☑ OK |
| Seed `destinos_saida` | VRLA, Óxido, Venda, Teleiras, Exportação | `BUSINESS_RULES.md` §2 | ☑ OK |
| Tipos de setor | `producao`, `saida_direta` | `DATABASE.md` | ☑ OK |
| Reserva de monte | `setor_reserva_id` + `reservado_para` opcional | `DATABASE.md` | ☑ OK |

---

## 4. Consumo diário

| Pergunta | Resposta registrada | Ref. doc | Validação |
|----------|---------------------|----------|-----------|
| Montes elegíveis | `localizacao = setor`, mesma liga, `barras_atuais > 0`, `status ≠ CONSUMIDO` | `BUSINESS_RULES.md` §3 | ☑ OK |
| Modo automático | Ordem `movido_setor_em` asc (FIFO liberação) | `FLUXOS_EXEMPLO.md` | ☑ OK |
| Modo manual | Ordem escolhida pelo usuário | `BUSINESS_RULES.md` §3 | ☑ OK |
| Borra | Obrigatória (≥ 0) | `BUSINESS_RULES.md` §3 | ☑ OK |
| Editar/excluir apontamento | **Admin (PCP)** | `BUSINESS_RULES.md` §1 | ☑ OK |

---

## 5. Perfis e permissões

**Decisão final (2026-06-02):** operador = consumo + leitura; PCP = admin com acesso total; supervisor reservado no schema, sem uso no MVP.

| Pergunta | Resposta registrada | Ref. doc | Validação |
|----------|---------------------|----------|-----------|
| Opção MVP (RLS) | **A** — UI + services; RLS `authenticated`; Fase D endurece por role | `DATABASE.md` | ☑ OK |
| `operador` | Ver estoque (leitura), consumo, relatórios | `BUSINESS_RULES.md` §1 | ☑ OK |
| `admin` (PCP) | Estoque, reserva, baixa, mover, estorno, cadastros, consumo, CSV, usuários, ajuste crítico | `BUSINESS_RULES.md` §1 | ☑ OK |
| `supervisor` | Não usado no MVP | `BUSINESS_RULES.md` §1 | ☑ OK |
| Logins admin (PCP) | 2 a 3 | — | ☑ OK |

---

## 6. Auth e usuários

| Pergunta | Resposta registrada | Ref. doc | Validação |
|----------|---------------------|----------|-----------|
| Gestão de usuários | Tela **`/configuracoes/usuarios`** no MVP (admin) | `PROJECT_MAP.md` | ☑ OK |
| Cadastro público | Não | `SECURITY.md` | ☑ OK |
| Timeout inatividade | **30 minutos** | `BUSINESS_RULES.md` §4 | ☑ OK |
| Modo local | Usuário mock com `role` configurável | `DEV_MODE.md` | ☑ OK |

---

## 7. Relatórios

| Pergunta | Resposta registrada | Ref. doc | Validação |
|----------|---------------------|----------|-----------|
| Período padrão | Mês corrente | `BUSINESS_RULES.md` §4 | ☑ OK |
| Filtros persistentes | Sim (URL + store) | `BUSINESS_RULES.md` §4 | ☑ OK |
| Export CSV | **Sim, no MVP** (admin) | `BUSINESS_RULES.md` §4 | ☑ OK |
| Export PDF | Pós-MVP | `PROJECT_MAP.md` | ☑ OK |
| Abas | Entradas, Saídas, Reservas/eventos, Consumo | `BUSINESS_RULES.md` §2 | ☑ OK |

---

## 8. Fora do escopo (MVP)

| Item | Decisão |
|------|---------|
| Integração ERP | Fora |
| Outros módulos PCP | Fora |
| Fotos/anexos por monte | Fora |
| Migração legado | Fora |
| QR Code / etiquetas | Fora |

---

## 9. Sincronização multi-dispositivo

| Pergunta | Resposta | Validação |
|----------|----------|-----------|
| Conflito | LWW por `updated_at` | ☑ OK |
| Fila | Outbox FIFO (`sync_outbox`) | ☑ OK |
| IDs | UUID v4 no cliente | ☑ OK |
| Estoque | Compartilhado (sem RLS por usuário nos dados) | ☑ OK |

---

## Histórico da entrevista

| Data | Evento |
|------|--------|
| 2026-06-02 | Entrevista criada; decisões iniciais (PT-BR, offline, destinos cadastráveis) |
| 2026-06-02 | Sync final: perfis operador/admin (PCP), tablet 1200px, timeout 30 min, CSV MVP, tela usuários |

---

## Próximo passo

Confirmar em [`docs/FASE_A_CHECKLIST.md`](FASE_A_CHECKLIST.md) e iniciar Fase B (Scaffold).

# FASE_A_CHECKLIST.md — Validação antes do código

> **Gate obrigatório:** nenhum scaffold Next.js (`BOOTSTRAP.md` §3) até o responsável confirmar abaixo.

**Data da documentação:** 2026-06-02  
**Última sync:** 2026-06-02 — perfis operador/admin (PCP), tablet 1200px, timeout 30 min, CSV MVP, tela usuários.

---

## Documentos gerados na Fase A

| Documento | Conteúdo | Revisado? |
|-----------|----------|-----------|
| [`docs/ENTREVISTA_PROJETO.md`](ENTREVISTA_PROJETO.md) | Perguntas e respostas de produto (sincronizado) | ☑ |
| [`AGENTS.md`](../AGENTS.md) | Identidade (nome, offline, DATA_SOURCE) | ☑ |
| [`docs/BUSINESS_RULES.md`](BUSINESS_RULES.md) | Regras, perfis, fluxos | ☑ |
| [`docs/DATABASE.md`](DATABASE.md) | Schema PT-BR, RLS, migrations | ☑ |
| [`PROJECT_MAP.md`](../PROJECT_MAP.md) | Módulos, rotas, backlog | ☑ |
| [`docs/FLUXOS_EXEMPLO.md`](FLUXOS_EXEMPLO.md) | Cenários ponta a ponta | ☑ |
| [`novo_projeto.md`](../novo_projeto.md) | Spec MVP + link para canônicos | ☑ |

---

## Decisões sincronizadas (referência rápida)

1. **Perfis:** `operador` = consumo + leitura; `admin` (PCP) = tudo; `supervisor` não usado no MVP.
2. **Tablet:** 1200×1920 px (primário).
3. **Timeout sessão:** 30 min.
4. **Relatórios:** export **CSV** no MVP (admin).
5. **Usuários:** tela `/configuracoes/usuarios` no MVP.

Detalhes: [`ENTREVISTA_PROJETO.md`](ENTREVISTA_PROJETO.md) decisões D7–D8.

---

## Critérios de aceite da Fase A

- [x] Nenhuma contradição entre `novo_projeto.md`, `BUSINESS_RULES.md` e `DATABASE.md`
- [x] Tabelas PT-BR cobrem todos os fluxos do MVP (§11 de `novo_projeto.md`)
- [x] Offline e multiusuário documentados
- [x] `PROJECT_MAP.md` lista rotas e backlog Fase B
- [x] Anotações da entrevista propagadas para docs canônicos
- [ ] Responsável assina abaixo *(opcional — pode aprovar no chat)*

---

## Aprovação

| Campo | Valor |
|-------|-------|
| Aprovado por | *(preencher ou confirmar no chat)* |
| Data | *(preencher)* |
| Observações | Fase A documental completa; pronto para Scaffold (TASKS.md backlog item 1) |

**Após aprovação:** mover backlog item 1 (Scaffold) para `TASKS.md` → TAREFA ATUAL.

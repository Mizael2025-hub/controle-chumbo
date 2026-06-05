# FLUXOS_EXEMPLO.md — Narrativas para validação

> Cenários de ponta a ponta em linguagem de negócio.  
> Implementação deve seguir `BUSINESS_RULES.md` e `DATABASE.md`.

---

## A — Reservar monte no almoxarifado

**Atores:** Maria (admin / PCP)  
**Pré-condição:** Lote `L-2024-15` com grade 5×3; monte na posição (2,1) com 1 200 kg e 48 barras, status `DISPONIVEL`.

1. Maria abre **Estoque** → liga **Liga 5** → expande lote `L-2024-15`.
2. Toca a célula (2,1). O sistema mostra detalhe do monte.
3. Escolhe **Reservar** → setor **Teleiras** (cadastro `setores`) → confirma.
4. **Resultado esperado:**
  - `status` → `RESERVADO`
  - `peso_atual_kg` e `barras_atuais` **inalterados** (1 200 / 48)
  - `setor_reserva_id` = Teleiras; `reservado_em` preenchido
  - Linha em `eventos_monte` com `tipo = RESERVA`
  - Cabeçalho do lote: **reservado** sobe; **disponível** desce; **no estoque** igual

**Cancelar reserva:** mesmo monte → **Cancelar reserva** → `DISPONIVEL`, campos de reserva limpos, evento `CANCELAMENTO_RESERVA`.

---

## B — Baixa parcial (liberação)

**Atores:** João (admin / PCP)  
**Pré-condição:** Monte (2,1) `DISPONIVEL`, 1 200 kg, 48 barras.

1. João toca o monte → **Liberar / Baixar**.
2. Destino: **VRLA** (`destinos_saida`). Informa **10 barras** (não o monte inteiro).
3. **Resultado esperado:**
  - `transacoes_saida` criada com `peso_baixado_kg` proporcional, `grupo_liberacao_id` se vários montes no mesmo modal
  - Monte permanece na posição (2,1); `status` → `PARCIAL`; barras e kg reduzidos
  - Nenhuma reorganização automática da grade

---

## C — Baixa total (CONSUMIDO na grade)

**Pré-condição:** Monte com 5 barras restantes.

1. Liberação total das 5 barras para destino **Óxido**.
2. **Resultado esperado:**
  - `status` → `CONSUMIDO`
  - `peso_atual_kg = 0`, `barras_atuais = 0`
  - Reserva limpa se existia
  - Célula (2,1) **continua visível** na grade (espelho/rastreio), estilo “consumido” na UI

---

## D — Mover monte para setor (sem baixa)

**Atores:** Admin (PCP)

1. PCP escolhe **Mover para setor** → **VRLA** (setor produção).
2. **Total:** `localizacao` → `setor`; saldo inalterado na célula da grade (visual esmaecido).
3. **Parcial:** reduz barras/peso no bloco da grade; cria monte filho no setor (`monte_origem_id`, posição virtual `x=99`); eventos em pai e filho.

**Devolver ao almoxarifado:** inverso → `localizacao = almoxarifado`, `setor_id` null, evento `DEVOLVIDO_ALMOXARIFADO`.

---

## E — Consumo automático no setor

**Atores:** Operador de setor (`operador`) ou PCP (`admin`)  
**Pré-condição:** Três montes no setor VRLA, liga 5, com barras (20, 15, 30). Apontamento: **20 barras**, borra **3 kg**.

1. **Consumo** → novo apontamento: data hoje, setor VRLA, máquina, operador, turno, liga 5, lote, modo **automático**.
2. Sistema ordena montes por `posicao_y`, `posicao_x` (dentro do setor/liga).
3. Aloca 20 barras (ex.: 15 do primeiro + 5 do segundo).
4. **Resultado esperado:**
  - `apontamentos_consumo` + linhas `alocacoes_consumo`
  - Montes atualizados; se algum zera → `CONSUMIDO`
  - Se faltasse 1 barra → erro **“Saldo insuficiente no setor”**, nada gravado

---

## F — Consumo manual

1. Mesmo apontamento, modo **manual**.
2. Usuário marca montes B e C na ordem desejada.
3. Sistema consome na ordem escolhida até completar barras.

---

## G — Editar consumo (admin / PCP)

**Pré-condição:** Apontamento de 20 barras já salvo.

1. Admin (PCP) altera para **25 barras**.
2. **Resultado esperado:**
  - Service **estorna** alocações antigas nos montes (reverte kg/barras)
  - Recalcula plano com 25 barras
  - Substitui `alocacoes_consumo`; `updated_at` do apontamento atualizado

Operador tentando editar → bloqueio na UI e erro no server.

---

## H — Estornar liberação

**Atores:** Admin (PCP)  
**Pré-condição:** `transacoes_saida` de baixa parcial existente.

1. Relatório **Saídas** → abre liberação → **Estornar**.
2. **Resultado esperado:**
  - Saldo do monte restaurado conforme transação
  - `estornada = true` na transação
  - Trilha: `estornada_por`, `estornada_em`

Operador de setor → ação não visível / erro de permissão.

---

## I — Drag-and-drop na grade

**Atores:** Admin (PCP)  
**Pré-condição:** Dois montes em (0,0) e (1,0).

1. PCP arrasta monte de (1,0) para (0,0) (swap).
2. **Resultado esperado:**
  - Apenas `posicao_x` / `posicao_y` trocados
  - kg/barras/status inalterados
  - `updated_at` atualizado para sync

---

## J — Offline e sincronização

**Dispositivo 1 (tablet A):**

1. Login **com Wi-Fi** → pull de ligas, lotes, montes, cadastros.
2. Wi-Fi cai. Reserva monte (2,1) → grava Dexie + entrada `sync_outbox`.
3. Toast: “Salvo no dispositivo. Será sincronizado ao reconectar.”

**Dispositivo 2 (tablet B):** online o tempo todo — após sync de A, vê a mesma reserva.

1. Wi-Fi volta em A → flush FIFO da outbox → Supabase.
2. Merge **LWW:** se B alterou o mesmo monte com `updated_at` maior no servidor, servidor prevalece no pull de A.

**Abertura sem internet:** tela de bloqueio (LoginGate) — não entra no app.

---

## K — Entrada de lote novo

1. **Entrada** → novo lote: número `L-2026-01`, data chegada 28/05/2026, totais iniciais 10 000 kg / 400 barras.
2. Define grade 6×2; preenche kg/barras por célula ocupada.
3. **Resultado esperado:**
  - `lotes` com `peso_inicial_kg` / `barras_iniciais` (auditoria)
  - N registros `montes` nas posições preenchidas
  - Soma dos montes = totais operacionais exibidos (pode diferir dos iniciais se conferência assimétrica — documentar na UI)

---

## L — Relatório com filtro persistente

1. Usuário abre **Relatórios**, período 01/05/2026–31/05/2026, aba **Consumo**.
2. Clica em um apontamento → detalhe → volta.
3. **Resultado esperado:** filtros 01/05–31/05 e aba Consumo **mantidos**.

---

## Checklist rápido de validação


| Fluxo            | OK? |
| ---------------- | --- |
| A Reserva        | ☑   |
| B Baixa parcial  | ☑   |
| C Baixa total    | ☑   |
| D Mover setor    | ☑   |
| E Consumo auto   | ☑   |
| F Consumo manual | ☑   |
| G Editar consumo | ☑   |
| H Estorno        | ☑   |
| I Drag-and-drop  | ☑   |
| J Offline        | ☑   |
| K Entrada lote   | ☑   |
| L Relatórios     | ☑   |



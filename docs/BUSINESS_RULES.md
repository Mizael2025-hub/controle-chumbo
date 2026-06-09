# BUSINESS_RULES.md — Regras de Negócio e Domínio

> O Cursor consulta este arquivo para entender regras de domínio que não estão no código.  
> **Fonte de produto:** `novo_projeto.md` + `docs/ENTREVISTA_PROJETO.md`.

---

## 1. Atores e Permissões

- **Quem usa na fábrica:**
  - **PCP** — equipe de planejamento/controle; usa login **`admin`** para estoque, cadastros, estornos e gestão.
  - **Operador de setor** — usa login **`operador`**; registra consumo diário e consulta estoque/relatórios (somente leitura no estoque).
- **Perfis de acesso (`usuarios.role`):** `operador`, `supervisor`, `admin` (tabela `usuarios`, vinculada a `auth.users`).
  - **`supervisor`:** reservado no schema; **não usado no MVP** (sem usuários iniciais).
- **Como as permissões são definidas:** role fixo por usuário; validação na **UI** (ocultar/desabilitar) e nos **services/actions** (bloqueio definitivo). RLS no Postgres: MVP = qualquer `authenticated` (estoque compartilhado); Fase D = políticas por role (ver `DATABASE.md`).
- **Estoque compartilhado:** todos os usuários autenticados da mesma fábrica veem o **mesmo** estoque e os mesmos relatórios. `created_by` serve só para auditoria, não para isolamento de dados.

| Ação | operador | supervisor | admin (PCP) |
|------|:--------:|:----------:|:-------------:|
| Ver estoque (grade, saldos) | sim (leitura) | — | sim |
| Ver relatórios | sim | — | sim |
| Registrar consumo diário | sim | — | sim |
| Reservar / cancelar reserva | não | — | sim |
| Baixa parcial/total (liberação) | não | — | sim |
| Mover monte para setor / devolver almoxarifado | não | — | sim |
| Estornar liberação | não | — | sim |
| Editar / excluir apontamento de consumo | não | — | sim |
| CRUD cadastros (ligas, setores, destinos, etc.) | não | — | sim |
| Ajuste crítico de lote/monte (correção manual) | não | — | sim |
| Gerir usuários no app (`/configuracoes/usuarios`) | não | — | sim |
| Limpar dados locais (IndexedDB) | não | — | sim |
| Exportar relatórios CSV | não | — | sim |

- **RLS no Supabase (resumo):** Fase construção/MVP — `authenticated` com acesso total às tabelas de negócio; Fase D — restringir DELETE e ajustes críticos por `get_user_role()`. Detalhes SQL em `DATABASE.md`.

---

## 2. Entidades Principais e Fluxos

- **Entidades principais:** `usuarios`, `ligas`, `lotes`, `montes`, `transacoes_saida`, `eventos_monte`, `destinos_saida`, `setores`, `maquinas`, `operadores`, `turnos`, `modelos_produto`, `apontamentos_consumo`, `alocacoes_consumo`.

- **Fluxos críticos:**
  1. **Entrada:** criar lote (número, data chegada, totais iniciais) → cadastrar grade de montes (kg/barras por posição).
  2. **Estoque:** navegar Liga → Lotes → grade 2D; ver saldos derivados das pilhas.
  3. **Reserva:** comprometer monte(s) sem alterar kg/barras; registrar evento.
  4. **Liberação/baixa:** parcial ou total; gera `transacoes_saida`; monte pode ficar `PARCIAL` ou `CONSUMIDO`.
  5. **Movimentação:** monte para setor ou devolução ao almoxarifado (não é baixa).
  6. **Consumo:** apontamento diário (barras + borra) → alocações por monte (automático ou manual).
  7. **Estorno:** reverter liberação (**admin**) com rastreabilidade (`transacoes_saida.estornada`).
  8. **Relatórios:** filtros por período com persistência; drill-down até registro origem; export CSV (**admin**).

- **Relações (resumo):**
  - `ligas` 1:N `lotes` 1:N `montes`
  - `montes` 1:N `transacoes_saida`, 1:N `eventos_monte`
  - `destinos_saida` 1:N `transacoes_saida`
  - `setores` 1:N `maquinas`; `setores` referenciados em `montes` e consumo
  - `apontamentos_consumo` 1:N `alocacoes_consumo` N:1 `montes`
  - Diagrama completo em `DATABASE.md`

---

## 3. Regras de Validação de Negócio

### 3.1 Fonte da verdade do estoque

- Saldo **operacional** do lote = soma das **pilhas** (`montes`), nunca os campos `peso_inicial_kg` / `barras_iniciais` do lote.
- Totais iniciais do lote são apenas **auditoria** (chegada do material).

| Métrica | Regra |
|---------|--------|
| **No estoque** | Σ `peso_atual_kg` / `barras_atuais` onde `status ≠ CONSUMIDO` |
| **Disponível** | Montes com saldo (`status ≠ CONSUMIDO`) **sem** reserva ativa: `status` ∉ `RESERVADO` ou reserva vazia (`reservado_para` e `setor_reserva_id` nulos) |
| **Reservado** | `status = RESERVADO` ou reserva ativa; kg/barras **inalterados** até baixa real |
| **Consistência** | No estoque = Disponível + Reservado (em kg e barras) |

### 3.2 Status do monte (`status`)

| Status | Significado |
|--------|-------------|
| `DISPONIVEL` | Livre para reserva/baixa |
| `RESERVADO` | Comprometido; ainda no chão com saldo intacto |
| `PARCIAL` | Já houve baixa parcial; permanece na mesma posição |
| `CONSUMIDO` | Baixa total; `peso_atual_kg = 0`, `barras_atuais = 0`; célula permanece na grade |

### 3.3 Reserva

- Reserva **não reduz** kg/barras.
- Deve registrar destino/setor (`setor_reserva_id` e/ou `reservado_para`) e `reservado_em`.
- Cancelamento gera evento `CANCELAMENTO_RESERVA` e limpa campos de reserva (ou mantém `PARCIAL` se já houve baixa parcial).
- Reserva em grupo: mesmo `grupo_reserva_id` para vários montes no mesmo envio.

### 3.4 Baixa (liberação / saída)

- Parcial: reduz kg/barras; `status` → `PARCIAL` (ou mantém `RESERVADO` se ainda reservado com saldo).
- Total: zera saldo; `status` → `CONSUMIDO`; limpar reserva.
- Gera `transacoes_saida` com `destino_saida_id`, data/hora, `grupo_liberacao_id` quando múltiplos montes no mesmo envio.
- **Não** reorganizar grade automaticamente; posição fixa até drag-and-drop manual.

### 3.5 Movimentação física

- `localizacao`: `almoxarifado` | `setor`.
- Mover para setor: preenche `setor_id`, `movido_setor_em`, evento `MOVIDO_PARA_SETOR`.
- Devolver: limpa `setor_id`, volta `almoxarifado`, evento `DEVOLVIDO_ALMOXARIFADO`.
- Movimentação **não** é baixa.

### 3.6 Consumo diário

- Informado em **barras**; `borra_kg` obrigatória (≥ 0).
- Montes elegíveis: `localizacao = setor`, `setor_id` = setor da máquina, liga/lote coerentes, `barras_atuais > 0`, `status ≠ CONSUMIDO`.
- Modo `automatico`: ordem `movido_setor_em` ascendente (FIFO de liberação — primeiro monte movido para o setor é consumido primeiro); consome até completar barras, podendo cruzar montes quando o anterior não tem saldo suficiente.
- Modo `manual`: ordem escolhida pelo usuário.
- Saldo insuficiente → erro, **não grava**.
- Edição/exclusão de apontamento: **admin**; estorna alocações anteriores e recalcula se mudar barras, liga, setor ou seleção de montes.

### 3.7 Limites e consistência

- `peso_atual_kg`, `barras_atuais`, deduções: **≥ 0** (CHECK no banco).
- Grade: `posicao_x` 0–9, `posicao_y` 0–4; único `(lote_id, posicao_x, posicao_y)` por monte ativo.
- `data_chegada` do lote: não futura (≤ hoje em Brasília).
- `data_consumo` do apontamento: não futura.
- Relatórios devem bater com transações, eventos e alocações.

### 3.8 Campos editáveis vs automáticos

| Campo | Editável pelo usuário? |
|-------|------------------------|
| `data_chegada`, `data_consumo` | sim |
| `created_at`, `updated_at` | não (trigger) |
| Totais iniciais do lote | sim na entrada; não recalculados depois |
| Posição na grade | sim (drag-and-drop ou formulário) |

---

## 4. Interface e Experiência

- **Dispositivos alvo:** tablet **1200×1920 px** (primário, chão de fábrica), celular **375px** (secundário), desktop para relatórios e gestão PCP.
- **Padrão de interação:** touch-first; grade visual como espelho do chão; cards iOS por liga/lote; layout otimizado para largura ≥ 1200px.
- **Navegação estoque:** abas ou lista por **liga** → lotes expansíveis → grade do lote.
- **Cores de liga:** paleta fixa via `chave_cor` (azul, amarelo, vermelho, preto, cinza, sem_cor, verde, branco).
- **Estados visuais na grade:** reservado = borda amarela grossa; movido para setor = mesma borda + fundo da liga com opacidade reduzida; parcial (baixa) = borda neutra; baixa total = cinza/desativado (histórico ainda acessível); seleção na saída = destaque branco/escala.
- **Saldos do almoxarifado:** métricas “no estoque” consideram apenas montes com `localizacao = almoxarifado`.
- **Timeout de sessão:** **30 min** sem interação → logout automático.
- **Relatórios:** período padrão = mês corrente; filtros persistem (URL/store); **export CSV no MVP** (PDF pós-MVP).
- **Componentes:** seguir `docs/COMPONENTS.md` e `docs/DESIGN_TOKENS.md`.

---

## 5. Offline e Sincronização

> Offline = **sim** (`AGENTS.md`). Detalhes técnicos em `docs/OFFLINE.md`.

- **Regras de negócio offline:**
  - Abertura/login **exige internet** para autenticar e sincronizar estado inicial.
  - Após login, **todas** as operações do MVP funcionam offline (estoque, entrada, saída, consumo, cadastros).
  - Múltiplos tablets compartilham o mesmo estoque; conflitos resolvidos por **LWW** em `updated_at` (servidor prevalece no upsert).
- **O que o usuário pode fazer sem internet (após login):** tudo exceto primeiro acesso e recuperação de sessão expirada sem cache válido.
- **Prioridade em conflito de sync:** registro com maior `updated_at` vence; outbox local reenvia em FIFO por dispositivo; UUID evita colisão de PK.

---

## 6. Modelos de produto (cadastro)

- **Cadeia produtiva (referência):** chumbo bruto → **grade** (teleira) → **painel** (empastadeira) → **placa** (lixação) → **bateria**.
- **MVP (só chumbo):** cadastrar apenas **`tipo_produto = grade`**, com:
  - `nome` — identificação do modelo
  - `polaridade` — `positiva` ou `negativa`
  - `placas_por_grade` — quantidade de placas por grade (ex.: 4)
  - `sort_order` — ordem de exibição
- **Unicidade:** par `(nome, polaridade)` entre registros **ativos** (permite mesmo nome com polaridades diferentes).
- **Futuro:** painel, placa e bateria usarão o mesmo cadastro com outros `tipo_produto` (fora do escopo atual).

---

## 7. Observações e Exceções

- Sistema legado `controle_chumbo` serve apenas como **referência de comportamento**, não de código ou nomes de tabelas.
- Estorno de liberação: restaura saldo do monte; marcar `transacoes_saida.estornada = true` (manter registro para auditoria — ver `DATABASE.md`).
- Gestão de usuários no MVP: tela **`/configuracoes/usuarios`** (admin); criação de login via Supabase Auth; perfil `usuarios` vinculado no primeiro acesso ou pelo admin.
- Export **CSV** no MVP (relatórios); export **PDF** pós-MVP.

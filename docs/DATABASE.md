# DATABASE.md — Documentação do Banco de Dados

> Schema do módulo **Controle de Chumbo**. Regras de negócio em `docs/BUSINESS_RULES.md`.

---

## Informações Gerais

- **Banco:** Supabase (PostgreSQL 15+) quando `DATA_SOURCE=supabase`; Dexie espelho quando `local`
- **Timezone armazenamento:** UTC (`TIMESTAMPTZ`)
- **Timezone exibição:** America/Sao_Paulo — ver `docs/DATE_TIME.md`
- **Formato UI:** datas `dd/MM/yyyy`, horas `HH:mm`
- **Soft Delete padrão:** `is_active BOOLEAN DEFAULT true` em cadastros (master data)
- **Auditoria:** `created_at`, `updated_at` (trigger), `created_by` (UUID → auth.users)
- **Optimistic Locking:** `updated_at` como controle de concorrência e LWW no sync

---

## Convenções Globais do Banco

```sql
created_at  TIMESTAMPTZ DEFAULT now()
updated_at  TIMESTAMPTZ DEFAULT now()  -- trigger set_updated_at

is_active   BOOLEAN DEFAULT true NOT NULL  -- cadastros
created_by  UUID REFERENCES auth.users(id)  -- auditoria; não isola estoque
```

**Enums:** preferir `TEXT` + `CHECK` (ver `BUSINESS_RULES.md` para significados).

---

## Diagrama de Relações

```
auth.users
    └── usuarios (1:1 user_id)

ligas
    └── lotes
            └── montes
                    ├── transacoes_saida → destinos_saida
                    ├── eventos_monte
                    └── alocacoes_consumo

setores
    ├── maquinas
    └── montes (setor_id, setor_reserva_id)

apontamentos_consumo
    ├── ligas, lotes (opcional), setores, maquinas, operadores, turnos, modelos_produto
    └── alocacoes_consumo → montes
```

---

## Tabelas do Projeto

### `usuarios` — Perfil e role

```sql
CREATE TABLE usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'operador'
                CHECK (role IN ('operador', 'supervisor', 'admin')),
  is_active   BOOLEAN DEFAULT true NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usuarios_user_id ON usuarios(user_id);
```

---

### `ligas` — Liga de chumbo

```sql
CREATE TABLE ligas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  chave_cor   TEXT NOT NULL DEFAULT 'cinza'
                CHECK (chave_cor IN (
                  'azul','amarelo','vermelho','preto','cinza','sem_cor','verde','branco'
                )),
  is_active   BOOLEAN DEFAULT true NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### `lotes` — Lote de chumbo

```sql
CREATE TABLE lotes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liga_id             UUID NOT NULL REFERENCES ligas(id) ON DELETE RESTRICT,
  numero_lote         TEXT NOT NULL,
  data_chegada        DATE NOT NULL,
  peso_inicial_kg     NUMERIC NOT NULL CHECK (peso_inicial_kg >= 0),
  barras_iniciais     INTEGER NOT NULL CHECK (barras_iniciais >= 0),
  colunas_grade       INTEGER NOT NULL DEFAULT 5 CHECK (colunas_grade BETWEEN 1 AND 10),
  linhas_grade        INTEGER NOT NULL DEFAULT 3 CHECK (linhas_grade BETWEEN 1 AND 5),
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (liga_id, numero_lote)
);

ALTER TABLE lotes
  ADD CONSTRAINT chk_lotes_data_chegada_nao_futura
  CHECK (data_chegada <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date);
```

---

### `setores` — Setores da fábrica

> Criar **antes** de `montes` (FK).

```sql
CREATE TABLE setores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  tipo        TEXT NOT NULL DEFAULT 'producao'
                CHECK (tipo IN ('producao','saida_direta')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN DEFAULT true NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_setores_updated_at ON setores(updated_at);
```

---

### `maquinas` — Máquinas por setor

```sql
CREATE TABLE maquinas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setor_id    UUID NOT NULL REFERENCES setores(id) ON DELETE RESTRICT,
  nome        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN DEFAULT true NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_maquinas_setor_id ON maquinas(setor_id);
```

---

### `montes` — Pilha na grade

```sql
CREATE TABLE montes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id             UUID NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  peso_atual_kg       NUMERIC NOT NULL CHECK (peso_atual_kg >= 0),
  barras_atuais       INTEGER NOT NULL CHECK (barras_atuais >= 0),
  posicao_x           INTEGER NOT NULL CHECK (posicao_x BETWEEN 0 AND 9),
  posicao_y           INTEGER NOT NULL CHECK (posicao_y BETWEEN 0 AND 4),
  status              TEXT NOT NULL CHECK (status IN (
                        'DISPONIVEL','RESERVADO','PARCIAL','CONSUMIDO')),
  reservado_para      TEXT NULL,
  reservado_em        TIMESTAMPTZ NULL,
  setor_reserva_id    UUID NULL REFERENCES setores(id) ON DELETE SET NULL,
  grupo_reserva_id    UUID NULL,
  localizacao         TEXT NOT NULL DEFAULT 'almoxarifado'
                        CHECK (localizacao IN ('almoxarifado','setor')),
  setor_id            UUID NULL REFERENCES setores(id) ON DELETE SET NULL,
  movido_setor_em     TIMESTAMPTZ NULL,
  monte_origem_id     UUID NULL REFERENCES montes(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (lote_id, posicao_x, posicao_y)
);

CREATE INDEX idx_montes_lote_id ON montes(lote_id);
CREATE INDEX idx_montes_setor_id ON montes(setor_id);
CREATE INDEX idx_montes_updated_at ON montes(updated_at);
```

---

### `destinos_saida` — Destinos de liberação/baixa

```sql
CREATE TABLE destinos_saida (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN DEFAULT true NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### `transacoes_saida` — Histórico de baixas

```sql
CREATE TABLE transacoes_saida (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monte_id            UUID NOT NULL REFERENCES montes(id) ON DELETE RESTRICT,
  peso_baixado_kg     NUMERIC NOT NULL CHECK (peso_baixado_kg >= 0),
  barras_baixadas     INTEGER NOT NULL CHECK (barras_baixadas >= 0),
  destino_saida_id    UUID NOT NULL REFERENCES destinos_saida(id) ON DELETE RESTRICT,
  setor_id            UUID NULL REFERENCES setores(id) ON DELETE SET NULL,
  data_transacao      TIMESTAMPTZ NOT NULL,
  grupo_liberacao_id  UUID NULL,
  estornada           BOOLEAN NOT NULL DEFAULT false,
  estornada_em        TIMESTAMPTZ NULL,
  estornada_por       UUID NULL REFERENCES auth.users(id),
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transacoes_saida_monte_id ON transacoes_saida(monte_id);
CREATE INDEX idx_transacoes_saida_grupo ON transacoes_saida(grupo_liberacao_id);
CREATE INDEX idx_transacoes_saida_updated_at ON transacoes_saida(updated_at);
```

---

### `eventos_monte` — Reserva e movimentação

```sql
CREATE TABLE eventos_monte (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monte_id        UUID NOT NULL REFERENCES montes(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL CHECK (tipo IN (
                    'RESERVA','CANCELAMENTO_RESERVA',
                    'MOVIDO_PARA_SETOR','DEVOLVIDO_ALMOXARIFADO')),
  destinatario    TEXT NOT NULL,
  data_evento     TIMESTAMPTZ NOT NULL,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_eventos_monte_monte_id ON eventos_monte(monte_id);
CREATE INDEX idx_eventos_monte_updated_at ON eventos_monte(updated_at);
```

---

### `operadores` — Operadores de produção

```sql
CREATE TABLE operadores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN DEFAULT true NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### `turnos` — Turnos

```sql
CREATE TABLE turnos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN DEFAULT true NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### `modelos_produto` — Modelos de produto (consumo)

> **MVP chumbo:** cadastro apenas de **grade** (saída da teleira). Painel, placa e bateria reservados para fases futuras (`tipo_produto`).

```sql
CREATE TABLE modelos_produto (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                TEXT NOT NULL,
  tipo_produto        TEXT NOT NULL DEFAULT 'grade'
                        CHECK (tipo_produto IN ('grade','painel','placa','bateria')),
  polaridade          TEXT NOT NULL
                        CHECK (polaridade IN ('positiva','negativa')),
  placas_por_grade    INTEGER NOT NULL DEFAULT 4 CHECK (placas_por_grade >= 1),
  sort_order          INTEGER NOT NULL DEFAULT 0,
  is_active           BOOLEAN DEFAULT true NOT NULL,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Unicidade lógica (MVP): nome + polaridade entre ativos — validado no service
CREATE INDEX idx_modelos_produto_sort ON modelos_produto(sort_order);
CREATE INDEX idx_modelos_produto_polaridade ON modelos_produto(polaridade);
```

---

### `apontamentos_consumo` — Consumo diário

```sql
CREATE TABLE apontamentos_consumo (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_consumo            DATE NOT NULL,
  liga_id                 UUID NOT NULL REFERENCES ligas(id) ON DELETE RESTRICT,
  lote_id                 UUID NULL REFERENCES lotes(id) ON DELETE SET NULL,
  setor_id                UUID NOT NULL REFERENCES setores(id) ON DELETE RESTRICT,
  maquina_id              UUID NULL REFERENCES maquinas(id) ON DELETE SET NULL,
  operador_id             UUID NULL REFERENCES operadores(id) ON DELETE SET NULL,
  turno_id                UUID NULL REFERENCES turnos(id) ON DELETE SET NULL,
  modelo_produto_id       UUID NULL REFERENCES modelos_produto(id) ON DELETE SET NULL,
  barras                  INTEGER NOT NULL CHECK (barras > 0),
  peso_kg                 NUMERIC NOT NULL CHECK (peso_kg >= 0),
  borra_kg                NUMERIC NOT NULL DEFAULT 0 CHECK (borra_kg >= 0),
  borra_pct               NUMERIC NOT NULL DEFAULT 0,
  modo_selecao_montes     TEXT NOT NULL DEFAULT 'automatico'
                            CHECK (modo_selecao_montes IN ('automatico','manual')),
  lote_produto            TEXT NULL,
  observacoes             TEXT NULL,
  -- snapshots no momento do registro (relatório histórico)
  nome_operador           TEXT NOT NULL DEFAULT '',
  nome_turno              TEXT NOT NULL DEFAULT '',
  nome_maquina            TEXT NOT NULL DEFAULT '',
  nome_setor              TEXT NOT NULL DEFAULT '',
  nome_modelo_produto     TEXT NOT NULL DEFAULT '',
  numero_lote_snapshot    TEXT NOT NULL DEFAULT '',
  created_by              UUID REFERENCES auth.users(id),
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE apontamentos_consumo
  ADD CONSTRAINT chk_apontamento_data_nao_futura
  CHECK (data_consumo <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date);

CREATE INDEX idx_apontamentos_data ON apontamentos_consumo(data_consumo);
CREATE INDEX idx_apontamentos_updated_at ON apontamentos_consumo(updated_at);
```

---

### `alocacoes_consumo` — Detalhe por monte

```sql
CREATE TABLE alocacoes_consumo (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apontamento_id          UUID NOT NULL REFERENCES apontamentos_consumo(id) ON DELETE CASCADE,
  monte_id                UUID NOT NULL REFERENCES montes(id) ON DELETE RESTRICT,
  barras_baixadas         INTEGER NOT NULL CHECK (barras_baixadas > 0),
  peso_baixado_kg         NUMERIC NOT NULL CHECK (peso_baixado_kg >= 0),
  kg_por_barra_snapshot   NUMERIC NOT NULL,
  created_by              UUID REFERENCES auth.users(id),
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_alocacoes_apontamento ON alocacoes_consumo(apontamento_id);
CREATE INDEX idx_alocacoes_monte ON alocacoes_consumo(monte_id);
```

---

## IndexedDB (Dexie) — somente `DATA_SOURCE=local`

Tabelas espelho com os **mesmos nomes** das tabelas Postgres acima, mais:

### `sync_outbox` — Fila de sincronização

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | PK da entrada da fila |
| `tabela_entidade` | string | ex: `montes` |
| `entidade_id` | string | UUID do registro |
| `operacao` | string | `upsert` \| `delete` |
| `payload` | object | JSON do row |
| `criado_em` | string ISO | ordem FIFO |
| `tentativas` | number | retries |
| `ultimo_erro` | string? | diagnóstico |

Detalhes de flush/LWW: `docs/OFFLINE.md`.

---

## Triggers

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas com updated_at (usuarios, ligas, lotes, montes, ...)
```

**Recomendação Fase D:** trigger ou RPC que force `updated_at = now()` no servidor no upsert via sync (mitiga clock skew dos tablets).

---

## Políticas RLS (Row Level Security)

> RLS ativado em **TODAS** as tabelas quando `DATA_SOURCE=supabase`.

### MVP (Fase B–C) — pool da fábrica

Qualquer usuário **authenticated** pode SELECT/INSERT/UPDATE/DELETE nas tabelas de negócio (estoque compartilhado). Permissões por role ficam nos **services** (Opção A da entrevista).

```sql
ALTER TABLE montes ENABLE ROW LEVEL SECURITY;

CREATE POLICY montes_select_authenticated ON montes
  FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

-- Repetir INSERT, UPDATE, DELETE com WITH CHECK/USING authenticated
```

### Fase D — endurecimento por role

```sql
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM usuarios
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Exemplo: só supervisor+ estorna
CREATE POLICY transacoes_update_supervisor ON transacoes_saida
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('supervisor', 'admin'));
```

Adaptar políticas conforme matriz em `BUSINESS_RULES.md` §1.

---

## Relações Entre Tabelas (texto)

```
auth.users ── usuarios
ligas ── lotes ── montes ── transacoes_saida → destinos_saida
              └── eventos_monte
setores ── maquinas
        └── montes (localização / reserva)
apontamentos_consumo ── alocacoes_consumo → montes
```

---

## Migrations

### Estrutura

```
supabase/migrations/
  202606020001_schema_core.sql       -- ligas, lotes, setores, maquinas, montes, destinos, transacoes, eventos
  202606020002_schema_cadastros.sql  -- operadores, turnos, modelos_produto
  202606020003_schema_consumo.sql    -- apontamentos, alocacoes
  202606020004_usuarios.sql          -- usuarios + get_user_role
  202606020005_triggers.sql
  202606020006_rls_mvp.sql           -- authenticated pool
  202606020007_rls_roles.sql         -- Fase D (opcional neste repo até deploy)
  202606020008_seed_destinos.sql     -- VRLA, Oxido, etc.
```

### Ordem recomendada

1. Tabelas e constraints (`setores` antes de `montes` FK)
2. Triggers `set_updated_at`
3. RLS MVP
4. Seed de `destinos_saida` e dados de teste (opcional)

### Aplicar

```bash
supabase db push
supabase migration up
```

### Gerar types TypeScript

```bash
supabase gen types typescript --project-id [id] > src/lib/supabase/database.types.ts
```

| Data | Arquivo | Descrição |
|------|---------|-----------|
| 2026-06-02 | `001_schema_core` | Estoque espelho físico |
| 2026-06-02 | `002_schema_cadastros` | Setores, máquinas, operadores |
| 2026-06-02 | `003_schema_consumo` | Apontamentos e alocações |
| 2026-06-02 | `006_rls_mvp` | Pool authenticated |

---

## Variáveis de Ambiente

```bash
DATA_SOURCE=local
NEXT_PUBLIC_APP_TIMEZONE=America/Sao_Paulo

# Quando DATA_SOURCE=supabase:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Ver `.env.example` e `AGENTS.md`.

-- Schema core: estoque espelho físico

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

CREATE TABLE transacoes_saida (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monte_id            UUID NOT NULL REFERENCES montes(id) ON DELETE RESTRICT,
  peso_baixado_kg     NUMERIC NOT NULL CHECK (peso_baixado_kg >= 0),
  barras_baixadas     INTEGER NOT NULL CHECK (barras_baixadas >= 0),
  destino_saida_id    UUID NOT NULL REFERENCES destinos_saida(id) ON DELETE RESTRICT,
  setor_id            UUID NULL REFERENCES setores(id) ON DELETE SET NULL,
  data_transacao      TIMESTAMPTZ NOT NULL,
  grupo_liberacao_id  UUID NULL,
  observacao          TEXT NULL,
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

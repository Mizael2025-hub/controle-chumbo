-- Consumo diário

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

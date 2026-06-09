-- Cadastros auxiliares

CREATE TABLE operadores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN DEFAULT true NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE turnos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN DEFAULT true NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

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

CREATE INDEX idx_modelos_produto_sort ON modelos_produto(sort_order);
CREATE INDEX idx_modelos_produto_polaridade ON modelos_produto(polaridade);

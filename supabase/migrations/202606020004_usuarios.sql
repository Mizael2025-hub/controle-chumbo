-- Perfil de usuário e role

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

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM usuarios
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

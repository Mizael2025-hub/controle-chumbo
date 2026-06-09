-- RLS MVP: pool authenticated (estoque compartilhado)

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'usuarios', 'ligas', 'lotes', 'setores', 'maquinas', 'montes',
    'destinos_saida', 'transacoes_saida', 'eventos_monte',
    'operadores', 'turnos', 'modelos_produto',
    'apontamentos_consumo', 'alocacoes_consumo'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format(
      'CREATE POLICY %I_select ON %I FOR SELECT TO authenticated USING (auth.role() = ''authenticated'')',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON %I FOR INSERT TO authenticated WITH CHECK (auth.role() = ''authenticated'')',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON %I FOR UPDATE TO authenticated USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON %I FOR DELETE TO authenticated USING (auth.role() = ''authenticated'')',
      t, t
    );
  END LOOP;
END $$;

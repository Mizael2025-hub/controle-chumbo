-- Seed destinos de saída padrão

INSERT INTO destinos_saida (nome, slug, sort_order, is_active)
VALUES
  ('VRLA', 'vrla', 0, true),
  ('Óxido', 'oxido', 1, true),
  ('Venda', 'venda', 2, true),
  ('Teleiras', 'teleiras', 3, true),
  ('Exportação', 'exportacao', 4, true)
ON CONFLICT (slug) DO NOTHING;

-- Reset operacional para testes — NÃO apaga cadastros base.
-- Executar somente em dev/staging com confirmação explícita.
-- Preserva: ligas, destinos_saida, operadores, modelos_produto, setores, maquinas, turnos, usuarios.
-- Preserva: contagem_estoque_linha (rascunho de auditoria física).

BEGIN;

TRUNCATE TABLE alocacoes_consumo RESTART IDENTITY CASCADE;
TRUNCATE TABLE apontamentos_consumo RESTART IDENTITY CASCADE;
TRUNCATE TABLE transacoes_saida RESTART IDENTITY CASCADE;
TRUNCATE TABLE eventos_monte RESTART IDENTITY CASCADE;
TRUNCATE TABLE montes RESTART IDENTITY CASCADE;
TRUNCATE TABLE lotes RESTART IDENTITY CASCADE;

-- Fila offline (se existir no Postgres na Fase D)
-- TRUNCATE TABLE sync_outbox RESTART IDENTITY CASCADE;

COMMIT;

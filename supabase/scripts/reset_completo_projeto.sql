-- Reset COMPLETO do schema public — projeto Supabase reutilizado.
-- Executar UMA VEZ no SQL Editor do Supabase (dev/staging).
-- ATENÇÃO: apaga TODAS as tabelas, views, functions e policies do schema public.

BEGIN;

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO anon, authenticated, service_role;

COMMIT;

-- Opcional: remover usuários Auth antigos (rodar separadamente, com cuidado)
-- DELETE FROM auth.users;

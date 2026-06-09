-- Endurecer funções flagged pelo advisor de segurança Supabase

ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.get_user_role() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO service_role;

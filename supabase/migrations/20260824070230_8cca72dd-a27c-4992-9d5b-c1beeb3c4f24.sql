
-- Public pages: anon must not need admin helper
DROP POLICY "packages_public_read" ON public.packages;
CREATE POLICY "packages_anon_read_active" ON public.packages FOR SELECT TO anon USING (is_active);
CREATE POLICY "packages_auth_read" ON public.packages FOR SELECT TO authenticated USING (is_active OR public.is_admin());

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owns_student(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.record_payment(uuid, numeric, int, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_lesson_status(uuid, public.lesson_status, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reschedule_lesson(uuid, timestamptz) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.adjust_balance(uuid, int, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_student(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_payment(uuid, numeric, int, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_lesson_status(uuid, public.lesson_status, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_lesson(uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_balance(uuid, int, text) TO authenticated;

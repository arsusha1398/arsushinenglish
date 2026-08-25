-- Grant admin access to the existing account.
CREATE UNIQUE INDEX IF NOT EXISTS students_user_id_unique
  ON public.students (user_id)
  WHERE user_id IS NOT NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'felixisbro055@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Keep the same access for this account if it is recreated later.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE
    WHEN lower(NEW.email) = 'felixisbro055@gmail.com' THEN 'admin'::public.app_role
    ELSE 'student'::public.app_role
  END)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF lower(NEW.email) <> 'felixisbro055@gmail.com' THEN
    UPDATE public.students
    SET user_id = NEW.id
    WHERE user_id IS NULL AND lower(email) = lower(NEW.email);

    IF NOT FOUND THEN
      INSERT INTO public.students (user_id, full_name, email, is_active)
      VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email, false)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

-- Create student records for existing non-admin accounts that predate the trigger.
INSERT INTO public.students (user_id, full_name, email, is_active)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  u.email,
  false
FROM auth.users u
WHERE lower(u.email) <> 'felixisbro055@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.students s WHERE s.user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;

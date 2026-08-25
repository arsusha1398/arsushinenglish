
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','student');
CREATE TYPE public.eng_level AS ENUM ('A1','A2','B1','B2','C1','C2');
CREATE TYPE public.lesson_status AS ENUM ('scheduled','completed','cancelled','rescheduled','no_show');
CREATE TYPE public.lesson_format AS ENUM ('online','offline');
CREATE TYPE public.tx_reason AS ENUM ('payment','lesson_completed','manual_correction','no_show_charge','reversal');
CREATE TYPE public.hw_status AS ENUM ('new','in_progress','submitted','reviewed');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- new user -> profile + student role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  UPDATE public.students SET user_id = NEW.id
    WHERE user_id IS NULL AND lower(email) = lower(NEW.email);
  RETURN NEW;
END; $$;

-- STUDENTS
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  level public.eng_level NOT NULL DEFAULT 'A1',
  target_level public.eng_level,
  goal text,
  start_date date NOT NULL DEFAULT current_date,
  format public.lesson_format NOT NULL DEFAULT 'online',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_student(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.students s WHERE s.id = _student_id AND s.user_id = auth.uid())
$$;

CREATE POLICY "students_admin_all" ON public.students FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "students_select_own" ON public.students FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "students_update_own_contacts" ON public.students FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PRICING PLANS
CREATE TABLE public.pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  price_per_lesson numeric(10,2) NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60,
  currency text NOT NULL DEFAULT 'BYN',
  valid_from date NOT NULL DEFAULT current_date,
  valid_to date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_plans TO authenticated;
GRANT ALL ON public.pricing_plans TO service_role;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_admin_all" ON public.pricing_plans FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "plans_select_own" ON public.pricing_plans FOR SELECT TO authenticated USING (public.owns_student(student_id));

-- PACKAGES (public price list)
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  lessons_count int NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'BYN',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages_public_read" ON public.packages FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "packages_admin_write" ON public.packages FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SITE CONTENT (landing text managed from admin)
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_content_public_read" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_content_admin_write" ON public.site_content FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PAYMENTS
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  lessons_bought int NOT NULL,
  currency text NOT NULL DEFAULT 'BYN',
  paid_at timestamptz NOT NULL DEFAULT now(),
  method text NOT NULL DEFAULT 'cash',
  comment text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_admin_all" ON public.payments FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT TO authenticated USING (public.owns_student(student_id));

-- LESSONS
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60,
  format public.lesson_format NOT NULL DEFAULT 'online',
  status public.lesson_status NOT NULL DEFAULT 'scheduled',
  comment text,
  rescheduled_from uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons_admin_all" ON public.lessons FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "lessons_select_own" ON public.lessons FOR SELECT TO authenticated USING (public.owns_student(student_id));

-- BALANCE LEDGER
CREATE TABLE public.balance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  delta int NOT NULL,
  reason public.tx_reason NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  comment text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX balance_tx_one_charge_per_lesson
  ON public.balance_transactions (lesson_id) WHERE reason = 'lesson_completed';
CREATE UNIQUE INDEX balance_tx_one_per_payment
  ON public.balance_transactions (payment_id) WHERE reason = 'payment';
GRANT SELECT ON public.balance_transactions TO authenticated;
GRANT ALL ON public.balance_transactions TO service_role;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_admin_read" ON public.balance_transactions FOR SELECT TO authenticated
  USING (public.is_admin() OR public.owns_student(student_id));

-- STUDENT NOTES (admin only)
CREATE TABLE public.student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  body text NOT NULL,
  author uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_notes TO authenticated;
GRANT ALL ON public.student_notes TO service_role;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_admin_all" ON public.student_notes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- HOMEWORK
CREATE TABLE public.homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  grammar_topic text,
  body text,
  status public.hw_status NOT NULL DEFAULT 'new',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework TO authenticated;
GRANT ALL ON public.homework TO service_role;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hw_admin_all" ON public.homework FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "hw_select_own" ON public.homework FOR SELECT TO authenticated USING (public.owns_student(student_id));
CREATE POLICY "hw_update_own" ON public.homework FOR UPDATE TO authenticated
  USING (public.owns_student(student_id)) WITH CHECK (public.owns_student(student_id));

-- MATERIALS
CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'link',
  url text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materials TO authenticated;
GRANT ALL ON public.materials TO service_role;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materials_admin_all" ON public.materials FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "materials_select_visible" ON public.materials FOR SELECT TO authenticated
  USING (student_id IS NULL OR public.owns_student(student_id));

-- PROGRESS
CREATE TABLE public.progress_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  level public.eng_level NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_entries TO authenticated;
GRANT ALL ON public.progress_entries TO service_role;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_admin_all" ON public.progress_entries FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "progress_select_own" ON public.progress_entries FOR SELECT TO authenticated USING (public.owns_student(student_id));

-- BALANCE VIEW
CREATE OR REPLACE VIEW public.student_balances
WITH (security_invoker = true) AS
  SELECT s.id AS student_id, COALESCE(SUM(t.delta), 0)::int AS balance
  FROM public.students s
  LEFT JOIN public.balance_transactions t ON t.student_id = s.id
  GROUP BY s.id;
GRANT SELECT ON public.student_balances TO authenticated;

-- BUSINESS LOGIC RPCs
CREATE OR REPLACE FUNCTION public.record_payment(
  _student_id uuid, _amount numeric, _lessons int, _method text, _comment text, _currency text DEFAULT 'BYN'
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _pid uuid;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _lessons <= 0 THEN RAISE EXCEPTION 'lessons must be positive'; END IF;
  INSERT INTO public.payments (student_id, amount, lessons_bought, currency, method, comment, created_by)
  VALUES (_student_id, _amount, _lessons, _currency, _method, _comment, auth.uid())
  RETURNING id INTO _pid;
  INSERT INTO public.balance_transactions (student_id, delta, reason, payment_id, created_by, comment)
  VALUES (_student_id, _lessons, 'payment', _pid, auth.uid(), _comment);
  RETURN _pid;
END; $$;

CREATE OR REPLACE FUNCTION public.set_lesson_status(
  _lesson_id uuid, _status public.lesson_status, _charge boolean DEFAULT true
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _l public.lessons; _charged boolean;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO _l FROM public.lessons WHERE id = _lesson_id;
  IF _l.id IS NULL THEN RAISE EXCEPTION 'lesson not found'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.balance_transactions
    WHERE lesson_id = _lesson_id AND reason IN ('lesson_completed','no_show_charge')
  ) INTO _charged;

  IF _status IN ('completed','no_show') AND _charge AND NOT _charged THEN
    INSERT INTO public.balance_transactions (student_id, delta, reason, lesson_id, created_by)
    VALUES (_l.student_id, -1, CASE WHEN _status = 'completed' THEN 'lesson_completed' ELSE 'no_show_charge' END, _lesson_id, auth.uid());
  END IF;

  IF _status IN ('cancelled','rescheduled','scheduled') AND _charged THEN
    INSERT INTO public.balance_transactions (student_id, delta, reason, lesson_id, created_by, comment)
    VALUES (_l.student_id, 1, 'reversal', _lesson_id, auth.uid(), 'Сторно списания при смене статуса');
  END IF;

  UPDATE public.lessons SET status = _status WHERE id = _lesson_id;
END; $$;

CREATE OR REPLACE FUNCTION public.reschedule_lesson(_lesson_id uuid, _new_starts_at timestamptz)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _l public.lessons; _new uuid;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO _l FROM public.lessons WHERE id = _lesson_id;
  IF _l.id IS NULL THEN RAISE EXCEPTION 'lesson not found'; END IF;
  PERFORM public.set_lesson_status(_lesson_id, 'rescheduled', false);
  INSERT INTO public.lessons (student_id, starts_at, duration_minutes, format, status, comment, rescheduled_from)
  VALUES (_l.student_id, _new_starts_at, _l.duration_minutes, _l.format, 'scheduled', _l.comment, _lesson_id)
  RETURNING id INTO _new;
  RETURN _new;
END; $$;

CREATE OR REPLACE FUNCTION public.adjust_balance(_student_id uuid, _delta int, _comment text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _comment IS NULL OR btrim(_comment) = '' THEN RAISE EXCEPTION 'comment required'; END IF;
  IF _delta = 0 THEN RAISE EXCEPTION 'delta must not be zero'; END IF;
  INSERT INTO public.balance_transactions (student_id, delta, reason, comment, created_by)
  VALUES (_student_id, _delta, 'manual_correction', _comment, auth.uid());
END; $$;

-- SEED price packages + landing content
INSERT INTO public.packages (title, lessons_count, price, currency, description, sort_order) VALUES
  ('Пробное занятие · онлайн или текстом', 1, 0, 'BYN', '30 минут: определяем уровень и знакомимся', 1),
  ('Онлайн · 45 минут', 1, 30, 'BYN', 'Индивидуальное занятие', 2),
  ('Онлайн · 90 минут', 1, 50, 'BYN', 'Индивидуальное занятие', 3),
  ('Вживую · 45 минут', 1, 35, 'BYN', 'Индивидуальное занятие', 4),
  ('Вживую · 90 минут', 1, 60, 'BYN', 'Индивидуальное занятие', 5),
  ('Онлайн · пакет 5 + 1', 6, 150, 'BYN', '5 оплаченных занятий + 1 бесплатно · 45 минут', 6),
  ('Онлайн · пакет 10 + 2', 12, 300, 'BYN', '10 оплаченных занятий + 2 бесплатно · 45 минут', 7),
  ('Вживую · пакет 5 + 1', 6, 175, 'BYN', '5 оплаченных занятий + 1 бесплатно · 45 минут', 8),
  ('Вживую · пакет 10 + 2', 12, 350, 'BYN', '10 оплаченных занятий + 2 бесплатно · 45 минут', 9);

INSERT INTO public.site_content (key, value) VALUES
  ('hero_title', 'Английский без скуки'),
  ('hero_subtitle', 'Живые занятия один на один: разговорная практика, грамматика по делу и прогресс, который видно.'),
  ('teacher_name', 'Арсения'),
  ('teacher_bio', 'Частный преподаватель английского. 8 лет практики, более 20 учеников, уровни от A1 до C1. Занятия строю вокруг твоей цели: работа, переезд, экзамен или просто свободно говорить.'),
  ('teacher_method', 'Никакой зубрёжки списков слов. Много говорим с первого занятия, грамматику разбираем на живых примерах, домашние задания короткие и по делу. После каждого занятия — заметки и материалы в личном кабинете.');

-- Replace the original price list with Arseniy's current offers.
UPDATE public.packages SET is_active = false;

INSERT INTO public.packages (title, lessons_count, price, currency, description, sort_order) VALUES
  ('Пробное занятие · онлайн или текстом', 1, 0, 'BYN', '30 минут: определяем уровень и знакомимся', 1),
  ('Онлайн · 45 минут', 1, 30, 'BYN', 'Индивидуальное занятие', 2),
  ('Онлайн · 90 минут', 1, 50, 'BYN', 'Индивидуальное занятие', 3),
  ('Вживую · 45 минут', 1, 35, 'BYN', 'Индивидуальное занятие', 4),
  ('Вживую · 90 минут', 1, 60, 'BYN', 'Индивидуальное занятие', 5),
  ('Онлайн · пакет 5 + 1', 6, 150, 'BYN', '5 оплаченных занятий + 1 бесплатно · 45 минут', 6),
  ('Онлайн · пакет 10 + 2', 12, 300, 'BYN', '10 оплаченных занятий + 2 бесплатно · 45 минут', 7),
  ('Вживую · пакет 5 + 1', 6, 175, 'BYN', '5 оплаченных занятий + 1 бесплатно · 45 минут', 8),
  ('Вживую · пакет 10 + 2', 12, 350, 'BYN', '10 оплаченных занятий + 2 бесплатно · 45 минут', 9),
  ('Онлайн · пакет 15 + 3', 18, 450, 'BYN', '15 оплаченных занятий + 3 бесплатно · 45 минут', 10);

INSERT INTO public.site_content (key, value) VALUES
  ('hero_title', 'Английский без ступора'),
  ('hero_subtitle', 'Помогаю освоить английский для жизни, работы, учебы и переезда за границу.'),
  ('teacher_name', 'Арсений'),
  ('teacher_bio', 'Преподаю английский для начинающих и среднего уровня A1–B2, а разговорный английский — от A1 до C1.'),
  ('teacher_method', 'Помогаю разобраться с временами, научиться задавать вопросы и говорить без ступора. Подстраиваю занятия под жизнь, работу, учебу или переезд за границу.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Grant the requested admin account its role when the account is created.
-- The password is intentionally managed by Supabase Auth and is not stored here.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;

  IF lower(NEW.email) = 'felixisbro055@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.students (user_id, full_name, email, is_active)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email, false)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  UPDATE public.students SET user_id = NEW.id
    WHERE user_id IS NULL AND lower(email) = lower(NEW.email);
  RETURN NEW;
END; $$;

-- Also cover the account if it was registered before this migration ran.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users
WHERE lower(email) = 'felixisbro055@gmail.com'
ON CONFLICT DO NOTHING;

-- Authenticated users can see the shared schedule, but never student contacts.
CREATE POLICY "lessons_shared_calendar_read" ON public.lessons
  FOR SELECT TO authenticated USING (true);

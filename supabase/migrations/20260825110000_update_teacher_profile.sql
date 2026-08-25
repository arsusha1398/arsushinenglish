UPDATE public.site_content
SET value = 'Арсений', updated_at = now()
WHERE key = 'teacher_name';

UPDATE public.site_content
SET value = 'Преподаватель английского: 8 лет опыта и более 23 учеников. Помогаю уверенно говорить, разбираться в грамматике и использовать английский для жизни, работы, учебы и переезда.',
    updated_at = now()
WHERE key = 'teacher_bio';
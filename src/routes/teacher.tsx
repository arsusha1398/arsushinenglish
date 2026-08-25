import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import teacherPhoto from "@/assets/teacher.jpg.asset.json";

export const Route = createFileRoute("/teacher")({
  head: () => ({
    meta: [
      { title: "Преподаватель — Арсений, репетитор английского" },
      {
        name: "description",
        content:
          "Арсений. Преподаю английский для начинающих и среднего уровня A1–B2, а разговорный английский — от A1 до C1.",
      },
      { property: "og:title", content: "Преподаватель — Арсений" },
      { property: "og:description", content: "Опыт, методика и подход к занятиям английским." },
    ],
  }),
  component: TeacherPage,
});

function TeacherPage() {
  const { data: content } = useQuery({
    queryKey: ["site_content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("key,value");
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<
        string,
        string
      >;
    },
  });

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[340px_1fr] md:py-16">
        <div className="relative">
          <img
            src={teacherPhoto.url}
            alt="Арсений, преподаватель английского"
            className="w-full rotate-[-2deg] rounded-3xl border-[4px] border-ink object-cover shadow-[10px_10px_0_var(--ink)]"
          />
        </div>

        <div>
          <h1 className="font-display text-4xl font-black md:text-6xl">
            {content?.["teacher_name"] ?? "Арсений"}
          </h1>
          <p className="mt-5 text-lg font-medium leading-relaxed">
            {content?.["teacher_bio"] ??
              "Помогаю разобраться с временами, научиться задавать вопросы и говорить без ступора. Подтягиваем английский для жизни и работы, учебы или переезда за границу."}
          </p>

          <h2 className="mt-10 font-display text-2xl font-black">
            <span className="marker-underline">Методика</span>
          </h2>
          <p className="mt-3 text-lg font-medium leading-relaxed">
            {content?.["teacher_method"] ??
              "На занятиях много живой речи и практики. Объясняю грамматику простым языком и подстраиваю уроки под твою цель и уровень."}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "Speaking",
              "Grammar in use",
              "English для работы",
              "Учеба и переезд",
              "Разговорный A1–C1",
            ].map((t, i) => (
              <span
                key={t}
                className={`sticker ${["bg-lime", "bg-sun", "bg-blue text-blue-foreground", "bg-magenta text-magenta-foreground", "bg-card"][i % 5]}`}
                style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
              >
                {t}
              </span>
            ))}
          </div>

          <Button asChild variant="party" size="lg" className="mt-10">
            <Link to="/auth">Записаться на занятие</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}

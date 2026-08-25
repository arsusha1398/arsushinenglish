import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MonthCalendar, type CalendarLesson } from "@/components/site/MonthCalendar";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Общий календарь — Английский с Арсенией" }] }),
  component: SharedCalendarPage,
});

function SharedCalendarPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useQuery({
    queryKey: ["shared-calendar"],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, starts_at, duration_minutes, format, status, students(full_name)")
        .eq("status", "scheduled")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, navigate, session]);

  if (loading || !session) {
    return (
      <SiteLayout>
        <p className="p-12 text-center font-display text-xl">Проверяем доступ…</p>
      </SiteLayout>
    );
  }

  const calendarLessons: CalendarLesson[] = (lessons ?? []).map((lesson) => ({
    id: lesson.id,
    studentName: lesson.students?.full_name ?? "Занятие",
    startsAt: lesson.starts_at,
    duration: lesson.duration_minutes,
    format: lesson.format,
    status: lesson.status,
  }));

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Link to="/cabinet" className="inline-flex items-center gap-2 font-bold underline">
          <ArrowLeft className="size-4" /> В кабинет
        </Link>
        <div className="mt-5 flex items-center gap-3">
          <CalendarDays className="size-8" />
          <div>
            <h1 className="font-display text-4xl font-black">Общий календарь</h1>
            <p className="mt-2 font-semibold text-muted-foreground">
              Занятия всех учеников в одном расписании.
            </p>
          </div>
        </div>
        {isLoading ? (
          <p className="mt-8 font-semibold">Загружаем календарь…</p>
        ) : (
          <div className="mt-8">
            <MonthCalendar lessons={calendarLessons} />
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

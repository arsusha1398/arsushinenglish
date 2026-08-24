import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Clock3, Plus, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MonthCalendar, type CalendarLesson } from "@/components/site/MonthCalendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtDateTime, LESSON_STATUS_CLASS, LESSON_STATUS_LABEL } from "@/lib/format";

export const Route = createFileRoute("/admin/calendar")({
  head: () => ({ meta: [{ title: "Календарь — админ-панель" }] }),
  component: AdminCalendarPage,
});

type LessonStatus = "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";

function AdminCalendarPage() {
  const { session, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState("45");
  const [format, setFormat] = useState<"online" | "offline">("online");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const { data: students } = useQuery({
    queryKey: ["admin", "calendar", "students"],
    enabled: role === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, email")
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["admin", "calendar", "lessons"],
    enabled: role === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select(
          "id, student_id, starts_at, duration_minutes, format, status, comment, students(full_name, email)",
        )
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/auth" });
    else if (role !== "admin") navigate({ to: "/cabinet" });
  }, [loading, navigate, role, session]);

  if (loading || !session || role !== "admin") {
    return (
      <SiteLayout>
        <p className="p-12 text-center font-display text-xl">Проверяем доступ…</p>
      </SiteLayout>
    );
  }

  const createLesson = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentId || !startsAt) {
      setMessage("Выбери ученика и дату урока.");
      return;
    }
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("lessons").insert({
      student_id: studentId,
      starts_at: new Date(startsAt).toISOString(),
      duration_minutes: Number(duration),
      format,
      status: "scheduled",
    });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setStartsAt("");
    setMessage("Урок добавлен в расписание.");
    await queryClient.invalidateQueries({ queryKey: ["admin", "calendar"] });
  };

  const setStatus = async (lessonId: string, status: LessonStatus) => {
    const { error } = await supabase.rpc("set_lesson_status", {
      _lesson_id: lessonId,
      _status: status,
      _charge: status === "completed" || status === "no_show",
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["admin", "calendar"] });
  };

  const calendarLessons: CalendarLesson[] = (lessons ?? []).map((lesson) => ({
    id: lesson.id,
    studentName: lesson.students?.full_name ?? "Ученик",
    startsAt: lesson.starts_at,
    duration: lesson.duration_minutes,
    format: lesson.format,
    status: lesson.status,
  }));

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 font-bold underline">
              <ArrowLeft className="size-4" /> В админ-панель
            </Link>
            <h1 className="mt-5 font-display text-4xl font-black">Календарь</h1>
            <p className="mt-2 font-semibold text-muted-foreground">
              Привязывай учеников к урокам и отмечай результат занятия.
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Выйти
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={createLesson} className="pop rounded-3xl bg-card p-6">
            <div className="flex items-center gap-2">
              <Plus className="size-5" />
              <h2 className="font-display text-xl font-black">Новый урок</h2>
            </div>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="student">Ученик</Label>
                <select
                  id="student"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  className="ink-border h-11 w-full rounded-xl bg-background px-3 font-semibold"
                >
                  <option value="">Выбрать ученика</option>
                  {(students ?? []).map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="startsAt">Дата и время</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="duration">Длительность</Label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    className="ink-border h-11 w-full rounded-xl bg-background px-3 font-semibold"
                  >
                    <option value="45">45 минут</option>
                    <option value="90">90 минут</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="format">Формат</Label>
                  <select
                    id="format"
                    value={format}
                    onChange={(event) => setFormat(event.target.value as "online" | "offline")}
                    className="ink-border h-11 w-full rounded-xl bg-background px-3 font-semibold"
                  >
                    <option value="online">Онлайн</option>
                    <option value="offline">Вживую</option>
                  </select>
                </div>
              </div>
              <Button type="submit" variant="party" className="w-full" disabled={saving}>
                <CalendarDays className="size-4" /> {saving ? "Сохраняем…" : "Добавить в календарь"}
              </Button>
              {message && <p className="text-sm font-bold text-primary">{message}</p>}
            </div>
          </form>

          <div>
            <MonthCalendar lessons={calendarLessons} />
            <div className="flex items-center gap-2">
              <Clock3 className="size-5" />
              <h2 className="font-display text-xl font-black">Расписание</h2>
            </div>
            {isLoading ? (
              <p className="mt-6 font-semibold">Загружаем расписание…</p>
            ) : (
              <div className="mt-5 space-y-3">
                {(lessons ?? []).length === 0 && (
                  <p className="rounded-2xl border-[3px] border-dashed border-ink p-8 text-center font-semibold">
                    Уроков пока нет.
                  </p>
                )}
                {(lessons ?? []).map((lesson) => (
                  <article key={lesson.id} className="pop-sm rounded-2xl bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-black">
                          {lesson.students?.full_name ?? "Ученик"}
                        </p>
                        <p className="mt-1 font-semibold">
                          {fmtDateTime(lesson.starts_at)} · {lesson.duration_minutes} мин ·{" "}
                          {lesson.format === "online" ? "онлайн" : "вживую"}
                        </p>
                      </div>
                      <span className={`sticker ${LESSON_STATUS_CLASS[lesson.status]}`}>
                        {LESSON_STATUS_LABEL[lesson.status]}
                      </span>
                    </div>
                    {lesson.status === "scheduled" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="lime"
                          onClick={() => setStatus(lesson.id, "completed")}
                        >
                          <Check className="size-4" /> Проведено
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(lesson.id, "cancelled")}
                        >
                          <X className="size-4" /> Отменить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(lesson.id, "no_show")}
                        >
                          Не пришёл
                        </Button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Wallet, BookOpen, GraduationCap, Library, User } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  fmtDate,
  fmtDateTime,
  HW_STATUS_LABEL,
  LESSON_STATUS_CLASS,
  LESSON_STATUS_LABEL,
  lessonsWord,
  TX_REASON_LABEL,
} from "@/lib/format";

export const Route = createFileRoute("/cabinet")({
  head: () => ({
    meta: [
      { title: "Личный кабинет ученика — Английский с Арсением" },
      {
        name: "description",
        content: "Баланс занятий, ближайший урок, расписание, домашние задания и материалы.",
      },
      { property: "og:title", content: "Личный кабинет ученика" },
      {
        property: "og:description",
        content: "Баланс, расписание и домашние задания в одном месте.",
      },
    ],
  }),
  component: Cabinet,
});

function Cabinet() {
  const { session, role, studentId, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/auth" });
    else if (role === "admin") navigate({ to: "/admin" });
  }, [session, role, loading, navigate]);

  const { data } = useQuery({
    enabled: !!studentId,
    queryKey: ["cabinet", studentId],
    queryFn: async () => {
      const [student, balance, lessons, tx, hw, materials, progress] = await Promise.all([
        supabase.from("students").select("*").eq("id", studentId!).single(),
        supabase
          .from("student_balances")
          .select("balance")
          .eq("student_id", studentId!)
          .maybeSingle(),
        supabase
          .from("lessons")
          .select("*")
          .eq("student_id", studentId!)
          .order("starts_at", { ascending: false }),
        supabase
          .from("balance_transactions")
          .select("*")
          .eq("student_id", studentId!)
          .order("created_at", { ascending: false }),
        supabase
          .from("homework")
          .select("*")
          .eq("student_id", studentId!)
          .order("created_at", { ascending: false }),
        supabase.from("materials").select("*").order("created_at", { ascending: false }),
        supabase
          .from("progress_entries")
          .select("*")
          .eq("student_id", studentId!)
          .order("created_at", { ascending: false }),
      ]);
      return {
        student: student.data,
        balance: balance.data?.balance ?? 0,
        lessons: lessons.data ?? [],
        tx: tx.data ?? [],
        hw: hw.data ?? [],
        materials: materials.data ?? [],
        progress: progress.data ?? [],
      };
    },
  });

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (data?.student) {
      setPhone(data.student.phone ?? "");
      setEmail(data.student.email ?? "");
    }
  }, [data?.student]);

  if (loading || !session) {
    return (
      <SiteLayout>
        <p className="p-12 text-center font-display text-xl">Загружаем кабинет…</p>
      </SiteLayout>
    );
  }

  if (!studentId) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="pop rotate-[-1deg] rounded-3xl bg-card p-8">
            <h1 className="font-display text-3xl font-black">Почти готово!</h1>
            <p className="mt-3 font-semibold text-muted-foreground">
              Аккаунт создан, но карточка ученика ещё не заведена преподавателем. Напиши Арсению —
              он привяжет тебя к занятиям, и здесь появится баланс и расписание.
            </p>
            <Button variant="outline" className="mt-6" onClick={signOut}>
              Выйти
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const upcoming = (data?.lessons ?? [])
    .filter((l) => l.status === "scheduled" && new Date(l.starts_at) >= new Date())
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
  const next = upcoming[0];
  const balance = data?.balance ?? 0;

  const saveProfile = async () => {
    const { error } = await supabase.from("students").update({ phone, email }).eq("id", studentId);
    if (error) toast.error("Не удалось сохранить");
    else {
      toast.success("Сохранено");
      qc.invalidateQueries({ queryKey: ["cabinet", studentId] });
    }
  };

  const updateHw = async (id: string, status: string) => {
    const { error } = await supabase
      .from("homework")
      .update({ status: status as never })
      .eq("id", id);
    if (error) toast.error("Не получилось обновить");
    else qc.invalidateQueries({ queryKey: ["cabinet", studentId] });
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="sticker rotate-[-2deg] bg-magenta text-magenta-foreground">
              Кабинет
            </span>
            <h1 className="mt-3 font-display text-4xl font-black">
              Привет, {data?.student?.full_name?.split(" ")[0] ?? "друг"}!
            </h1>
          </div>
          <Button variant="outline" onClick={signOut}>
            Выйти
          </Button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div
            className={`pop rotate-[-1deg] rounded-3xl p-6 ${balance < 0 ? "bg-primary text-primary-foreground" : "bg-lime"}`}
          >
            <Wallet className="size-7" />
            <p className="mt-3 text-sm font-bold uppercase opacity-70">Баланс</p>
            <p className="font-display text-5xl font-black">{balance}</p>
            <p className="text-sm font-bold">{lessonsWord(balance)}</p>
          </div>
          <div className="pop rotate-[1deg] rounded-3xl bg-blue p-6 text-blue-foreground md:col-span-2">
            <CalendarDays className="size-7" />
            <p className="mt-3 text-sm font-bold uppercase opacity-70">Ближайшее занятие</p>
            {next ? (
              <>
                <p className="font-display text-2xl font-black">{fmtDateTime(next.starts_at)}</p>
                <p className="text-sm font-bold opacity-80">
                  {next.duration_minutes} мин · {next.format === "online" ? "онлайн" : "офлайн"}
                </p>
              </>
            ) : (
              <p className="font-display text-2xl font-black">Пока не запланировано</p>
            )}
          </div>
        </div>

        <Tabs defaultValue="schedule" className="mt-8">
          <TabsList className="flex h-auto flex-wrap gap-2 border-[3px] border-ink bg-card p-2">
            <TabsTrigger
              value="schedule"
              className="rounded-lg font-bold data-[state=active]:bg-sun"
            >
              Расписание
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg font-bold data-[state=active]:bg-sun"
            >
              История
            </TabsTrigger>
            <TabsTrigger
              value="balance"
              className="rounded-lg font-bold data-[state=active]:bg-sun"
            >
              Баланс
            </TabsTrigger>
            <TabsTrigger value="hw" className="rounded-lg font-bold data-[state=active]:bg-sun">
              Домашка
            </TabsTrigger>
            <TabsTrigger
              value="materials"
              className="rounded-lg font-bold data-[state=active]:bg-sun"
            >
              Материалы
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-lg font-bold data-[state=active]:bg-sun"
            >
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-5 space-y-3">
            <Link
              to="/calendar"
              className="pop flex items-center justify-between gap-4 rounded-2xl bg-blue p-5 text-blue-foreground transition-transform hover:-translate-y-1"
            >
              <span>
                <span className="block font-display text-xl font-black">Общее расписание</span>
                <span className="mt-1 block text-sm font-semibold opacity-80">
                  Все занятия в календаре с временем и длительностью
                </span>
              </span>
              <CalendarDays className="size-7 shrink-0" />
            </Link>
            {upcoming.length > 0 && (
              <div className="space-y-3">
                {upcoming.map((l) => (
                  <Row
                    key={l.id}
                    left={fmtDateTime(l.starts_at)}
                    right={LESSON_STATUS_LABEL[l.status]!}
                    badge={LESSON_STATUS_CLASS[l.status]!}
                    sub={`${l.duration_minutes} мин · ${l.format === "online" ? "онлайн" : "офлайн"}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-5 space-y-3">
            {(data?.lessons ?? []).filter((l) => l.status !== "scheduled").length === 0 && (
              <Empty text="История пока пустая" />
            )}
            {(data?.lessons ?? [])
              .filter((l) => l.status !== "scheduled")
              .map((l) => (
                <Row
                  key={l.id}
                  left={fmtDateTime(l.starts_at)}
                  right={LESSON_STATUS_LABEL[l.status]!}
                  badge={LESSON_STATUS_CLASS[l.status]!}
                  sub={l.comment ?? ""}
                />
              ))}
          </TabsContent>

          <TabsContent value="balance" className="mt-5 space-y-3">
            {(data?.tx ?? []).length === 0 && <Empty text="Транзакций пока нет" />}
            {(data?.tx ?? []).map((t) => (
              <Row
                key={t.id}
                left={TX_REASON_LABEL[t.reason]!}
                sub={`${fmtDate(t.created_at)}${t.comment ? ` · ${t.comment}` : ""}`}
                right={`${t.delta > 0 ? "+" : ""}${t.delta}`}
                badge={t.delta > 0 ? "bg-lime text-ink" : "bg-primary text-primary-foreground"}
              />
            ))}
          </TabsContent>

          <TabsContent value="hw" className="mt-5 space-y-3">
            {(data?.hw ?? []).length === 0 && <Empty text="Домашних заданий пока нет" />}
            {(data?.hw ?? []).map((h) => (
              <div key={h.id} className="pop-sm rounded-2xl bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-display text-lg font-bold">{h.title}</p>
                  <span className="sticker bg-sun">{HW_STATUS_LABEL[h.status]}</span>
                </div>
                {h.grammar_topic && (
                  <p className="mt-1 text-sm font-bold text-muted-foreground">{h.grammar_topic}</p>
                )}
                {h.body && <p className="mt-3 whitespace-pre-wrap font-medium">{h.body}</p>}
                {h.status !== "reviewed" && (
                  <div className="mt-4 flex gap-2">
                    {h.status === "new" && (
                      <Button
                        size="sm"
                        variant="blue"
                        onClick={() => updateHw(h.id, "in_progress")}
                      >
                        Начал делать
                      </Button>
                    )}
                    {h.status !== "submitted" && (
                      <Button size="sm" variant="lime" onClick={() => updateHw(h.id, "submitted")}>
                        Отправить на проверку
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="materials" className="mt-5 space-y-3">
            {(data?.materials ?? []).length === 0 && <Empty text="Материалов пока нет" />}
            {(data?.materials ?? []).map((m) => (
              <div key={m.id} className="pop-sm rounded-2xl bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-display text-lg font-bold">{m.title}</p>
                  <span className="sticker bg-lime">{m.student_id ? "Персональный" : "Общий"}</span>
                </div>
                {m.body && <p className="mt-2 whitespace-pre-wrap font-medium">{m.body}</p>}
                {m.url && (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-bold underline"
                  >
                    Открыть материал
                  </a>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="profile" className="mt-5">
            <div className="pop rounded-3xl bg-card p-6">
              <div className="flex items-center gap-3">
                <User className="size-6" />
                <p className="font-display text-xl font-black">{data?.student?.full_name}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="sticker bg-sun">
                  <GraduationCap className="size-3.5" /> Уровень {data?.student?.level}
                </span>
                {data?.student?.target_level && (
                  <span className="sticker bg-lime">Цель: {data.student.target_level}</span>
                )}
                <span className="sticker bg-card">
                  <BookOpen className="size-3.5" /> с {fmtDate(data?.student?.start_date ?? "")}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ph">Телефон</Label>
                  <Input
                    id="ph"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="ink-border h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="em">Email</Label>
                  <Input
                    id="em"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ink-border h-11 rounded-xl"
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={saveProfile}>
                Сохранить
              </Button>

              <h3 className="mt-8 font-display text-lg font-black">
                <Library className="mr-2 inline size-5" /> Прогресс
              </h3>
              <div className="mt-3 space-y-2">
                {(data?.progress ?? []).length === 0 && (
                  <p className="font-semibold text-muted-foreground">Записей пока нет</p>
                )}
                {(data?.progress ?? []).map((p) => (
                  <div key={p.id} className="rounded-xl border-[3px] border-ink bg-muted p-3">
                    <p className="font-bold">
                      {p.level} · {fmtDate(p.created_at)}
                    </p>
                    {p.comment && <p className="text-sm font-medium">{p.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

function Row({
  left,
  right,
  sub,
  badge,
}: {
  left: string;
  right: string;
  sub?: string;
  badge: string;
}) {
  return (
    <div className="pop-sm flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4">
      <div>
        <p className="font-display font-bold">{left}</p>
        {sub && <p className="text-sm font-semibold text-muted-foreground">{sub}</p>}
      </div>
      <span className={`sticker ${badge}`}>{right}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border-[3px] border-dashed border-ink/40 p-8 text-center font-bold text-muted-foreground">
      {text}
    </div>
  );
}

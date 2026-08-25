import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarDays, Instagram, LogOut, Send, Settings, Users } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Админ-панель — English с Арсенией" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { session, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: students = [] } = useQuery({
    queryKey: ["admin", "summary", "students"],
    enabled: role === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, created_at, is_active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const recentStudents = students.filter((student) => {
    const createdAt = new Date(student.created_at);
    const ageDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return ageDays <= 30;
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

  if (location.pathname !== "/admin") {
    return <Outlet />;
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="sticker rotate-[-2deg] bg-magenta text-magenta-foreground">
              Админ-панель
            </span>
            <h1 className="mt-4 font-display text-4xl font-black">Привет, Арсения!</h1>
            <p className="mt-2 font-semibold text-muted-foreground">
              Управление учениками, расписанием и информацией сайта.
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="size-4" /> Выйти
          </Button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="pop rounded-3xl bg-card p-6 md:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Новые ученики
                </p>
                <p className="mt-2 font-display text-3xl font-black">{recentStudents.length}</p>
              </div>
              <div className="text-sm font-semibold text-muted-foreground">
                {students.length > 0 ? (
                  <div className="space-y-2">
                    {recentStudents.slice(0, 5).map((student) => (
                      <div key={student.id} className="flex items-center justify-between gap-3">
                        <span>{student.full_name}</span>
                        <span className="text-xs uppercase text-muted-foreground">
                          {new Date(student.created_at).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>Пока нет новых учеников</span>
                )}
              </div>
            </div>
          </div>

          <AdminLink
            icon={Users}
            title="Ученики"
            text="Список учеников и их прогресс"
            to="/admin/students"
          />
          <AdminLink
            icon={Settings}
            title="Публичная информация"
            text="Цены, форматы и описание занятий"
            to="/pricing"
          />
          <AdminLink
            icon={CalendarDays}
            title="Календарь"
            text="Назначить урок и одобрить расписание"
            to="/admin/calendar"
          />
          <AdminLink
            icon={BookOpen}
            title="Баланс и материалы"
            text="Оплаты, домашка и учебные материалы"
            to="/admin/management"
          />
          <div className="pop rounded-3xl bg-sun p-6">
            <p className="font-display text-xl font-black">Связаться с Арсенией</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                className="sticker bg-card"
                href="https://www.instagram.com/arsusha1398"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="size-4" /> @arsusha1398
              </a>
              <a
                className="sticker bg-blue text-blue-foreground"
                href="https://t.me/arsusha1398"
                target="_blank"
                rel="noreferrer"
              >
                <Send className="size-4" /> @arsusha1398
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function AdminLink({
  icon: Icon,
  title,
  text,
  to,
}: {
  icon: typeof Users;
  title: string;
  text: string;
  to: "/admin/students" | "/admin/calendar" | "/admin/management" | "/pricing";
}) {
  return (
    <Link to={to} className="pop rounded-3xl bg-card p-6 transition-transform hover:-translate-y-1">
      <Icon className="size-8" />
      <p className="mt-4 font-display text-xl font-black">{title}</p>
      <p className="mt-2 font-semibold text-muted-foreground">{text}</p>
    </Link>
  );
}

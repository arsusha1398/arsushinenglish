import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Ученики — админ-панель" }] }),
  component: AdminStudentsPage,
});

function AdminStudentsPage() {
  const { session, role, loading, signOut } = useAuth();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: students, isLoading } = useQuery({
    queryKey: ["admin", "students"],
    enabled: role === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, email, phone, level, is_active, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const approveStudent = async (studentId: string) => {
    setApprovingId(studentId);
    const { error } = await supabase
      .from("students")
      .update({ is_active: true })
      .eq("id", studentId);
    setApprovingId(null);
    if (error) throw error;
    window.location.reload();
  };

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

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 font-bold underline">
              <ArrowLeft className="size-4" /> В админ-панель
            </Link>
            <h1 className="mt-5 font-display text-4xl font-black">Ученики</h1>
            <p className="mt-2 font-semibold text-muted-foreground">
              Ученики, которым можно привязать расписание и баланс.
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Выйти
          </Button>
        </div>

        {isLoading ? (
          <p className="mt-10 font-semibold">Загружаем список…</p>
        ) : students?.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {students.map((student) => (
              <article key={student.id} className="pop rounded-3xl bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xl font-black">{student.full_name}</p>
                    <p className="mt-1 font-semibold text-muted-foreground">
                      {student.level} · {student.is_active ? "активен" : "заявка ожидает одобрения"}
                    </p>
                  </div>
                  <Users className="size-7" />
                </div>
                <div className="mt-5 space-y-2 text-sm font-semibold">
                  {student.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="size-4" /> {student.email}
                    </p>
                  )}
                  {student.phone && <p>{student.phone}</p>}
                  <p className="text-muted-foreground">Добавлен: {fmtDate(student.created_at)}</p>
                  {!student.is_active && (
                    <Button
                      size="sm"
                      variant="lime"
                      disabled={approvingId === student.id}
                      onClick={() => approveStudent(student.id)}
                    >
                      {approvingId === student.id ? "Одобряем…" : "Одобрить заявку"}
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border-[3px] border-dashed border-ink p-8 text-center font-semibold">
            Пока нет учеников.
          </p>
        )}
      </section>
    </SiteLayout>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, FileText, Wallet } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/management")({
  head: () => ({ meta: [{ title: "Управление учениками — админ-панель" }] }),
  component: AdminManagementPage,
});

function AdminManagementPage() {
  const { session, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [lessonsBought, setLessonsBought] = useState("5");
  const [balanceDelta, setBalanceDelta] = useState("");
  const [comment, setComment] = useState("");
  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkBody, setHomeworkBody] = useState("");
  const [homeworkTopic, setHomeworkTopic] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialBody, setMaterialBody] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [message, setMessage] = useState("");

  const { data: students } = useQuery({
    queryKey: ["admin", "management", "students"],
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

  const selectStudent = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStudentId(event.target.value);
    setMessage("");
  };

  const requireStudent = () => {
    if (!studentId) {
      setMessage("Сначала выбери ученика.");
      return false;
    }
    return true;
  };

  const addPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireStudent()) return;
    const numericAmount = Number(amount);
    const numericLessons = Number(lessonsBought);
    if (!numericAmount || numericAmount <= 0 || !numericLessons || numericLessons <= 0) {
      setMessage("Укажи положительную сумму и количество занятий.");
      return;
    }
    const { error } = await supabase.rpc("record_payment", {
      _student_id: studentId,
      _amount: numericAmount,
      _lessons: numericLessons,
      _method: "manual",
      _comment: comment || null,
      _currency: "BYN",
    });
    if (error) setMessage(error.message);
    else {
      setAmount("");
      setComment("");
      setMessage("Оплата добавлена, баланс обновлён.");
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    }
  };

  const addHomework = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireStudent()) return;
    if (!homeworkTitle.trim()) {
      setMessage("Укажи название домашнего задания.");
      return;
    }
    const { error } = await supabase.from("homework").insert({
      student_id: studentId,
      title: homeworkTitle.trim(),
      body: homeworkBody || null,
      grammar_topic: homeworkTopic || null,
      status: "new",
    });
    if (error) setMessage(error.message);
    else {
      setHomeworkTitle("");
      setHomeworkBody("");
      setHomeworkTopic("");
      setMessage("Домашнее задание добавлено.");
    }
  };

  const adjustBalance = async () => {
    if (!requireStudent()) return;
    const delta = Number(balanceDelta);
    if (!delta || !comment.trim()) {
      setMessage("Для корректировки укажи число занятий и комментарий.");
      return;
    }
    const { error } = await supabase.rpc("adjust_balance", {
      _student_id: studentId,
      _delta: delta,
      _comment: comment.trim(),
    });
    if (error) setMessage(error.message);
    else {
      setBalanceDelta("");
      setComment("");
      setMessage("Баланс скорректирован.");
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    }
  };

  const addMaterial = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!materialTitle.trim()) {
      setMessage("Укажи название материала.");
      return;
    }
    const { error } = await supabase.from("materials").insert({
      student_id: studentId || null,
      title: materialTitle.trim(),
      body: materialBody || null,
      url: materialUrl || null,
      kind: materialUrl ? "link" : "text",
    });
    if (error) setMessage(error.message);
    else {
      setMaterialTitle("");
      setMaterialBody("");
      setMaterialUrl("");
      setMessage(studentId ? "Материал добавлен ученику." : "Общий материал добавлен.");
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Link to="/admin" className="inline-flex items-center gap-2 font-bold underline">
          <ArrowLeft className="size-4" /> В админ-панель
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black">Управление</h1>
            <p className="mt-2 font-semibold text-muted-foreground">
              Баланс, домашние задания и материалы учеников.
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Выйти
          </Button>
        </div>

        <div className="mt-8 max-w-md space-y-1.5">
          <Label htmlFor="management-student">Ученик для действий</Label>
          <select
            id="management-student"
            value={studentId}
            onChange={selectStudent}
            className="ink-border h-11 w-full rounded-xl bg-background px-3 font-semibold"
          >
            <option value="">Общий материал / выбрать ученика ниже</option>
            {(students ?? []).map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </select>
        </div>
        {message && <p className="mt-4 font-bold text-primary">{message}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <form onSubmit={addPayment} className="pop rounded-3xl bg-lime p-6">
            <Wallet className="size-8" />
            <h2 className="mt-4 font-display text-xl font-black">Баланс</h2>
            <p className="mt-2 text-sm font-semibold">Добавь оплату и начисли занятия ученику.</p>
            <div className="mt-5 space-y-3">
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Сумма, BYN"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <Input
                type="number"
                min="1"
                placeholder="Занятий"
                value={lessonsBought}
                onChange={(event) => setLessonsBought(event.target.value)}
              />
              <Input
                placeholder="Комментарий"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              <Button type="submit" variant="outline" className="w-full">
                Добавить оплату
              </Button>
              <Input
                type="number"
                placeholder="Корректировка: +1 или -1"
                value={balanceDelta}
                onChange={(event) => setBalanceDelta(event.target.value)}
              />
              <Button type="button" variant="outline" className="w-full" onClick={adjustBalance}>
                Изменить баланс вручную
              </Button>
            </div>
          </form>

          <form onSubmit={addHomework} className="pop rounded-3xl bg-sun p-6">
            <BookOpen className="size-8" />
            <h2 className="mt-4 font-display text-xl font-black">Домашка</h2>
            <p className="mt-2 text-sm font-semibold">Задание появится в кабинете ученика.</p>
            <div className="mt-5 space-y-3">
              <Input
                placeholder="Название"
                value={homeworkTitle}
                onChange={(event) => setHomeworkTitle(event.target.value)}
              />
              <Input
                placeholder="Тема грамматики"
                value={homeworkTopic}
                onChange={(event) => setHomeworkTopic(event.target.value)}
              />
              <textarea
                placeholder="Текст задания"
                value={homeworkBody}
                onChange={(event) => setHomeworkBody(event.target.value)}
                className="ink-border min-h-24 w-full rounded-xl bg-background p-3 font-semibold"
              />
              <Button type="submit" variant="outline" className="w-full">
                Добавить домашку
              </Button>
            </div>
          </form>

          <form onSubmit={addMaterial} className="pop rounded-3xl bg-blue p-6 text-blue-foreground">
            <FileText className="size-8" />
            <h2 className="mt-4 font-display text-xl font-black">Материалы</h2>
            <p className="mt-2 text-sm font-semibold opacity-80">
              Оставь ученика пустым для общего материала.
            </p>
            <div className="mt-5 space-y-3">
              <Input
                placeholder="Название"
                value={materialTitle}
                onChange={(event) => setMaterialTitle(event.target.value)}
                className="text-foreground"
              />
              <Input
                placeholder="Ссылка"
                type="url"
                value={materialUrl}
                onChange={(event) => setMaterialUrl(event.target.value)}
                className="text-foreground"
              />
              <textarea
                placeholder="Описание или текст"
                value={materialBody}
                onChange={(event) => setMaterialBody(event.target.value)}
                className="ink-border min-h-24 w-full rounded-xl bg-background p-3 font-semibold text-foreground"
              />
              <Button type="submit" variant="outline" className="w-full">
                Добавить материал
              </Button>
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

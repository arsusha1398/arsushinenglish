import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import teacherPhoto from "@/assets/teacher.jpg.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход в личный кабинет — Английский с Арсением" },
      {
        name: "description",
        content:
          "Войдите или зарегистрируйтесь, чтобы видеть баланс занятий, расписание и домашние задания.",
      },
      { property: "og:title", content: "Вход в личный кабинет" },
      { property: "og:description", content: "Баланс занятий, расписание и домашние задания." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "reset";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { session, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && session && role) {
      navigate({ to: role === "admin" ? "/admin" : "/cabinet" });
    }
  }, [session, role, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("С возвращением!");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/cabinet`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Аккаунт создан! Проверь почту, если потребуется подтверждение.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/cabinet`,
        });
        if (error) throw error;
        toast.success("Ссылка для восстановления отправлена на почту");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Не удалось войти через Google");
      return;
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto flex max-w-md flex-col px-4 py-12 md:py-20">
        <img
          src={teacherPhoto.url}
          alt="Преподаватель английского"
          className="mx-auto mb-6 size-28 rounded-full border-[4px] border-ink object-cover shadow-[6px_6px_0_var(--ink)]"
        />
        <div className="pop rotate-[-1deg] rounded-3xl bg-card p-7">
          <h1 className="font-display text-3xl font-black">
            {mode === "signin" ? "Вход" : mode === "signup" ? "Регистрация" : "Забыли пароль?"}
          </h1>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            {mode === "reset"
              ? "Пришлём одноразовую ссылку на почту."
              : "Личный кабинет: баланс, расписание, домашка."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="ink-border h-11 rounded-xl"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="ink-border h-11 rounded-xl"
              />
            </div>
            {mode !== "reset" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="ink-border h-11 rounded-xl"
                />
              </div>
            )}
            <Button type="submit" variant="party" size="lg" className="w-full" disabled={busy}>
              {busy
                ? "Секунду…"
                : mode === "signin"
                  ? "Войти"
                  : mode === "signup"
                    ? "Создать аккаунт"
                    : "Отправить ссылку"}
            </Button>
          </form>

          {mode !== "reset" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase text-muted-foreground">
                <span className="h-0.5 flex-1 bg-ink/20" /> или{" "}
                <span className="h-0.5 flex-1 bg-ink/20" />
              </div>
              <Button variant="outline" size="lg" className="w-full" onClick={google}>
                Войти через Google
              </Button>
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
            {mode !== "signin" && (
              <button className="underline" onClick={() => setMode("signin")}>
                Войти
              </button>
            )}
            {mode !== "signup" && (
              <button className="underline" onClick={() => setMode("signup")}>
                Регистрация
              </button>
            )}
            {mode !== "reset" && (
              <button className="underline" onClick={() => setMode("reset")}>
                Забыли пароль?
              </button>
            )}
          </div>
        </div>

        <Link to="/" className="mt-6 text-center text-sm font-bold underline">
          На главную
        </Link>
      </section>
    </SiteLayout>
  );
}

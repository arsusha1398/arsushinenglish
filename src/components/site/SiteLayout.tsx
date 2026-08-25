import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/teacher", label: "Преподаватель" },
  { to: "/pricing", label: "Цены" },
  { to: "/calendar", label: "Календарь" },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { session, role } = useAuth();
  const cabinetTo = role === "admin" ? "/admin" : "/cabinet";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b-[3px] border-ink bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="rotate-[-3deg] rounded-xl border-[3px] border-ink bg-primary px-3 py-1 font-display text-lg font-black text-primary-foreground shadow-[3px_3px_0_var(--ink)]">
              ENGLISH
            </span>
            <span className="hidden font-display text-lg font-bold sm:inline">с Арсенией</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-lg px-3 py-2 font-semibold transition-colors hover:bg-sun"
                activeProps={{ className: "bg-sun" }}
              >
                {l.label}
              </Link>
            ))}
            <Button asChild variant="blue" className="ml-2">
              <Link to={session ? cabinetTo : "/auth"}>Личный кабинет</Link>
            </Button>
          </nav>

          <button
            className="rounded-lg border-[3px] border-ink bg-card p-1.5 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t-[3px] border-ink bg-paper px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 font-semibold hover:bg-sun"
                >
                  {l.label}
                </Link>
              ))}
              <Button asChild variant="blue">
                <Link to={session ? cabinetTo : "/auth"} onClick={() => setOpen(false)}>
                  Личный кабинет
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t-[3px] border-ink bg-ink px-4 py-8 text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p className="font-display text-xl font-black">English с Арсенией</p>
          <p className="text-sm opacity-70">
            © {new Date().getFullYear()} · Арсения · занятия онлайн и вживую
          </p>
        </div>
      </footer>
    </div>
  );
}

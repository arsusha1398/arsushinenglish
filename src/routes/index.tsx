import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, MessageCircle, Target, CalendarCheck, Send, Instagram } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import teacherPhoto from "@/assets/teacher.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Английский с Арсением — занятия для жизни и работы" },
      {
        name: "description",
        content:
          "Английский для начинающих и среднего уровня A1–B2, разговорная практика A1–C1, занятия онлайн и вживую.",
      },
      { property: "og:title", content: "Английский с Арсением" },
      {
        property: "og:description",
        content:
          "Разговорный английский без ступора, понятная грамматика и подготовка к жизни за границей.",
      },
    ],
  }),
  component: Index,
});

const perks = [
  {
    icon: MessageCircle,
    title: "Говорим с первого дня",
    text: "60% занятия — живая речь, а не молчаливые упражнения.",
    color: "bg-lime",
  },
  {
    icon: Target,
    title: "Под твою цель",
    text: "Работа, переезд, экзамен или свободный разговор — программа под задачу.",
    color: "bg-sun",
  },
  {
    icon: CalendarCheck,
    title: "Всё под контролем",
    text: "Баланс занятий, расписание и домашка — в личном кабинете.",
    color: "bg-blue text-blue-foreground",
  },
];

const fallbackPackages = [
  {
    id: "online-45",
    title: "Онлайн · 45 минут",
    description: "Индивидуальный урок",
    price: 30,
    currency: "BYN",
    lessons_count: 1,
  },
  {
    id: "online-90",
    title: "Онлайн · 90 минут",
    description: "Больше практики за урок",
    price: 50,
    currency: "BYN",
    lessons_count: 1,
  },
  {
    id: "offline-45",
    title: "Вживую · 45 минут",
    description: "Индивидуальный урок",
    price: 35,
    currency: "BYN",
    lessons_count: 1,
  },
  {
    id: "offline-90",
    title: "Вживую · 90 минут",
    description: "Больше практики за урок",
    price: 60,
    currency: "BYN",
    lessons_count: 1,
  },
  {
    id: "online-15",
    title: "Онлайн · пакет 15 + 3",
    description: "15 оплаченных + 3 бесплатно",
    price: 450,
    currency: "BYN",
    lessons_count: 18,
  },
];

function Index() {
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

  const { data: packages } = useQuery({
    queryKey: ["packages", "public"],
    queryFn: async () => {
      const { data } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="relative overflow-hidden px-4 py-12 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <span className="sticker rotate-[-3deg] bg-magenta text-magenta-foreground">
              <Sparkles className="size-3.5" /> набор открыт
            </span>
            <h1 className="mt-5 font-display text-5xl font-black leading-[0.95] md:text-7xl">
              {content?.["hero_title"] ?? "Английский без ступора"}
            </h1>
            <p className="mt-5 max-w-lg text-lg font-medium text-muted-foreground">
              {content?.["hero_subtitle"] ??
                "Помогаю освоить английский для жизни, работы, учебы и переезда за границу."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="party" size="lg">
                <Link to="/auth">Записаться на занятие</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/pricing">Смотреть цены</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="sticker rotate-[-2deg] bg-lime">A1 → B2</span>
              <span className="sticker rotate-[1deg] bg-sun">Разговорный A1 → C1</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -left-6 -top-6 z-10 rotate-[-12deg] rounded-full border-[3px] border-ink bg-primary px-4 py-2 font-display text-sm font-black text-primary-foreground shadow-[4px_4px_0_var(--ink)] animate-wiggle">
              HELLO!
            </div>
            <div className="absolute -bottom-5 -right-4 z-10 rotate-[8deg] rounded-full border-[3px] border-ink bg-lime px-4 py-2 font-display text-sm font-black shadow-[4px_4px_0_var(--ink)] animate-floaty">
              LET&apos;S TALK
            </div>
            <img
              src={teacherPhoto.url}
              alt="Арсений — преподаватель английского"
              className="w-full rotate-[2deg] rounded-3xl border-[4px] border-ink object-cover shadow-[12px_12px_0_var(--ink)]"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-3xl border-[3px] border-ink bg-card p-6 shadow-[6px_6px_0_var(--ink)] md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-black">Помогу тебе</h2>
              <ul className="mt-4 space-y-3 text-lg font-semibold">
                <li>• разобраться с временами</li>
                <li>• задавать вопросы и говорить без ступора</li>
                <li>• подтянуть английский для жизни и работы</li>
                <li>• подготовиться к учебе или переезду</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-sun p-5">
              <p className="font-display text-xl font-black">Первое занятие бесплатно</p>
              <p className="mt-2 font-semibold">
                Определим уровень и поймем, подходим ли мы друг другу.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="https://www.instagram.com/arsusha1398"
                  target="_blank"
                  rel="noreferrer"
                  className="sticker bg-card"
                >
                  <Instagram className="size-4" /> @arsusha1398
                </a>
                <a
                  href="https://t.me/arsusha1398"
                  target="_blank"
                  rel="noreferrer"
                  className="sticker bg-blue text-blue-foreground"
                >
                  <Send className="size-4" /> @arsusha1398
                </a>
              </div>
              <p className="mt-3 text-sm font-bold opacity-70">Также пишите на Kufar</p>
              <p className="mt-2 text-sm font-bold">
                Пробное занятие: 30 минут онлайн или в текстовом формате.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {perks.map((p, i) => (
            <div
              key={p.title}
              className={`pop rounded-3xl p-6 ${p.color} ${i % 2 ? "rotate-[1deg]" : "rotate-[-1deg]"}`}
            >
              <p.icon className="size-8" />
              <h3 className="mt-4 font-display text-xl font-bold">{p.title}</h3>
              <p className="mt-2 font-medium opacity-80">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl border-[3px] border-ink bg-blue p-6 text-blue-foreground shadow-[6px_6px_0_var(--ink)] md:grid-cols-[280px_1fr] md:p-8">
          <img
            src={teacherPhoto.url}
            alt="Арсения — преподаватель английского"
            className="w-full rotate-[-2deg] rounded-3xl border-[4px] border-ink object-cover shadow-[8px_8px_0_var(--ink)]"
          />
          <div>
            <span className="sticker rotate-[2deg] bg-sun text-ink">О себе</span>
            <h2 className="mt-4 font-display text-3xl font-black md:text-4xl">
              Давайте знакомиться
            </h2>
            <p className="mt-4 text-lg font-semibold leading-relaxed">
              Я люблю объяснять сложное простым языком и превращать английский в живой навык, а не
              набор правил.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-card p-4 text-ink">
                <p className="font-display font-black">Слушаю</p>
                <p className="mt-2 text-sm font-semibold">Зарубежную музыку и новые треки</p>
              </div>
              <div className="rounded-2xl bg-lime p-4 text-ink">
                <p className="font-display font-black">Смотрю</p>
                <p className="mt-2 text-sm font-semibold">
                  Зарубежные фильмы и сериалы в оригинале
                </p>
              </div>
              <div className="rounded-2xl bg-sun p-4 text-ink">
                <p className="font-display font-black">Читаю</p>
                <p className="mt-2 text-sm font-semibold">Книги о людях, идеях и саморазвитии</p>
              </div>
            </div>
            <p className="mt-5 font-semibold">
              Вдохновляюсь популярными личностями, которые не боятся учиться новому и идти к своим
              целям.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-4xl font-black md:text-5xl">
            <span className="marker-underline">Пакеты занятий</span>
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(packages?.some((p) => p.title === "Онлайн · 45 минут") ? packages : fallbackPackages)
              .slice(0, 6)
              .map((p, i) => (
                <div
                  key={p.id}
                  className="pop rounded-3xl bg-card p-6"
                  style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
                >
                  <p className="font-display text-lg font-bold">{p.title}</p>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {p.description}
                  </p>
                  <p className="mt-4 font-display text-3xl font-black text-primary">
                    {Number(p.price) === 0 ? "Бесплатно" : money(Number(p.price), p.currency)}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{p.lessons_count} зан.</p>
                </div>
              ))}
          </div>
          <Button asChild variant="party" size="lg" className="mt-8">
            <Link to="/auth">Хочу заниматься</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}

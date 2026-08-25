import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { money, lessonsWord } from "@/lib/format";
import teacherPhoto from "@/assets/teacher.jpg.asset.json";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Цены на занятия английским с Арсенией" },
      {
        name: "description",
        content:
          "Онлайн и офлайн занятия по 45 или 90 минут. В пакете 5 занятий ты получаешь 1 дополнительное бесплатно, в пакете 10 — 2 дополнительных.",
      },
      { property: "og:title", content: "Цены на занятия английским" },
      { property: "og:description", content: "Индивидуальные занятия английским онлайн и вживую." },
    ],
  }),
  component: PricingPage,
});

const colors = [
  "bg-card",
  "bg-lime",
  "bg-sun",
  "bg-blue text-blue-foreground",
  "bg-magenta text-magenta-foreground",
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
    id: "online-5",
    title: "Онлайн · пакет 5",
    description: "5 оплаченных + 1 бесплатно · 45 минут",
    price: 150,
    currency: "BYN",
    lessons_count: 6,
  },
  {
    id: "online-10",
    title: "Онлайн · пакет 10 + 2",
    description: "10 оплаченных + 2 бесплатно · 45 минут",
    price: 300,
    currency: "BYN",
    lessons_count: 12,
  },
  {
    id: "online-15",
    title: "Онлайн · пакет 15 + 3",
    description: "15 оплаченных + 3 бесплатно · 45 минут",
    price: 450,
    currency: "BYN",
    lessons_count: 18,
  },
];

function PricingPage() {
  const { data: packages, isLoading } = useQuery({
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
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8 flex items-center gap-5">
          <img
            src={teacherPhoto.url}
            alt="Преподаватель английского"
            className="size-20 rounded-2xl border-[3px] border-ink object-cover shadow-[4px_4px_0_var(--ink)]"
          />
          <p className="max-w-md font-semibold text-muted-foreground">
            Индивидуальные занятия для жизни, работы, учёбы и переезда.
          </p>
        </div>
        <h1 className="font-display text-4xl font-black md:text-6xl">
          <span className="marker-underline">Цены</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg font-medium text-muted-foreground">
          Онлайн или вживую, 45 или 90 минут. Первое занятие бесплатно: определим уровень и поймем,
          подходим ли мы друг другу.
        </p>
        <p className="mt-3 font-bold text-primary">
          Пробное занятие — 30 минут онлайн или в текстовом формате.
        </p>

        {isLoading && <p className="mt-10 font-semibold">Загружаем тарифы…</p>}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(packages?.some((p) => p.title === "Онлайн · 45 минут")
            ? packages
            : fallbackPackages
          ).map((p, i) => {
            const per = p.lessons_count > 0 ? Number(p.price) / p.lessons_count : 0;
            return (
              <div
                key={p.id}
                className={`pop rounded-3xl p-7 ${colors[i % colors.length]}`}
                style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
              >
                <p className="font-display text-xl font-black">{p.title}</p>
                <p className="mt-2 min-h-10 text-sm font-semibold opacity-80">{p.description}</p>
                <p className="mt-5 font-display text-4xl font-black">
                  {Number(p.price) === 0 ? "0" : money(Number(p.price), p.currency)}
                </p>
                <p className="mt-2 text-sm font-bold opacity-80">
                  {p.lessons_count} {lessonsWord(p.lessons_count)}
                  {per > 0 && ` · ${money(Math.round(per), p.currency)} за занятие`}
                </p>
                <ul className="mt-5 space-y-2 text-sm font-semibold">
                  <li className="flex gap-2">
                    <Check className="size-4 shrink-0" /> Онлайн или офлайн
                  </li>
                  <li className="flex gap-2">
                    <Check className="size-4 shrink-0" /> 45 или 90 минут
                  </li>
                </ul>
                <Button asChild variant="outline" className="mt-6 w-full">
                  <a
                    href={`https://t.me/arsusha1398?text=${encodeURIComponent(`Здравствуйте! Хочу выбрать тариф: ${p.title}`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Написать в Telegram
                  </a>
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}

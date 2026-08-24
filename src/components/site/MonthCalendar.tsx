import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CalendarLesson = {
  id: string;
  studentName: string;
  startsAt: string;
  duration: number;
  format: "online" | "offline";
  status: string;
};

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const statusColors: Record<string, string> = {
  scheduled: "bg-blue text-blue-foreground",
  completed: "bg-lime text-ink",
  cancelled: "bg-muted text-muted-foreground",
  rescheduled: "bg-sun text-ink",
  no_show: "bg-primary text-primary-foreground",
};
const startHour = 8;
const endHour = 22;
const hourHeight = 64;

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

function sameDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString();
}

function formatRange(start: Date, end: Date) {
  return `${start.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function MonthCalendar({ lessons }: { lessons: CalendarLesson[] }) {
  const [week, setWeek] = useState(() => startOfWeek(new Date()));
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(week);
    day.setDate(week.getDate() + index);
    return day;
  });
  const weekEnd = days[6];
  const visibleLessons = lessons.filter((lesson) => {
    const date = new Date(lesson.startsAt);
    return date >= week && date < new Date(weekEnd.getTime() + 24 * 60 * 60 * 1000);
  });

  const shiftWeek = (offset: number) => {
    const next = new Date(week);
    next.setDate(next.getDate() + offset * 7);
    setWeek(next);
  };

  return (
    <div className="pop overflow-hidden rounded-3xl bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink p-4">
        <div>
          <p className="font-display text-xl font-black">Расписание недели</p>
          <p className="text-sm font-semibold capitalize text-muted-foreground">
            {formatRange(week, weekEnd)} · {visibleLessons.length} занятий
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => shiftWeek(-1)}
            aria-label="Предыдущая неделя"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" onClick={() => setWeek(startOfWeek(new Date()))}>
            Сегодня
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => shiftWeek(1)}
            aria-label="Следующая неделя"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[58px_repeat(7,minmax(100px,1fr))] border-b-[3px] border-ink bg-muted/60">
            <div />
            {days.map((day, index) => (
              <div key={day.toISOString()} className="border-l border-ink/20 p-2 text-center">
                <p className="text-xs font-black uppercase">{weekDays[index]}</p>
                <p
                  className={`mx-auto mt-1 flex size-7 items-center justify-center rounded-full text-sm font-black ${sameDay(day, today) ? "bg-primary text-primary-foreground" : ""}`}
                >
                  {day.getDate()}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[58px_repeat(7,minmax(100px,1fr))]">
            <div className="relative" style={{ height: `${(endHour - startHour) * hourHeight}px` }}>
              {Array.from({ length: endHour - startHour }, (_, index) => (
                <span
                  key={index}
                  className="absolute right-2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground"
                  style={{ top: `${index * hourHeight}px` }}
                >
                  {String(startHour + index).padStart(2, "0")}:00
                </span>
              ))}
            </div>
            {days.map((day) => {
              const dayLessons = visibleLessons.filter((lesson) =>
                sameDay(new Date(lesson.startsAt), day),
              );
              return (
                <div
                  key={day.toISOString()}
                  className="relative border-l border-ink/20"
                  style={{
                    height: `${(endHour - startHour) * hourHeight}px`,
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, transparent 0, transparent 63px, color-mix(in oklab, var(--ink) 14%, transparent) 64px)",
                  }}
                >
                  {dayLessons.map((lesson) => {
                    const date = new Date(lesson.startsAt);
                    const minutes = date.getHours() * 60 + date.getMinutes() - startHour * 60;
                    return (
                      <div
                        key={lesson.id}
                        className={`absolute left-1 right-1 overflow-hidden rounded-lg border-2 border-ink px-2 py-1 text-xs font-bold shadow-[2px_2px_0_var(--ink)] ${statusColors[lesson.status] ?? "bg-card"}`}
                        style={{
                          top: `${Math.max(0, minutes / 60) * hourHeight}px`,
                          minHeight: `${Math.max(30, (lesson.duration / 60) * hourHeight)}px`,
                        }}
                        title={`${lesson.studentName} · ${lesson.duration} минут`}
                      >
                        <span className="block truncate">
                          {date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}{" "}
                          -{" "}
                          {new Date(date.getTime() + lesson.duration * 60000).toLocaleTimeString(
                            "ru-RU",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                        <span className="block truncate">{lesson.studentName}</span>
                        <span className="block truncate text-[10px] opacity-75">
                          {lesson.format === "online" ? "Онлайн" : "Вживую"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

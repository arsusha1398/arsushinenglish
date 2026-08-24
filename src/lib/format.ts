export const LESSON_STATUS_LABEL: Record<string, string> = {
  scheduled: "Запланировано",
  completed: "Проведено",
  cancelled: "Отменено",
  rescheduled: "Перенесено",
  no_show: "Не пришёл",
};

export const LESSON_STATUS_CLASS: Record<string, string> = {
  scheduled: "bg-blue text-blue-foreground",
  completed: "bg-lime text-ink",
  cancelled: "bg-muted text-muted-foreground",
  rescheduled: "bg-sun text-ink",
  no_show: "bg-primary text-primary-foreground",
};

export const TX_REASON_LABEL: Record<string, string> = {
  payment: "Оплата",
  lesson_completed: "Занятие проведено",
  manual_correction: "Ручная корректировка",
  no_show_charge: "Списание за неявку",
  reversal: "Сторно",
};

export const HW_STATUS_LABEL: Record<string, string> = {
  new: "Новое",
  in_progress: "Выполняется",
  submitted: "Отправлено на проверку",
  reviewed: "Проверено",
};

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function money(n: number, currency = "BYN") {
  return `${Number(n).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ${currency}`;
}

export function lessonsWord(n: number) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return "занятий";
  if (last > 1 && last < 5) return "занятия";
  if (last === 1) return "занятие";
  return "занятий";
}

export function toLocalInput(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

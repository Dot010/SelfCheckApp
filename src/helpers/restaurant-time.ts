// Restaurants work in local time, but servers usually run in UTC. These helpers
// answer "what day/time is it at the restaurant?" whatever the server's zone.

export const RESTAURANT_TIME_ZONE = "America/Sao_Paulo";

const parts = (date: Date, timeZone: string) => {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hourCycle: "h23",
      timeZoneName: "longOffset",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return values as Record<string, string>;
};

// Midnight today at the restaurant, as a Date (an exact instant).
export const startOfToday = (
  now = new Date(),
  timeZone = RESTAURANT_TIME_ZONE,
) => {
  const p = parts(now, timeZone);
  const offset = p.timeZoneName === "GMT" ? "Z" : p.timeZoneName.slice(3);
  return new Date(`${p.year}-${p.month}-${p.day}T00:00:00${offset}`);
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Weekday (0 = Sunday) and minutes since midnight at the restaurant.
export const localClock = (
  now = new Date(),
  timeZone = RESTAURANT_TIME_ZONE,
) => {
  const p = parts(now, timeZone);
  return {
    weekday: WEEKDAYS.indexOf(p.weekday),
    minutes: Number(p.hour) * 60 + Number(p.minute),
  };
};

export interface OpeningHoursLike {
  weekday: number;
  opensAt: string;
  closesAt: string;
}

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const WEEKDAY_NAMES = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

// Whether the restaurant is open now and a short label for customers, e.g.
// "Aberto até 23:00" or "Abre amanhã às 09:00".
export const getOpenStatus = (
  hours: OpeningHoursLike[],
  now = new Date(),
  timeZone = RESTAURANT_TIME_ZONE,
) => {
  const { weekday, minutes } = localClock(now, timeZone);
  const byDay = new Map(hours.map((h) => [h.weekday, h]));

  // Still open from yesterday's shift that runs past midnight?
  const yesterday = byDay.get((weekday + 6) % 7);
  if (
    yesterday &&
    toMinutes(yesterday.closesAt) < toMinutes(yesterday.opensAt) &&
    minutes < toMinutes(yesterday.closesAt)
  ) {
    return { isOpen: true, label: `Aberto até ${yesterday.closesAt}` };
  }

  const today = byDay.get(weekday);
  if (today) {
    const opens = toMinutes(today.opensAt);
    const closes = toMinutes(today.closesAt);
    const overnight = closes < opens;
    if (minutes >= opens && (overnight || minutes < closes)) {
      return { isOpen: true, label: `Aberto até ${today.closesAt}` };
    }
    if (minutes < opens) {
      return { isOpen: false, label: `Abre hoje às ${today.opensAt}` };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const next = byDay.get((weekday + offset) % 7);
    if (next) {
      const day =
        offset === 1 ? "amanhã" : WEEKDAY_NAMES[(weekday + offset) % 7];
      return { isOpen: false, label: `Abre ${day} às ${next.opensAt}` };
    }
  }
  return { isOpen: false, label: "Fechado" };
};

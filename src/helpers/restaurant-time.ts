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

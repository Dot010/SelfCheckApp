import { describe, expect, it } from "vitest";

import {
  getOpenStatus,
  localClock,
  startOfToday,
} from "@/helpers/restaurant-time";

// São Paulo is UTC-3 all year. 2026-10-05 is a Monday.
const at = (iso: string) => new Date(iso);

const everyDay = (opensAt: string, closesAt: string) =>
  [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opensAt, closesAt }));

describe("localClock", () => {
  it("uses the restaurant's time zone, not the server's", () => {
    // 02:30 UTC on Monday is still 23:30 on Sunday in São Paulo.
    expect(localClock(at("2026-10-05T02:30:00Z"))).toEqual({
      weekday: 0,
      minutes: 23 * 60 + 30,
    });
  });
});

describe("startOfToday", () => {
  it("returns local midnight as an instant", () => {
    expect(startOfToday(at("2026-10-05T15:00:00Z")).toISOString()).toBe(
      "2026-10-05T03:00:00.000Z",
    );
    expect(startOfToday(at("2026-10-05T02:00:00Z")).toISOString()).toBe(
      "2026-10-04T03:00:00.000Z",
    );
  });
});

describe("getOpenStatus", () => {
  const hours = everyDay("09:00", "23:00");

  it("is open during the shift", () => {
    expect(getOpenStatus(hours, at("2026-10-05T15:00:00Z"))).toEqual({
      isOpen: true,
      label: "Aberto até 23:00",
    });
  });

  it("says when it opens later today", () => {
    expect(getOpenStatus(hours, at("2026-10-05T10:00:00Z"))).toEqual({
      isOpen: false,
      label: "Abre hoje às 09:00",
    });
  });

  it("says it opens tomorrow after closing", () => {
    expect(getOpenStatus(hours, at("2026-10-06T02:30:00Z"))).toEqual({
      isOpen: false,
      label: "Abre amanhã às 09:00",
    });
  });

  it("names the next open day when closed for a while", () => {
    // Open only on Wednesdays; now is Monday afternoon.
    const wednesdays = [{ weekday: 3, opensAt: "10:00", closesAt: "18:00" }];
    expect(getOpenStatus(wednesdays, at("2026-10-05T15:00:00Z"))).toEqual({
      isOpen: false,
      label: "Abre quarta às 10:00",
    });
  });

  it("handles shifts that run past midnight", () => {
    const nights = everyDay("18:00", "02:00");
    // Monday 23:00 and Tuesday 01:00 local.
    expect(getOpenStatus(nights, at("2026-10-06T02:00:00Z")).isOpen).toBe(true);
    expect(getOpenStatus(nights, at("2026-10-06T04:00:00Z"))).toEqual({
      isOpen: true,
      label: "Aberto até 02:00",
    });
    // Tuesday 03:00 local: closed until the evening.
    expect(getOpenStatus(nights, at("2026-10-06T06:00:00Z"))).toEqual({
      isOpen: false,
      label: "Abre hoje às 18:00",
    });
  });

  it("is closed when there are no hours", () => {
    expect(getOpenStatus([], at("2026-10-05T15:00:00Z"))).toEqual({
      isOpen: false,
      label: "Fechado",
    });
  });
});

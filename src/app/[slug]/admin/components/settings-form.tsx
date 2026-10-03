"use client";

import { OpeningHours } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  saveOpeningHours,
  setOrdersPaused,
  updateRestaurantDetails,
} from "../actions/settings";

const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

interface SettingsFormProps {
  slug: string;
  isPaused: boolean;
  name: string;
  description: string;
  openingHours: Pick<OpeningHours, "weekday" | "opensAt" | "closesAt">[];
}

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border sm:p-6">
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
  </section>
);

const SettingsForm = ({
  slug,
  isPaused,
  name,
  description,
  openingHours,
}: SettingsFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [details, setDetails] = useState({ name, description });
  const [week, setWeek] = useState(() =>
    WEEKDAYS.map((_, weekday) => {
      const day = openingHours.find((h) => h.weekday === weekday);
      return {
        weekday,
        isOpen: Boolean(day),
        opensAt: day?.opensAt ?? "09:00",
        closesAt: day?.closesAt ?? "23:00",
      };
    }),
  );

  const togglePause = (paused: boolean) =>
    startTransition(async () => {
      await setOrdersPaused(slug, paused);
      toast.success(paused ? "Pedidos pausados" : "Recebendo pedidos");
    });

  const saveDetails = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateRestaurantDetails(slug, details);
      if (result.ok) toast.success("Dados salvos");
      else toast.error(result.error);
    });
  };

  const saveHours = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveOpeningHours(
        slug,
        week
          .filter((day) => day.isOpen)
          .map(({ weekday, opensAt, closesAt }) => ({
            weekday,
            opensAt,
            closesAt,
          })),
      );
      if (result.ok) toast.success("Horários salvos");
      else toast.error(result.error);
    });
  };

  const updateDay = (weekday: number, change: Partial<(typeof week)[number]>) =>
    setWeek((days) =>
      days.map((day) =>
        day.weekday === weekday ? { ...day, ...change } : day,
      ),
    );

  return (
    <>
      <Section
        title="Pausar pedidos"
        description="Para horários de pico ou imprevistos. O cardápio continua visível, mas ninguém consegue finalizar pedidos."
      >
        <label className="flex items-center gap-3 font-medium">
          <Switch
            checked={isPaused}
            disabled={isPending}
            onChange={(event) => togglePause(event.target.checked)}
          />
          {isPaused ? "Pedidos pausados" : "Recebendo pedidos"}
        </label>
      </Section>

      <Section title="Dados do restaurante">
        <form onSubmit={saveDetails} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant-name">Nome</Label>
            <Input
              id="restaurant-name"
              value={details.name}
              maxLength={60}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurant-description">Descrição</Label>
            <Input
              id="restaurant-description"
              value={details.description}
              maxLength={140}
              onChange={(e) =>
                setDetails({ ...details, description: e.target.value })
              }
            />
          </div>
          <Button
            type="submit"
            className="self-start rounded-full"
            disabled={isPending}
          >
            Salvar dados
          </Button>
        </form>
      </Section>

      <Section
        title="Horário de funcionamento"
        description="Fora desses horários o cardápio mostra quando a loja abre e não aceita pedidos. Fechamento antes da abertura vale como depois da meia-noite."
      >
        <form onSubmit={saveHours} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.weekday}
              className="flex flex-wrap items-center gap-3 border-b py-3 last:border-0"
            >
              <label className="flex w-32 items-center gap-3 text-sm font-medium">
                <Switch
                  checked={day.isOpen}
                  onChange={(e) =>
                    updateDay(day.weekday, { isOpen: e.target.checked })
                  }
                  aria-label={`Abre ${WEEKDAYS[day.weekday]}`}
                />
                {WEEKDAYS[day.weekday]}
              </label>
              {day.isOpen ? (
                <div className="flex items-center gap-2 text-sm">
                  <Input
                    type="time"
                    value={day.opensAt}
                    aria-label={`${WEEKDAYS[day.weekday]}: abre às`}
                    onChange={(e) =>
                      updateDay(day.weekday, { opensAt: e.target.value })
                    }
                    className="w-28"
                  />
                  até
                  <Input
                    type="time"
                    value={day.closesAt}
                    aria-label={`${WEEKDAYS[day.weekday]}: fecha às`}
                    onChange={(e) =>
                      updateDay(day.weekday, { closesAt: e.target.value })
                    }
                    className="w-28"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Fechado</span>
              )}
            </div>
          ))}
          <Button
            type="submit"
            className="mt-3 self-start rounded-full"
            disabled={isPending}
          >
            Salvar horários
          </Button>
        </form>
      </Section>
    </>
  );
};

export default SettingsForm;

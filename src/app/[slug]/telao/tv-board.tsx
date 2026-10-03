"use client";

import { Volume2Icon, VolumeXIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { RESTAURANT_TIME_ZONE } from "@/helpers/restaurant-time";
import { cn } from "@/lib/utils";

interface TvBoardProps {
  name: string;
  logo: string;
  preparing: number[];
  ready: number[];
}

const clockFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: RESTAURANT_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

// A short two-note chime made with the Web Audio API (no sound file needed).
const playChime = (context: AudioContext) => {
  [880, 1320].forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + i * 0.18;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.55);
  });
};

const TvBoard = ({ name, logo, preparing, ready }: TvBoardProps) => {
  const [now, setNow] = useState(() => new Date());
  const [fresh, setFresh] = useState<number[]>([]);
  const seenReady = useRef<Set<number> | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  // Highlight (and chime for) numbers that just became ready.
  const readyKey = ready.join(",");
  useEffect(() => {
    const current = readyKey ? readyKey.split(",").map(Number) : [];
    if (!seenReady.current) {
      seenReady.current = new Set(current);
      return;
    }
    const newOnes = current.filter((id) => !seenReady.current!.has(id));
    seenReady.current = new Set(current);
    if (newOnes.length === 0) return;
    setFresh(newOnes);
    if (audio.current) playChime(audio.current);
    const timeout = setTimeout(() => setFresh([]), 8000);
    return () => clearTimeout(timeout);
  }, [readyKey]);

  // Browsers only allow sound after a click, so the TV needs one tap.
  const toggleSound = () => {
    if (soundOn) {
      audio.current?.close();
      audio.current = null;
      setSoundOn(false);
      return;
    }
    audio.current = new AudioContext();
    playChime(audio.current);
    setSoundOn(true);
  };

  return (
    <main className="min-h-dvh bg-[#1E1426] px-4 py-6 text-white sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={logo}
              alt=""
              width={56}
              height={56}
              className="rounded-2xl"
            />
            <span className="font-display text-3xl font-extrabold">{name}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleSound}
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              {soundOn ? (
                <Volume2Icon className="h-4 w-4" />
              ) : (
                <VolumeXIcon className="h-4 w-4" />
              )}
              {soundOn ? "Som ligado" : "Ativar som"}
            </button>
            <span
              className="font-display text-3xl font-bold tabular-nums text-white/70"
              suppressHydrationWarning
            >
              {clockFormatter.format(now)}
            </span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="flex min-h-[60vh] flex-col gap-5 rounded-[2rem] bg-[#2D2038] p-6 sm:p-8">
            <h1 className="text-3xl font-extrabold sm:text-4xl">Preparando</h1>
            {preparing.length === 0 ? (
              <p className="text-xl text-white/60">Nenhum pedido em preparo.</p>
            ) : (
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-4">
                {preparing.map((id) => (
                  <li
                    key={id}
                    className="flex h-28 items-center justify-center rounded-3xl bg-white/10 font-display text-5xl font-extrabold tabular-nums"
                  >
                    {id}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex min-h-[60vh] flex-col gap-5 rounded-[2rem] bg-[#B8E04A] p-6 text-[#1E1426] sm:p-8">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Pronto, pode retirar!
            </h2>
            {ready.length === 0 ? (
              <p className="text-xl text-[#1E1426]/70">
                Quando um pedido ficar pronto, o número aparece aqui.
              </p>
            ) : (
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-4">
                {ready.map((id) => (
                  <li
                    key={id}
                    className={cn(
                      "flex h-36 items-center justify-center rounded-3xl bg-white font-display text-7xl font-extrabold tabular-nums",
                      fresh.includes(id) &&
                        "bg-[#1E1426] text-[#B8E04A] duration-500 animate-in zoom-in-50",
                    )}
                  >
                    {id}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default TvBoard;

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { CartContext } from "../menu/contexts/cart";
import { forgetCustomer } from "../orders/actions/customer";

const IDLE_SECONDS = 60;
const COUNTDOWN_SECONDS = 15;

// On a self-service kiosk, the next customer must start from scratch: no cart
// and no access to the previous customer's orders. The device is switched to
// kiosk mode once by opening any page with ?totem=1 (and back with ?totem=0).
const KioskMode = ({ slug }: { slug: string }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { clearCart } = useContext(CartContext);
  const storageKey = `kiosk:${slug}`;

  const [isKiosk, setIsKiosk] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    const param = searchParams.get("totem");
    try {
      if (param === "1") localStorage.setItem(storageKey, "1");
      if (param === "0") localStorage.removeItem(storageKey);
      setIsKiosk(localStorage.getItem(storageKey) === "1");
    } catch {
      setIsKiosk(param === "1");
    }
  }, [searchParams, storageKey]);

  const reset = useCallback(async () => {
    setSecondsLeft(null);
    clearCart();
    await forgetCustomer();
    router.push(`/${slug}`);
  }, [clearCart, router, slug]);

  // Staff pages and the welcome screen itself never time out.
  const isCustomerFlow =
    pathname !== `/${slug}` &&
    !pathname.startsWith(`/${slug}/admin`) &&
    !pathname.startsWith(`/${slug}/telao`);
  const isActive = isKiosk && isCustomerFlow;

  useEffect(() => {
    if (!isActive) return;
    lastActivity.current = Date.now();
    const touch = () => {
      lastActivity.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "input"] as const;
    events.forEach((e) =>
      window.addEventListener(e, touch, { passive: true, capture: true }),
    );
    const id = setInterval(() => {
      const idle = (Date.now() - lastActivity.current) / 1000;
      setSecondsLeft((current) => {
        if (current !== null) return current; // countdown already running
        return idle >= IDLE_SECONDS ? COUNTDOWN_SECONDS : null;
      });
    }, 1000);
    return () => {
      clearInterval(id);
      events.forEach((e) =>
        window.removeEventListener(e, touch, { capture: true }),
      );
    };
  }, [isActive, pathname]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      reset();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, reset]);

  const keepGoing = () => {
    lastActivity.current = Date.now();
    setSecondsLeft(null);
  };

  return (
    <Dialog
      open={isActive && secondsLeft !== null}
      onOpenChange={(open) => !open && keepGoing()}
    >
      <DialogContent className="max-w-sm rounded-3xl text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-highlight font-display text-3xl font-extrabold tabular-nums">
          {secondsLeft}
        </span>
        <DialogTitle className="text-2xl">Ainda está aí?</DialogTitle>
        <DialogDescription>
          Se ninguém tocar na tela, a sacola é limpa e o totem volta ao início
          para o próximo cliente.
        </DialogDescription>
        <Button size="lg" className="rounded-full" onClick={keepGoing}>
          Continuar meu pedido
        </Button>
        <Button variant="ghost" className="rounded-full" onClick={reset}>
          Recomeçar agora
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default KioskMode;

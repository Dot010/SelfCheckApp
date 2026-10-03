"use client";

import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useRef } from "react";
import { toast } from "sonner";

import { CartContext } from "../../menu/contexts/cart";

// Shown once when Stripe sends the customer back after paying.
const CheckoutSuccess = () => {
  const { clearCart } = useContext(CartContext);
  const router = useRouter();
  const pathname = usePathname();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    clearCart();
    toast.success("Pedido enviado! Acompanhe o status por aqui.");
    router.replace(pathname);
  }, [clearCart, router, pathname]);

  return null;
};

export default CheckoutSuccess;

"use client";

import { useContext } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

import { CartContext } from "../contexts/cart";
import CartPanel from "./cart-panel";

// Cart for phones and tablets; on desktop the cart is always visible instead.
const CartSheet = () => {
  const { isOpen, toggleCart } = useContext(CartContext);
  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] overflow-y-auto rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:hidden"
      >
        <SheetTitle className="sr-only">Sacola</SheetTitle>
        <SheetDescription className="sr-only">
          Itens escolhidos e total do pedido
        </SheetDescription>
        <div className="mx-auto max-w-xl">
          <CartPanel />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;

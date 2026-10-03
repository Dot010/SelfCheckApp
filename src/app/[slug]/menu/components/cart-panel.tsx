"use client";

import { ShoppingBagIcon } from "lucide-react";
import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helpers/format-currency";

import { CartContext } from "../contexts/cart";
import CartProductItem from "./cart-product-item";
import FinishOrderDialog from "./finish-order-dialog";

// The cart contents, shared by the desktop sidebar and the mobile sheet.
const CartPanel = () => {
  const [finishOrderDialogIsOpen, setFinishOrderDialogIsOpen] = useState(false);
  const { products, total, totalQuantity } = useContext(CartContext);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Sacola</h2>
        {totalQuantity > 0 && (
          <span className="text-sm text-muted-foreground">
            {totalQuantity} {totalQuantity > 1 ? "itens" : "item"}
          </span>
        )}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
          <ShoppingBagIcon className="h-8 w-8" />
          <p>Sua sacola está vazia. Escolha um item para começar.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {products.map((product) => (
            <CartProductItem key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4 font-semibold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <Button
        size="lg"
        className="w-full rounded-full"
        disabled={products.length === 0}
        onClick={() => setFinishOrderDialogIsOpen(true)}
      >
        Finalizar pedido
      </Button>
      <FinishOrderDialog
        open={finishOrderDialogIsOpen}
        onOpenChange={setFinishOrderDialogIsOpen}
      />
    </div>
  );
};

export default CartPanel;

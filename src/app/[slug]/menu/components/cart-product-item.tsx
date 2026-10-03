import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helpers/format-currency";

import { CartContext, CartItem } from "../contexts/cart";

interface CartProductItemProps {
  item: CartItem;
}

const CartProductItem = ({ item }: CartProductItemProps) => {
  const { decreaseQuantity, increaseQuantity } = useContext(CartContext);
  const details = [
    item.options.map((option) => option.name).join(", "),
    item.notes && `"${item.notes}"`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-secondary">
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="56px"
          className="object-contain p-1"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.name}</p>
        {details && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {details}
          </p>
        )}
        <p className="text-sm font-semibold">
          {formatCurrency(item.unitPrice * item.quantity)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-xl"
          aria-label={
            item.quantity === 1
              ? `Remover ${item.name}`
              : `Diminuir ${item.name}`
          }
          onClick={() => decreaseQuantity(item.key)}
        >
          {item.quantity === 1 ? <Trash2Icon /> : <MinusIcon />}
        </Button>
        <span className="w-6 text-center text-sm font-semibold">
          {item.quantity}
        </span>
        <Button
          size="icon"
          className="h-8 w-8 rounded-xl"
          aria-label={`Aumentar ${item.name}`}
          onClick={() => increaseQuantity(item.key)}
        >
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
};

export default CartProductItem;

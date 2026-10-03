import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helpers/format-currency";

import { CartContext, CartProduct } from "../contexts/cart";

interface CartItemProps {
  product: CartProduct;
}

const CartProductItem = ({ product }: CartItemProps) => {
  const { decreaseProductQuantity, increaseProductQuantity } =
    useContext(CartContext);

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-secondary">
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="56px"
          className="object-contain p-1"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-sm font-semibold">
          {formatCurrency(product.price * product.quantity)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-xl"
          aria-label={
            product.quantity === 1
              ? `Remover ${product.name}`
              : `Diminuir ${product.name}`
          }
          onClick={() => decreaseProductQuantity(product.id)}
        >
          {product.quantity === 1 ? <Trash2Icon /> : <MinusIcon />}
        </Button>
        <span className="w-6 text-center text-sm font-semibold">
          {product.quantity}
        </span>
        <Button
          size="icon"
          className="h-8 w-8 rounded-xl"
          aria-label={`Aumentar ${product.name}`}
          onClick={() => increaseProductQuantity(product.id)}
        >
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
};

export default CartProductItem;

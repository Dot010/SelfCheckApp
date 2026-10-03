"use client";

import { Prisma } from "@prisma/client";
import { MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helpers/format-currency";
import {
  defaultOptionIds,
  resolveSelectedOptions,
} from "@/helpers/product-options";

import { CartContext } from "../../contexts/cart";

const MAX_QUANTITY = 20;

interface ProductDetailsProps {
  product: Prisma.ProductGetPayload<{
    include: {
      restaurant: {
        select: {
          name: true;
          avatarImageUrl: true;
        };
      };
      optionGroups: { include: { options: true } };
    };
  }>;
  menuUrl: string;
}

const ProductDetails = ({ product, menuUrl }: ProductDetailsProps) => {
  const { addItem } = useContext(CartContext);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const selection = resolveSelectedOptions(
    product.optionGroups,
    defaultOptionIds(product.optionGroups),
  );
  const unitPrice = product.price + (selection.ok ? selection.extraPrice : 0);

  const handleAddToCart = () => {
    if (!selection.ok) {
      toast.error(selection.error);
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPrice,
      quantity,
      options: selection.options.map(({ id, name }) => ({ id, name })),
    });
    toast.success(`${product.name} na sacola`);
    router.push(menuUrl);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Image
            src={product.restaurant.avatarImageUrl}
            alt=""
            width={20}
            height={20}
            className="rounded-md"
          />
          {product.restaurant.name}
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
        <p className="text-2xl font-semibold">{formatCurrency(unitPrice)}</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Sobre</h2>
        <p className="leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      </section>

      {product.ingredients.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Ingredientes</h2>
          <ul className="flex flex-wrap gap-2">
            {product.ingredients.map((ingredient) => (
              <li
                key={ingredient}
                className="rounded-full bg-secondary px-3 py-1.5 text-sm"
              >
                {ingredient}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Fixed to the bottom on phones, inline on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t bg-card px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:static lg:border-0 lg:bg-transparent lg:p-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl"
            aria-label="Diminuir quantidade"
            disabled={quantity === 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <MinusIcon />
          </Button>
          <span className="w-6 text-center text-lg font-semibold">
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl"
            aria-label="Aumentar quantidade"
            disabled={quantity === MAX_QUANTITY}
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
          >
            <PlusIcon />
          </Button>
        </div>
        <Button
          size="lg"
          className="h-12 flex-1 rounded-full text-base"
          onClick={handleAddToCart}
        >
          Adicionar · {formatCurrency(unitPrice * quantity)}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetails;

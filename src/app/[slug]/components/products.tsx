import { ConsumptionMethod, Product } from "@prisma/client";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@/helpers/format-currency";

interface ProductsProps {
  slug: string;
  consumptionMethod: ConsumptionMethod;
  products: Product[];
}

const Products = ({ slug, consumptionMethod, products }: ProductsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/${slug}/menu/${product.id}?consumptionMethod=${consumptionMethod}`}
          className="group flex flex-col overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="relative aspect-[5/4] bg-secondary">
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
              className="object-contain p-3 transition group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
            <h3 className="font-sans text-sm font-semibold leading-snug tracking-normal">
              {product.name}
            </h3>
            <p className="hidden text-xs leading-relaxed text-muted-foreground sm:line-clamp-2">
              {product.description}
            </p>
            <div className="mt-auto flex items-center justify-between pt-2">
              <span className="text-sm font-semibold">
                {formatCurrency(product.price)}
              </span>
              <span
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-full bg-highlight text-highlight-foreground"
              >
                <PlusIcon className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Products;

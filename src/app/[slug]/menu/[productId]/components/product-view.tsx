"use client";

import { Prisma } from "@prisma/client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

import { defaultOptionIds } from "@/helpers/product-options";
import { sizeScales, toppingColors } from "@/helpers/topping-visuals";

import ProductDetails from "./products-details";

// three.js is only downloaded on pages that show the 3D bowl.
const Bowl3D = dynamic(() => import("./bowl-3d"), { ssr: false });

type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    restaurant: { select: { name: true; avatarImageUrl: true } };
    optionGroups: { include: { options: true } };
  };
}>;

interface ProductViewProps {
  product: ProductWithDetails;
  menuUrl: string;
}

const ProductView = ({ product, menuUrl }: ProductViewProps) => {
  const [selectedIds, setSelectedIds] = useState(() =>
    defaultOptionIds(product.optionGroups),
  );

  const options = product.optionGroups.flatMap((group) => group.options);
  const has3D = options.some(
    (option) => option.visualKey && option.visualKey in toppingColors,
  );
  const selectedKeys = options
    .filter((option) => selectedIds.includes(option.id) && option.visualKey)
    .map((option) => option.visualKey!);
  const scale = selectedKeys.map((key) => sizeScales[key]).find(Boolean) ?? 1;
  const toppings = selectedKeys.filter((key) => key in toppingColors);

  const image = (
    <Image
      src={product.imageUrl}
      alt={product.name}
      fill
      priority
      sizes="(min-width: 1024px) 560px, 90vw"
      className="object-contain p-6 lg:p-10"
    />
  );

  return (
    <div className="mt-4 grid items-start gap-6 lg:mt-6 lg:grid-cols-2 lg:gap-12">
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] bg-secondary lg:sticky lg:top-6 lg:max-w-none">
        {has3D ? (
          <Bowl3D scale={scale} toppings={toppings} fallback={image} />
        ) : (
          image
        )}
      </div>
      <ProductDetails
        product={product}
        menuUrl={menuUrl}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
};

export default ProductView;

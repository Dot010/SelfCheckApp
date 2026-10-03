import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";

import ProductDetails from "./components/products-details";

interface ProductPageProps {
  params: Promise<{ slug: string; productId: string }>;
  searchParams: Promise<{ consumptionMethod?: string; category?: string }>;
}

const ProductPage = async ({ params, searchParams }: ProductPageProps) => {
  const { slug, productId } = await params;
  const { consumptionMethod = "", category } = await searchParams;

  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      restaurant: {
        select: {
          name: true,
          avatarImageUrl: true,
          slug: true,
        },
      },
    },
  });
  if (!product || product.restaurant.slug !== slug) {
    return notFound();
  }

  const menuQuery = new URLSearchParams({ consumptionMethod });
  if (category) menuQuery.set("category", category);
  const menuUrl = `/${slug}/menu?${menuQuery}`;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-4 lg:px-6 lg:pb-12 lg:pt-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="secondary" className="rounded-full">
          <Link href={menuUrl}>
            <ChevronLeftIcon />
            Cardápio
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          size="icon"
          className="rounded-full"
        >
          <Link href={`/${slug}/orders`} aria-label="Meus pedidos">
            <ScrollTextIcon />
          </Link>
        </Button>
      </div>

      <div className="mt-4 grid items-start gap-6 lg:mt-6 lg:grid-cols-2 lg:gap-12">
        <div className="relative mx-auto aspect-square w-full max-w-md rounded-[2rem] bg-secondary lg:sticky lg:top-6 lg:max-w-none">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 560px, 90vw"
            className="object-contain p-6 lg:p-10"
          />
        </div>
        <ProductDetails product={product} menuUrl={menuUrl} />
      </div>
    </main>
  );
};

export default ProductPage;

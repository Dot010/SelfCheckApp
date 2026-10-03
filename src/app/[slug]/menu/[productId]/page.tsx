import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";

import ProductView from "./components/product-view";

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
      optionGroups: {
        orderBy: { position: "asc" },
        include: { options: { orderBy: { position: "asc" } } },
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

      <ProductView product={product} menuUrl={menuUrl} />
    </main>
  );
};

export default ProductPage;

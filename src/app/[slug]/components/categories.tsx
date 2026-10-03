"use client";

import { ConsumptionMethod, Prisma } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helpers/format-currency";
import { cn } from "@/lib/utils";

import CartPanel from "../menu/components/cart-panel";
import CartSheet from "../menu/components/cart-sheet";
import { CartContext } from "../menu/contexts/cart";
import Products from "./products";

interface RestaurantCategoriesProps {
  restaurant: Prisma.RestaurantGetPayload<{
    include: {
      menuCategories: {
        include: { products: true };
      };
    };
  }>;
  consumptionMethod: ConsumptionMethod;
}

const RestaurantCategories = ({
  restaurant,
  consumptionMethod,
}: RestaurantCategoriesProps) => {
  // The selected category lives in the URL too, so coming back from a
  // product page (or reloading) keeps the customer where they were.
  const searchParams = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    searchParams.get("category") ?? restaurant.menuCategories[0]?.id,
  );
  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const params = new URLSearchParams(searchParams);
    params.set("category", categoryId);
    window.history.replaceState(null, "", `?${params}`);
  };
  const selectedCategory =
    restaurant.menuCategories.find((c) => c.id === selectedCategoryId) ??
    restaurant.menuCategories[0];

  const { products, total, totalQuantity, toggleCart } =
    useContext(CartContext);

  return (
    <div className="mx-auto mt-6 max-w-6xl px-4 lg:grid lg:grid-cols-[180px_minmax(0,1fr)_320px] lg:items-start lg:gap-8 lg:px-6">
      {/* Categories: a scrolling row on phones, a sticky list on desktop */}
      <nav
        aria-label="Categorias"
        className="sticky top-0 z-20 -mx-4 flex gap-2 overflow-x-auto bg-background px-4 py-3 [scrollbar-width:none] lg:top-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:bg-transparent lg:p-0"
      >
        {restaurant.menuCategories.map((category) => {
          const isSelected = category.id === selectedCategory?.id;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => selectCategory(category.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground lg:bg-transparent lg:ring-0",
              )}
            >
              {category.name}
            </button>
          );
        })}
      </nav>

      <section className="pb-28 pt-2 lg:pb-12 lg:pt-0">
        <h2 className="mb-4 text-2xl font-bold">{selectedCategory?.name}</h2>
        <Products
          slug={restaurant.slug}
          consumptionMethod={consumptionMethod}
          categoryId={selectedCategory?.id}
          products={selectedCategory?.products ?? []}
        />
      </section>

      {/* Desktop: the cart stays beside the menu */}
      <aside className="hidden rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border lg:sticky lg:top-6 lg:block">
        <CartPanel />
      </aside>

      {/* Phones and tablets: floating bar that opens the cart as a sheet */}
      {products.length > 0 && (
        <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full bg-foreground py-2 pl-6 pr-2 text-background shadow-lg lg:hidden">
          <div>
            <p className="text-xs opacity-75">
              {totalQuantity} {totalQuantity > 1 ? "itens" : "item"}
            </p>
            <p className="font-semibold">{formatCurrency(total)}</p>
          </div>
          <Button
            onClick={toggleCart}
            className="rounded-full bg-highlight text-highlight-foreground hover:bg-highlight/90"
          >
            Ver sacola
          </Button>
        </div>
      )}
      <CartSheet />
    </div>
  );
};

export default RestaurantCategories;

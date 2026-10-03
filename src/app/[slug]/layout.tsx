import type { Metadata } from "next";

import { getRestaurantBySlug } from "@/data/get-restaurant-by-slug";

import { CartProvider } from "./menu/contexts/cart";

interface RestaurantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({
  params,
}: Pick<RestaurantLayoutProps, "params">): Promise<Metadata> => {
  const restaurant = await getRestaurantBySlug((await params).slug);
  if (!restaurant) return {};
  return {
    title: restaurant.name,
    description: restaurant.description,
    icons: { icon: restaurant.avatarImageUrl },
  };
};

const RestaurantLayout = async ({
  children,
  params,
}: RestaurantLayoutProps) => {
  const { slug } = await params;
  return (
    <CartProvider key={slug} storageKey={`cart:${slug}`}>
      {children}
    </CartProvider>
  );
};

export default RestaurantLayout;

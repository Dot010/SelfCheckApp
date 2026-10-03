import { ConsumptionMethod } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/prisma";

import RestaurantCategories from "../components/categories";
import RestaurantHeader from "./components/header";

interface RestaurantMenuPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ consumptionMethod?: string }>;
}

const isConsumptionMethod = (value: string): value is ConsumptionMethod =>
  Object.values(ConsumptionMethod).includes(value as ConsumptionMethod);

const RestaurantMenuPage = async ({
  params,
  searchParams,
}: RestaurantMenuPageProps) => {
  const { slug } = await params;
  const { consumptionMethod } = await searchParams;

  // Without a valid method the order can't be created, so send the customer
  // back to choose one instead of crashing on a missing query param.
  const method = consumptionMethod?.toUpperCase() ?? "";
  if (!isConsumptionMethod(method)) {
    redirect(`/${slug}`);
  }
  if (method !== consumptionMethod) {
    redirect(`/${slug}/menu?consumptionMethod=${method}`);
  }

  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    include: {
      menuCategories: {
        include: { products: true },
      },
    },
  });

  if (!restaurant) {
    return notFound();
  }
  return (
    <div className="min-h-dvh">
      <RestaurantHeader restaurant={restaurant} consumptionMethod={method} />
      <RestaurantCategories
        restaurant={restaurant}
        consumptionMethod={method}
      />
    </div>
  );
};

export default RestaurantMenuPage;

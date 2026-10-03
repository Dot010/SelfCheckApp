import { ConsumptionMethod } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { getOpenStatus } from "@/helpers/restaurant-time";
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
      openingHours: true,
      menuCategories: {
        include: { products: true },
      },
    },
  });

  if (!restaurant) {
    return notFound();
  }
  const openStatus = getOpenStatus(restaurant.openingHours);
  // Shown in the cart instead of letting the customer reach checkout.
  const orderingBlockedMessage = restaurant.isPaused
    ? "A cozinha pausou os pedidos por alguns minutos. Você pode montar a sacola e finalizar quando voltar."
    : !openStatus.isOpen
      ? `Estamos fechados agora. ${openStatus.label}.`
      : null;

  return (
    <div className="min-h-dvh">
      <RestaurantHeader
        restaurant={restaurant}
        consumptionMethod={method}
        status={
          restaurant.isPaused
            ? { label: "Pedidos pausados", tone: "warning" }
            : {
                label: openStatus.label,
                tone: openStatus.isOpen ? "open" : "closed",
              }
        }
      />
      <RestaurantCategories
        restaurant={restaurant}
        consumptionMethod={method}
        orderingBlockedMessage={orderingBlockedMessage}
      />
    </div>
  );
};

export default RestaurantMenuPage;

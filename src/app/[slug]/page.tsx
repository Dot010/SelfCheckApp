import Image from "next/image";
import { notFound } from "next/navigation";

import { getRestaurantBySlug } from "@/data/get-restaurant-by-slug";

import ConsumptionMethodOption from "./components/consumption-method-option";

interface RestaurantPageProps {
  params: Promise<{ slug: string }>;
}

const RestaurantPage = async ({ params }: RestaurantPageProps) => {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return notFound();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8 text-center sm:gap-10">
        <div className="flex flex-col items-center gap-3">
          <Image
            src={restaurant.avatarImageUrl}
            alt=""
            width={80}
            height={80}
            className="rounded-3xl"
            priority
          />
          <p className="font-display text-lg font-bold">{restaurant.name}</p>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Seja bem-vindo!
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            {restaurant.description}
          </p>
          <p className="font-medium">Como você prefere o seu pedido?</p>
        </div>

        <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:gap-5">
          <ConsumptionMethodOption
            slug={slug}
            option="DINE_IN"
            label="Comer aqui"
            hint="Servimos na mesa"
            imageUrl="/tigela/dine-in.svg"
          />
          <ConsumptionMethodOption
            slug={slug}
            option="TAKEAWAY"
            label="Para levar"
            hint="Embalagem com tampa"
            imageUrl="/tigela/take-away.svg"
          />
        </div>
      </div>
    </main>
  );
};

export default RestaurantPage;

import { ChefHatIcon, MonitorIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getRestaurantBySlug } from "@/data/get-restaurant-by-slug";
import { isDemoMode } from "@/lib/demo";

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

        {isDemoMode() && (
          <aside className="w-full max-w-xl rounded-3xl bg-secondary p-5 text-left text-sm">
            <p className="font-semibold">Este é um projeto de demonstração</p>
            <p className="mt-1 text-muted-foreground">
              Faça um pedido como cliente (o pagamento é de teste) e acompanhe
              do outro lado do balcão. Os dados voltam ao original todo dia.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/${slug}/admin/login`}
                className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 font-medium ring-1 ring-border transition hover:bg-accent"
              >
                <ChefHatIcon className="h-4 w-4" />
                Painel da cozinha
              </Link>
              <Link
                href={`/${slug}/telao`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 font-medium ring-1 ring-border transition hover:bg-accent"
              >
                <MonitorIcon className="h-4 w-4" />
                Telão de senhas
              </Link>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
};

export default RestaurantPage;

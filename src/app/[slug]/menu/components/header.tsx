import { ConsumptionMethod, Restaurant } from "@prisma/client";
import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface RestaurantHeaderProps {
  restaurant: Pick<
    Restaurant,
    "name" | "slug" | "description" | "avatarImageUrl" | "coverImageUrl"
  >;
  consumptionMethod: ConsumptionMethod;
}

const consumptionMethodLabel: Record<ConsumptionMethod, string> = {
  DINE_IN: "Comer aqui",
  TAKEAWAY: "Para levar",
};

const RestaurantHeader = ({
  restaurant,
  consumptionMethod,
}: RestaurantHeaderProps) => {
  return (
    <header>
      <div className="relative h-40 w-full sm:h-52 lg:h-64">
        <Image
          src={restaurant.coverImageUrl}
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="relative mx-auto flex max-w-6xl justify-between p-4 lg:px-6">
          <Button
            asChild
            variant="secondary"
            size="icon"
            className="rounded-full shadow-sm"
          >
            <Link href={`/${restaurant.slug}`} aria-label="Voltar ao início">
              <ChevronLeftIcon />
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="icon"
            className="rounded-full shadow-sm lg:hidden"
          >
            <Link href={`/${restaurant.slug}/orders`} aria-label="Meus pedidos">
              <ScrollTextIcon />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="relative -mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border sm:p-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Image
              src={restaurant.avatarImageUrl}
              alt=""
              width={56}
              height={56}
              className="shrink-0 rounded-2xl"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold">{restaurant.name}</h1>
              <p className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                <span>{restaurant.description}</span>
                <span className="font-medium text-success">Aberto agora</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-full"
            >
              <Link href={`/${restaurant.slug}`}>
                {consumptionMethodLabel[consumptionMethod]} · trocar
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden rounded-full lg:inline-flex"
            >
              <Link href={`/${restaurant.slug}/orders`}>
                <ScrollTextIcon />
                Meus pedidos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RestaurantHeader;

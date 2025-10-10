import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import RestaurantHeader from "./components/header";

interface RestaurantMenuPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ consumptionMethod: string }>;
}

const isConsumptionMethodValid = (consumptionMethod: string) => {
    return ["DINE_IN", "TAKEWAY"].includes(consumptionMethod.toUpperCase());
    
}

const RestaurantMenuPage = async ({ params, searchParams, }: RestaurantMenuPageProps) => {
    const { slug } = await params;
    const { consumptionMethod } = await searchParams;

    if (!isConsumptionMethodValid(consumptionMethod)) {
        return notFound();

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
        <div>
            <RestaurantHeader restaurant={restaurant} />
      
            
        </div>

    );
};

export default RestaurantMenuPage;


//http://localhost:3000/fsw-donalds/menu?consumptionMethod=DINE_IN  
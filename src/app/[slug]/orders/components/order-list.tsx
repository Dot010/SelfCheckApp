"use client";


import { OrderStatus, Prisma } from "@prisma/client";
import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/helpers/format-currency";

interface OrderListProps {
    orders: Array<
    Prisma.OrderGetPayload<{
        include: {
            restaurant: {
                select: {
                    name: true;
                    avatarImageUrl: true;
                };
            };
            orderProducts: {
                include: {
                    product: true;
                };
            };
        };
    }>
    >;
}

const getStatusLabel = (status: OrderStatus) => {
    if (status === `FINISHED`) return `Concluído`;
    if (status === `iN_PREPARATION`) return `Em Preparo`;
    if (status === `PENDING`) return `Pendente`;
    return ``;
}

const OrderList = ({ orders }: OrderListProps) => {
    const router = useRouter();
    const handleBackClick = () => router.back();
    return (
        <div className="space-y-6 p-6">
            <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                onClick={handleBackClick}>
                
                <ChevronLeftIcon />
            </Button>

            <div
                className="flex items center 
                gap-3">
                <ScrollTextIcon />
                <h2 className="
                text-lg
                font-semibold">
                    Meus Pedidos
                </h2>

            </div>
            {orders.map(order => (
                <Card
                    key={order.id}
                    className="p-4">
                    <CardContent className="space-y-4 p-5">
                        <div
                            className={
                            `text-white w-fit rounded-full py-1 px-2 text-xs font-semibold  
                                ${order.status === OrderStatus.FINISHED ?
                                    "bg-green-500" :
                                    "bg-gray-300 text-gray-500"}`
                                
                            }>
                            
                            
                                    {getStatusLabel(order.status)}
                        </div>

                        <div
                            className="
                            flex
                            items-center
                            gap-2">
                            <div className="relative h-5 w-5">

                                <Image
                                    src={order.restaurant.avatarImageUrl}
                                    alt={order.restaurant.name}
                                    className="rounded-sm"
                                    fill
                                />
                            </div>
                            <p
                                className="font-semibold
                                text-sm">
                                {order.restaurant.name}
                            </p>
                        </div>

                        

                        <div className="space-y-2">

                            
                        <Separator />
                        {order.orderProducts.map((
                            orderProduct) => (
                            <div key={orderProduct.id}
                                className="flex-items-center 
                                gap-2">
                                <div className="flex
                            h-5
                            w-5
                            items-center
                            justify-center
                            rounded-full
                            bg-gray-400
                            text-xs
                            font-semibold
                             text-white">
                                    {orderProduct.quantity}

                                </div>
                                <p className="text-sm">{orderProduct.product.name}</p>
                            </div>
                        ))}
                        </div>
                        <Separator />

                            <p
                            className="text-sm font-medium">
                            {formatCurrency(order.total)}</p>

                    </CardContent>
                    
                    
                    
                </Card>
            ))}
        </div>


    );
};
 
export default OrderList;
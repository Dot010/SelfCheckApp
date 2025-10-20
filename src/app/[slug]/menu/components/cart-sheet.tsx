import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCurrency } from "@/helpers/formar-currency";

import { CartContext } from "../contexts/cart";
import CartProductItem from "./cart-product-item";
import FinishOrderDialog from "./finish-order-dialog";
const CartSheet = () => {
    const [finishOrderDialogIsOpen, setFinishOrderDialogIsOpen] = useState(false);
            

    const {isOpen, toggleCart, products, total} = useContext(CartContext);
    return (
        


        <Sheet open={isOpen} onOpenChange={toggleCart} >
 
            <SheetContent className="w-{95%}">
                <SheetHeader>
                    <SheetTitle className="text-left">Carrinho</SheetTitle>
                  
                </SheetHeader>
                <div className="h-full py-5 flex flex-col">
                    <div className="flex-auto">
                               {products.map(product => (
                    <CartProductItem key={product.id} product={product}/>
                        ))}
                    </div>
                    <Card className="mb-6" >
                            
                        <CardContent className="p-5">
                            <div className="flex justify-between">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="font-semibold text-sm">{formatCurrency(total)}</p>
                            </div>
                </CardContent>
                    </Card>


            </div>
            </SheetContent>
            <Button className="w-full rounded-full" onClick={() => setFinishOrderDialogIsOpen(true)
                
            }>Finalizar Pedido</Button>
            <FinishOrderDialog open={finishOrderDialogIsOpen}
                onOpenChange={setFinishOrderDialogIsOpen} />
        </Sheet>
               

    );

    
};

export default CartSheet;


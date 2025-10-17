"use client";

import { Product } from "@prisma/client";
import  { createContext, useState } from "react";

interface CartProduct extends Product{
    quantity: number
    
}


export interface InCartContext{
    isOpen: boolean;
    products: CartProduct[];
    toggleCart: () => void;
}

export const CartContext = createContext<InCartContext>({
    isOpen: false,
    products: [],
    toggleCart: () => { }
});



export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<CartProduct[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    
    const toggleCart = () => {
        setIsOpen(prev => !prev);
    }
    return (
        <CartContext.Provider
            value={{
                isOpen,
                products,
                toggleCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};


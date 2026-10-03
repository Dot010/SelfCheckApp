"use client";

import { Product } from "@prisma/client";
import { createContext, ReactNode, useEffect, useState } from "react";

export interface CartProduct
  extends Pick<Product, "id" | "name" | "price" | "imageUrl"> {
  quantity: number;
}

export interface ICartContext {
  isOpen: boolean;
  products: CartProduct[];
  total: number;
  totalQuantity: number;
  toggleCart: () => void;
  addProduct: (product: CartProduct) => void;
  decreaseProductQuantity: (productId: string) => void;
  increaseProductQuantity: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<ICartContext>({
  isOpen: false,
  total: 0,
  totalQuantity: 0,
  products: [],
  toggleCart: () => {},
  addProduct: () => {},
  decreaseProductQuantity: () => {},
  increaseProductQuantity: () => {},
  removeProduct: () => {},
  clearCart: () => {},
});

const isCartProduct = (value: unknown): value is CartProduct => {
  const item = value as CartProduct;
  return (
    typeof item?.id === "string" &&
    typeof item.name === "string" &&
    typeof item.imageUrl === "string" &&
    Number.isInteger(item.price) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
};

const readStoredCart = (key: string): CartProduct[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(stored) ? stored.filter(isCartProduct) : [];
  } catch {
    return [];
  }
};

interface CartProviderProps {
  children: ReactNode;
  // Each restaurant gets its own cart, saved in the browser under this key.
  storageKey: string;
}

export const CartProvider = ({ children, storageKey }: CartProviderProps) => {
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // localStorage only exists in the browser, so the cart is restored after mount.
  useEffect(() => {
    setProducts(readStoredCart(storageKey));
    setHasLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(products));
    } catch {
      // Storage can be full or blocked (private mode); the cart still works in memory.
    }
  }, [products, hasLoaded, storageKey]);

  const total = products.reduce((acc, product) => {
    return acc + product.price * product.quantity;
  }, 0);

  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  const toggleCart = () => {
    setIsOpen((prev) => !prev);
  };

  const addProduct = ({ id, name, price, imageUrl, quantity }: CartProduct) => {
    setProducts((prevProducts) => {
      const isAlreadyOnTheCart = prevProducts.some((p) => p.id === id);
      if (!isAlreadyOnTheCart) {
        return [...prevProducts, { id, name, price, imageUrl, quantity }];
      }
      return prevProducts.map((prevProduct) =>
        prevProduct.id === id
          ? { ...prevProduct, quantity: prevProduct.quantity + quantity }
          : prevProduct,
      );
    });
  };

  // Decreasing the last unit removes the item from the cart.
  const decreaseProductQuantity = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts
        .map((prevProduct) =>
          prevProduct.id === productId
            ? { ...prevProduct, quantity: prevProduct.quantity - 1 }
            : prevProduct,
        )
        .filter((prevProduct) => prevProduct.quantity > 0),
    );
  };

  const increaseProductQuantity = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((prevProduct) =>
        prevProduct.id === productId
          ? { ...prevProduct, quantity: prevProduct.quantity + 1 }
          : prevProduct,
      ),
    );
  };

  const removeProduct = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts.filter((prevProduct) => prevProduct.id !== productId),
    );
  };

  const clearCart = () => {
    setProducts([]);
    setIsOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
        isOpen,
        products,
        toggleCart,
        addProduct,
        decreaseProductQuantity,
        increaseProductQuantity,
        removeProduct,
        clearCart,
        total,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

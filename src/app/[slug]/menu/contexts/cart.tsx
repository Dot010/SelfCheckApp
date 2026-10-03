"use client";

import { createContext, ReactNode, useEffect, useState } from "react";

export interface CartItemOption {
  id: string;
  name: string;
}

export interface CartItem {
  // Same product with the same options and notes = same line in the cart.
  key: string;
  productId: string;
  name: string;
  imageUrl: string;
  // Product price plus options, in cents. The server recalculates it.
  unitPrice: number;
  quantity: number;
  options: CartItemOption[];
  notes?: string;
}

export type NewCartItem = Omit<CartItem, "key">;

export interface ICartContext {
  isOpen: boolean;
  items: CartItem[];
  total: number;
  totalQuantity: number;
  toggleCart: () => void;
  addItem: (item: NewCartItem) => void;
  decreaseQuantity: (key: string) => void;
  increaseQuantity: (key: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<ICartContext>({
  isOpen: false,
  items: [],
  total: 0,
  totalQuantity: 0,
  toggleCart: () => {},
  addItem: () => {},
  decreaseQuantity: () => {},
  increaseQuantity: () => {},
  clearCart: () => {},
});

const itemKey = ({ productId, options, notes }: NewCartItem) =>
  [productId, ...options.map((o) => o.id).sort(), notes ?? ""].join("|");

const isCartItem = (value: unknown): value is CartItem => {
  const item = value as CartItem;
  return (
    typeof item?.key === "string" &&
    typeof item.productId === "string" &&
    typeof item.name === "string" &&
    typeof item.imageUrl === "string" &&
    Number.isInteger(item.unitPrice) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    Array.isArray(item.options)
  );
};

const readStoredCart = (key: string): CartItem[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? "[]");
    // Items saved in an older format are dropped.
    return Array.isArray(stored) ? stored.filter(isCartItem) : [];
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
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // localStorage only exists in the browser, so the cart is restored after mount.
  useEffect(() => {
    setItems(readStoredCart(storageKey));
    setHasLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Storage can be full or blocked (private mode); the cart still works in memory.
    }
  }, [items, hasLoaded, storageKey]);

  const total = items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  );
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const toggleCart = () => {
    setIsOpen((prev) => !prev);
  };

  const addItem = (newItem: NewCartItem) => {
    const key = itemKey(newItem);
    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (!existing) {
        return [...prev, { ...newItem, key }];
      }
      return prev.map((item) =>
        item.key === key
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item,
      );
    });
  };

  // Decreasing the last unit removes the item from the cart.
  const decreaseQuantity = (key: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const increaseQuantity = (key: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    setIsOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
        isOpen,
        items,
        total,
        totalQuantity,
        toggleCart,
        addItem,
        decreaseQuantity,
        increaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  slug?: string;
  name: string;
  image?: string;
  price: number; // unit price snapshot (final price after discount)
  basePrice?: number; // original price before discount
  discountedPrice?: number; // discounted price (same as price if discount exists)
  sku?: string;
  selectedOptions?: Record<string, string>; // attributeName -> value
  quantity: number;
  isFreeDelivery?: boolean;
};

export type LocalCart = {
  items: CartItem[];
  updatedAt: number;
  version: number;
};

const CART_KEY = "cart:v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readCart(): LocalCart {
  if (!isBrowser()) return { items: [], updatedAt: Date.now(), version: 1 };
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { items: [], updatedAt: Date.now(), version: 1 };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.items)) return parsed as LocalCart;
  } catch {
    /* ignore */
  }
  return { items: [], updatedAt: Date.now(), version: 1 };
}

function writeCart(cart: LocalCart) {
  if (!isBrowser()) return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  try {
    window.dispatchEvent(new StorageEvent("storage", { key: CART_KEY }));
  } catch {
    /* some browsers block manual StorageEvent; fallback */
    const evt = new CustomEvent("cart:changed");
    window.dispatchEvent(evt);
  }
}

function itemKey(item: Omit<CartItem, "quantity">): string {
  const options = item.selectedOptions || {};
  const sorted = Object.keys(options)
    .sort()
    .map((k) => `${k}:${options[k]}`)
    .join("|");
  return `${item.productId}|${item.sku || ""}|${sorted}`;
}

export function useLocalCart() {
  const [cart, setCart] = useState<LocalCart>(() => readCart());

  // keep in sync across tabs/components
  useEffect(() => {
    if (!isBrowser()) return;
    const onChange = (e: Event) => {
      if ((e as StorageEvent).key && (e as StorageEvent).key !== CART_KEY) return;
      setCart(readCart());
    };
    window.addEventListener("storage", onChange);
    window.addEventListener("cart:changed", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("cart:changed", onChange);
    };
  }, []);

  const totalQuantity = useMemo(
    () => cart.items.reduce((acc, it) => acc + it.quantity, 0),
    [cart.items]
  );
  const subTotal = useMemo(
    () => cart.items.reduce((acc, it) => acc + it.price * it.quantity, 0),
    [cart.items]
  );

  const persist = useCallback((nextItems: CartItem[]) => {
    const next: LocalCart = {
      items: nextItems,
      updatedAt: Date.now(),
      version: 1,
    };
    setCart(next);
    writeCart(next);
  }, []);

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const qty = Math.max(1, item.quantity ?? 1);
      const key = itemKey(item);
      const next = [...cart.items];
      const idx = next.findIndex((it) => itemKey(it) === key);
      if (idx === -1) {
        next.push({ ...item, quantity: qty });
      } else {
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
      }
      persist(next);
    },
    [cart.items, persist]
  );

  const updateQuantity = useCallback(
    (matcher: Omit<CartItem, "quantity">, quantity: number) => {
      const key = itemKey(matcher);
      const next = cart.items
        .map((it) =>
          itemKey(it) === key ? { ...it, quantity: Math.max(1, quantity) } : it
        )
        .filter((it) => it.quantity > 0);
      persist(next);
    },
    [cart.items, persist]
  );

  const removeItem = useCallback((matcher: Omit<CartItem, "quantity">) => {
    const key = itemKey(matcher);
    const next = cart.items.filter((it) => itemKey(it) !== key);
    persist(next);
  }, [cart.items, persist]);

  const updateItemPrice = useCallback((
    matcher: Omit<CartItem, "quantity">,
    updates: { price?: number; basePrice?: number; discountedPrice?: number }
  ) => {
    const key = itemKey(matcher);
    const next = cart.items.map((it) =>
      itemKey(it) === key
        ? { ...it, ...updates }
        : it
    );
    persist(next);
  }, [cart.items, persist]);

  const updatePricesForProduct = useCallback((
    productId: string,
    price: number,
    basePrice?: number,
    discountedPrice?: number
  ) => {
    const next = cart.items.map((it) =>
      it.productId === productId
        ? { ...it, price, basePrice, discountedPrice }
        : it
    );
    persist(next);
  }, [cart.items, persist]);

  return {
    items: cart.items,
    totalQuantity,
    subTotal,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    updateItemPrice,
    updatePricesForProduct,
    has: (matcher: Omit<CartItem, "quantity">) =>
      cart.items.some((it) => itemKey(it) === itemKey(matcher)),
  };
}



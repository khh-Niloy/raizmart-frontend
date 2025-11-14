"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type WishlistItem = {
  productId: string;
  slug?: string;
  name: string;
  image?: string;
  price?: number; // optional snapshot (final price after discount)
  basePrice?: number; // original price before discount
  discountedPrice?: number; // discounted price (same as price if discount exists)
  sku?: string;
  selectedOptions?: Record<string, string>;
  isFreeDelivery?: boolean;
};

export type LocalWishlist = {
  items: WishlistItem[];
  updatedAt: number;
  version: number;
};

const KEY = "wishlist:v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function read(): LocalWishlist {
  if (!isBrowser()) return { items: [], updatedAt: Date.now(), version: 1 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: [], updatedAt: Date.now(), version: 1 };
    const json = JSON.parse(raw);
    if (Array.isArray(json?.items)) return json as LocalWishlist;
  } catch {}
  return { items: [], updatedAt: Date.now(), version: 1 };
}

function write(state: LocalWishlist) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(state));
  try {
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  } catch {
    window.dispatchEvent(new CustomEvent("wishlist:changed"));
  }
}

function itemKey(it: WishlistItem) {
  const options = it.selectedOptions || {};
  const sorted = Object.keys(options)
    .sort()
    .map((k) => `${k}:${options[k]}`)
    .join("|");
  return `${it.productId}|${it.sku || ""}|${sorted}`;
}

export function useLocalWishlist() {
  const [state, setState] = useState<LocalWishlist>(() => read());

  useEffect(() => {
    if (!isBrowser()) return;
    const onChange = (e: Event) => {
      if ((e as StorageEvent).key && (e as StorageEvent).key !== KEY) return;
      setState(read());
    };
    window.addEventListener("storage", onChange);
    window.addEventListener("wishlist:changed", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("wishlist:changed", onChange);
    };
  }, []);

  const count = useMemo(() => state.items.length, [state.items]);

  const persist = useCallback((items: WishlistItem[]) => {
    const next: LocalWishlist = { items, updatedAt: Date.now(), version: 1 };
    setState(next);
    write(next);
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    const key = itemKey(item);
    const exists = state.items.some((it) => itemKey(it) === key);
    if (exists) {
      persist(state.items.filter((it) => itemKey(it) !== key));
    } else {
      persist([...state.items, item]);
    }
  }, [state.items, persist]);

  const remove = useCallback((item: WishlistItem) => {
    const key = itemKey(item);
    persist(state.items.filter((it) => itemKey(it) !== key));
  }, [state.items, persist]);

  const clear = useCallback(() => persist([]), [persist]);

  const has = useCallback((matcher: WishlistItem) => {
    return state.items.some((it) => itemKey(it) === itemKey(matcher));
  }, [state.items]);

  const updateItemPrice = useCallback((
    matcher: WishlistItem,
    updates: { price?: number; basePrice?: number; discountedPrice?: number }
  ) => {
    const key = itemKey(matcher);
    const next = state.items.map((it) =>
      itemKey(it) === key
        ? { ...it, ...updates }
        : it
    );
    persist(next);
  }, [state.items, persist]);

  const updatePricesForProduct = useCallback((
    productId: string,
    price?: number,
    basePrice?: number,
    discountedPrice?: number
  ) => {
    const next = state.items.map((it) =>
      it.productId === productId
        ? { ...it, price, basePrice, discountedPrice }
        : it
    );
    persist(next);
  }, [state.items, persist]);

  const updateProductInfo = useCallback((
    productId: string,
    updates: {
      name?: string;
      slug?: string;
      image?: string;
      price?: number;
      basePrice?: number;
      discountedPrice?: number;
      isFreeDelivery?: boolean;
    }
  ) => {
    const next = state.items.map((it) =>
      it.productId === productId
        ? { ...it, ...updates }
        : it
    );
    persist(next);
  }, [state.items, persist]);

  return { items: state.items, count, toggle, remove, clear, has, updateItemPrice, updatePricesForProduct, updateProductInfo };
}



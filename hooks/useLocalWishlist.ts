"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type WishlistItem = {
  productId: string;
  slug?: string;
  name: string;
  image?: string;
  price?: number; // optional snapshot
  sku?: string;
  selectedOptions?: Record<string, string>;
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
    window.addEventListener("storage", onChange as any);
    window.addEventListener("wishlist:changed", onChange as any);
    return () => {
      window.removeEventListener("storage", onChange as any);
      window.removeEventListener("wishlist:changed", onChange as any);
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

  return { items: state.items, count, toggle, remove, clear, has };
}



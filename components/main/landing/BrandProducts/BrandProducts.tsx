"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGetBrandsQuery, useGetBrandProductsQuery } from "@/app/redux/features/brand/brand.api";

export default function BrandProducts() {
  const { data: brandsData, isLoading: brandsLoading } = useGetBrandsQuery(undefined);
  const brands: any[] = (brandsData as any) || [];

  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!active && brands?.length) {
      setActive(brands[0]?.name || brands[0]?.title || brands[0]?._id || null);
    }
  }, [brands, active]);

  const { data: productsResp, isLoading: productsLoading } = useGetBrandProductsQuery(
    { brand: active || "", page: 1, limit: 12, sort: "newest" },
    { skip: !active }
  ) as any;

  const items: any[] = productsResp?.items || productsResp?.data?.items || [];

  const listRef = React.useRef<HTMLDivElement | null>(null);
  const scrollBy = (delta: number) => listRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          <span className="text-gray-900">Brand </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
            Products
          </span>
        </h2>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(-500)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(500)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Brand toggles */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-6">
        {brandsLoading && (
          <div className="h-10 w-32 rounded-full bg-gray-100 animate-pulse" />
        )}
        {brands?.map((b: any) => {
          const label = b?.name || b?.title || String(b?._id);
          const selected = active === label;
          return (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={cn(
                "px-5 h-10 rounded-full border transition whitespace-nowrap",
                selected ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Product list */}
      {productsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div ref={listRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items?.map((product: any) => {
              const colorAttr = (product?.attributes || []).find(
                (a: any) => a.type?.toLowerCase?.() === "color" || a.name?.toLowerCase?.() === "color"
              );
              const primaryImage =
                colorAttr?.values?.[0]?.images?.[0] || product?.images?.[0] || "/next.svg";
              const variant = (product?.variants || [])[0];

              return (
                <Link key={product._id} href={`/product/${product.slug}`} className="block">
                  <div className="border rounded-2xl p-4 bg-white hover:shadow transition">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={primaryImage} alt={product.name} className="w-full h-40 object-contain" />
                    {product?.isFreeDelivery && (
                      <div className="mt-2">
                        <Badge className="bg-emerald-600 text-white border-transparent">Free Delivery</Badge>
                      </div>
                    )}
                    <div className="mt-3 font-medium text-gray-900 line-clamp-2 min-h-[44px]">
                      {product.name}
                    </div>
                    <div className="mt-1 text-[#111827] font-semibold">
                      {variant?.finalPrice ? `৳ ${variant.finalPrice}` : ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center justify-center gap-3 mt-6">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(-300)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(300)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}



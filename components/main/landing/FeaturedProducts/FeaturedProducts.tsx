"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetFeaturedProductsQuery } from "@/app/redux/features/product/product.api";
import { ProductCardSkeleton } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedProducts() {
  const { data, isLoading, isError } = useGetFeaturedProductsQuery(undefined);
  const items: any[] = Array.isArray((data as any)) ? (data as any) : (data?.items || data?.data || []);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (delta: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <div className="hidden md:flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[240px] max-w-[240px]">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !items?.length) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          <span className="text-gray-900">Featured </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
            Products
          </span>
        </h2>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(-400)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(400)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pr-2"
        >
          {items.map((product: any) => {
            const colorAttr = (product?.attributes || []).find(
              (a: any) => a.type?.toLowerCase?.() === "color" || a.name?.toLowerCase?.() === "color"
            );
            const primaryImage =
              colorAttr?.values?.[0]?.images?.[0] || product?.images?.[0] || "/next.svg";
            const variant = (product?.variants || [])[0];
            return (
              <div
                key={product._id}
                className="min-w-[240px] max-w-[240px] md:min-w-[260px] md:max-w-[260px]"
              >
                <Link href={`/product/${product.slug}`} className="block">
                  <div className="border rounded-2xl p-4 bg-white hover:shadow transition">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-40 object-contain"
                    />
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
              </div>
            );
          })}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center justify-center gap-3 mt-4">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(-300)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(300)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}



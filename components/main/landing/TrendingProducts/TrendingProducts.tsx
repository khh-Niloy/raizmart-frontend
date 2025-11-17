"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetTrendingProductsQuery } from "@/app/redux/features/product/product.api";
import { ProductCardSkeleton } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  _id: string;
  name: string;
  slug: string;
  status: string;
  price?: number;
  discountedPrice?: number;
  images?: string[];
  isFreeDelivery?: boolean;
  attributes?: Array<{
    type?: string;
    name?: string;
    values?: Array<{
      images?: string[];
    }>;
  }>;
  variants?: Array<{
    finalPrice?: number;
    discountedPrice?: number;
  }>;
  [key: string]: unknown;
}

interface ProductsResponse {
  items?: Product[];
  data?: Product[];
}

export default function TrendingProducts() {
  const { data, isLoading, isError } = useGetTrendingProductsQuery(undefined);
  const response = data as Product[] | ProductsResponse | undefined;
  const allItems: Product[] = Array.isArray(response)
    ? response
    : (response?.items || response?.data || []);
  const items = allItems.filter((product: Product) => product.status === "active");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollBy = (delta: number) => scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  if (isLoading) {
    return (
      <section className="w-full h-full">
        <div className="rounded-3xl border border-gray-100 bg-white shadow-[0_30px_90px_-60px_rgba(5,150,145,0.4)] px-4 sm:px-8 py-8 h-full flex flex-col">
          <header className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-64" />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </header>
          <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-inner">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) return null;

  if (!items?.length) {
    return (
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 h-full">
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm px-4 sm:px-8 py-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#02C1BE]">Hot right now</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                <span>Trending </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
                  Products
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">No trending products at the moment. Check back soon.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 h-full">
      <div className="rounded-3xl border border-gray-100 bg-white shadow-[0_30px_90px_-60px_rgba(5,150,145,0.4)] px-4 sm:px-8 py-8 h-full flex flex-col">
        <header className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#02C1BE]">Hot right now</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
              <span>Trending </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
                Products
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              See what shoppers are loving right now across categories.
            </p>
          </div>
          {/* <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(-400)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(400)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div> */}
        </header>

        <div ref={scrollRef} className="grid flex-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((product: Product) => {
            type AttributeType = NonNullable<Product["attributes"]>[number];
            const colorAttr = (product?.attributes || []).find(
              (a: AttributeType) =>
                a?.type?.toLowerCase?.() === "color" || a?.name?.toLowerCase?.() === "color"
            );
            const primaryImage =
              colorAttr?.values?.[0]?.images?.[0] || product?.images?.[0] || "/next.svg";
            const variant = (product?.variants || [])[0];

            const basePrice = variant?.finalPrice || product?.price || 0;
            const discountedPrice = variant?.discountedPrice || product?.discountedPrice || 0;
            const hasDiscount = basePrice > 0 && discountedPrice > 0 && discountedPrice < basePrice;
            const finalPrice = hasDiscount ? discountedPrice : basePrice;
            const discountPercentage = hasDiscount
              ? Math.round(((basePrice - discountedPrice) / basePrice) * 100)
              : 0;

            return (
              <Link key={product._id} href={`/product/${product.slug}`} className="block">
                <div className="h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_25px_70px_-60px_rgba(5,150,145,0.45)] transition hover:shadow-[0_25px_70px_-45px_rgba(5,150,145,0.55)] relative">
                  {hasDiscount && discountPercentage > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-red-500 text-white border-transparent font-bold text-xs px-2 py-1">
                        -{discountPercentage}%
                      </Badge>
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={primaryImage} alt={product.name} className="w-full h-48 object-contain" />
                  {product?.isFreeDelivery && (
                    <div className="mt-3">
                      <Badge className="bg-emerald-600 text-white border-transparent">Free Delivery</Badge>
                    </div>
                  )}
                  <div className="mt-3 font-medium text-gray-900 line-clamp-2 min-h-[48px]">
                    {product.name}
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    {hasDiscount ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-emerald-600">
                            ৳ {finalPrice.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ৳ {basePrice.toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-lg font-semibold text-[#111827]">
                        {finalPrice > 0 ? `৳ ${finalPrice.toLocaleString()}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* <div className="mt-6 flex items-center justify-center gap-3 md:hidden">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(-300)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => scrollBy(300)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div> */}
      </div>
    </section>
  );
}



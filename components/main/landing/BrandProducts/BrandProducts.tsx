"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useGetBrandProductsQuery } from "@/app/redux/features/product/product.api";
import { ProductCardSkeleton } from "@/components/ui/loading";
import { resolveImageUrl, pickProductImage } from "@/lib/utils";

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
    discountPercentage?: number;
  }>;
  [key: string]: unknown;
}

interface ProductsResponse {
  items?: Product[];
  data?: Product[] | {
    items?: Product[];
  };
}

export default function BrandProducts() {
  const { data, isLoading, isError } = useGetBrandProductsQuery(undefined);
  const response = data as Product[] | ProductsResponse | undefined;
  let allItems: Product[] = [];
  if (Array.isArray(response)) {
    allItems = response;
  } else if (response) {
    if (Array.isArray(response.items)) {
      allItems = response.items;
    } else if (response.data) {
      if (Array.isArray(response.data)) {
        allItems = response.data;
      } else if (Array.isArray(response.data.items)) {
        allItems = response.data.items;
      }
    }
  }
  // Filter to show only active products
  const items = allItems.filter(
    (product: Product) => product.status === "active"
  );

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 h-full">
      <div className="rounded-3xl border border-gray-100 bg-white shadow-[0_30px_90px_-60px_rgba(5,150,145,0.4)] px-4 sm:px-8 py-8 h-full flex flex-col">
        <header className="flex flex-col gap-4 mb-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#02C1BE]">
              Shop by brand
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">
              <span className="text-gray-900">Brand </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
                Products
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Choose a brand to see curated assortments, exclusive bundles, and
              special financing options.
            </p>
          </div>
          {/* <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scrollBy(-500)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scrollBy(500)}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div> */}
        </header>

        {/* Product list */}
        {isLoading ? (
          <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-inner"
              >
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : isError ? null : items?.length ? (
          <div className="grid flex-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((product: Product) => {
              const colorAttr = Array.isArray(product?.attributes)
                ? product.attributes.find(
                    (a) =>
                      (typeof a?.type === "string" &&
                        a.type.toLowerCase() === "color") ||
                      (typeof a?.name === "string" &&
                        a.name.toLowerCase() === "color")
                  )
                : undefined;

              const primaryImage = resolveImageUrl(
                (colorAttr?.values?.[0]?.images?.[0] as string | undefined) || pickProductImage(product)
              );

              const variant = Array.isArray(product?.variants)
                ? product.variants[0]
                : undefined;

              // Prefer numbers, fallback to 0
              const getNumber = (val: unknown): number =>
                typeof val === "number" && !isNaN(val) ? val : 0;

              const basePrice =
                getNumber(variant?.finalPrice) || getNumber(product?.price);
              const discountedPrice =
                getNumber(variant?.discountedPrice) ||
                getNumber(product?.discountedPrice);

              const hasDiscount =
                basePrice > 0 &&
                discountedPrice > 0 &&
                discountedPrice < basePrice;

              const finalPrice = hasDiscount ? discountedPrice : basePrice;
              const discountPercentage =
                hasDiscount && basePrice > 0
                  ? Math.round(
                      ((basePrice - discountedPrice) / basePrice) * 100
                    )
                  : 0;

              return (
                <Link
                  key={String(product._id)}
                  href={`/product/${product.slug ?? ""}`}
                  className="block"
                >
                  <div className="h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_25px_70px_-60px_rgba(5,150,145,0.45)] transition hover:shadow-[0_25px_70px_-45px_rgba(5,150,145,0.55)] relative">
                    {/* Discount Badge */}
                    {hasDiscount && discountPercentage > 0 && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-red-500 text-white border-transparent font-bold text-xs px-2 py-1">
                          -{discountPercentage}%
                        </Badge>
                      </div>
                    )}

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={typeof primaryImage === "string" ? primaryImage : "/next.svg"}
                      alt={String(product.name)}
                      className="w-full h-48 object-contain"
                    />

                    {product?.isFreeDelivery && (
                      <div className="mt-2">
                        <Badge className="bg-emerald-600 text-white border-transparent">
                          Free Delivery
                        </Badge>
                      </div>
                    )}
                    <div className="mt-3 font-medium text-gray-900 line-clamp-2 min-h-[44px]">
                      {String(product.name)}
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
                          {finalPrice > 0
                            ? `৳ ${finalPrice.toLocaleString()}`
                            : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-slate-50/60 p-10 text-center text-gray-500">
            No brand products available at the moment. Check back soon!
          </div>
        )}
      </div>
    </section>
  );
}

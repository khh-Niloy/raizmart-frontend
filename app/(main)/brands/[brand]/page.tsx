"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetBrandProductsQuery } from "@/app/redux/features/brand/brand.api";
import { ProductGridSkeleton } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BrandListing({ params }: { params: Promise<{ brand: string }> }) {
  const resolved = React.use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);
  const sort = searchParams.get("sort") || "newest";

  const { data, isLoading, isError } = useGetBrandProductsQuery({ 
    brand: resolved.brand, 
    page, 
    limit, 
    sort 
  });

  const updateParams = (updates: { page?: number; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.page !== undefined) params.set("page", String(updates.page));
    if (updates.sort !== undefined) params.set("sort", updates.sort);
    router.push(`?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14">
          <Skeleton className="h-10 w-64 mb-6" />
          <ProductGridSkeleton count={limit} />
        </div>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14">
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm px-4 sm:px-8 py-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Products</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const { items, meta, context } = data as any;
  const allItems: any[] = items || [];
  // Filter to show only active products
  const filteredItems = allItems.filter((product: any) => product.status === "active");

  const ProductCard: React.FC<{ product: any }> = ({ product }) => {
    const colorAttr = (product?.attributes || []).find(
      (a: any) => a?.type?.toLowerCase?.() === "color" || a?.name?.toLowerCase?.() === "color"
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
      <Link href={`/product/${product.slug}`} className="block">
        <div className="h-full rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-[0_25px_70px_-60px_rgba(5,150,145,0.45)] transition hover:shadow-[0_25px_70px_-45px_rgba(5,150,145,0.55)] relative group">
          {/* Discount Badge */}
          {hasDiscount && discountPercentage > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-red-500 text-white border-transparent font-bold text-xs px-2 py-1">
                -{discountPercentage}%
              </Badge>
            </div>
          )}
          {/* Product Image */}
          <div className="relative w-full h-40 sm:h-48 mb-3 bg-gray-50 rounded-xl overflow-hidden">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          {/* Free Delivery Badge */}
          {product?.isFreeDelivery && (
            <div className="mb-2">
              <Badge className="bg-emerald-600 text-white border-transparent text-xs">
                Free Delivery
              </Badge>
            </div>
          )}
          {/* Product Name */}
          <div className="mt-2 font-medium text-gray-900 line-clamp-2 min-h-[44px] text-sm sm:text-base">
            {product.name}
          </div>
          {/* Price */}
          <div className="mt-3 flex flex-col gap-1">
            {hasDiscount ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-bold text-emerald-600">
                    ৳ {finalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-400 line-through">
                    ৳ {basePrice.toLocaleString()}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-base sm:text-lg font-semibold text-[#111827]">
                {finalPrice > 0 ? `৳ ${finalPrice.toLocaleString()}` : ""}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="rounded-3xl border border-gray-100 bg-white shadow-[0_30px_90px_-60px_rgba(5,150,145,0.4)] px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[#02C1BE] mb-2">
                  Brand Collection
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                  <span>{context?.brand?.name || resolved.brand}</span>
                </h1>
                <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                  Discover premium products from {context?.brand?.name || resolved.brand}
                </p>
              </div>
              {/* Sort Selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</label>
                <Select value={sort} onValueChange={(value) => updateParams({ sort: value, page: 1 })}>
                  <SelectTrigger className="w-[140px] sm:w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              {filteredItems.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white shadow-sm px-4 sm:px-8 py-4 sm:py-6">
                <div className="text-sm text-gray-600">
                  Showing page {meta.page} of {meta.pages} ({meta.total} products)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateParams({ page: Math.max(1, meta.page - 1) })}
                    disabled={meta.page <= 1}
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Prev
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, meta.pages) }, (_, i) => {
                      let pageNum;
                      if (meta.pages <= 5) {
                        pageNum = i + 1;
                      } else if (meta.page <= 3) {
                        pageNum = i + 1;
                      } else if (meta.page >= meta.pages - 2) {
                        pageNum = meta.pages - 4 + i;
                      } else {
                        pageNum = meta.page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={meta.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateParams({ page: pageNum })}
                          className="rounded-full w-10 h-10 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateParams({ page: Math.min(meta.pages, meta.page + 1) })}
                    disabled={meta.page >= meta.pages}
                    className="rounded-full"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm px-4 sm:px-8 py-12 text-center">
            <p className="text-gray-500 text-lg">No active products found for this brand.</p>
          </div>
        )}
      </div>
    </div>
  );
}

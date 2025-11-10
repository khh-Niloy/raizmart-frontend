"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetProductsBySlugsQuery } from "@/app/redux/features/product/product.api";
import { useLocalCart } from "@/hooks/useLocalCart";
import { ProductGridSkeleton } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthGate } from "@/hooks/useAuthGate";
import { ChevronLeft, ChevronRight, ArrowLeft, ShoppingCart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategoryListing({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = React.use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);
  const sort = searchParams.get("sort") || "newest";

  const { data, isLoading, isError } = useGetProductsBySlugsQuery({
    category: resolvedParams.category,
    page,
    limit,
    sort,
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

  if (isError || !data) {
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

  interface ProductAttribute {
    type?: string;
    name?: string;
    values?: Array<{
      images?: string[];
    }>;
  }

  interface Product {
    _id: string;
    name: string;
    slug: string;
    status: string;
    price?: number;
    discountedPrice?: number;
    discountPercentage?: number;
    images?: string[];
    isFreeDelivery?: boolean;
    attributes?: ProductAttribute[];
    variants?: Array<{
      finalPrice?: number;
      discountedPrice?: number;
      discountPercentage?: number;
      discount?: number;
      sku?: string;
    }>;
    [key: string]: unknown;
  }

  interface CategoryContext {
    category?: {
      name?: string;
    };
  }

  interface ProductsResponse {
    items?: Product[];
    meta?: {
      page?: number;
      pages?: number;
      total?: number;
    };
    context?: CategoryContext;
  }

  const response = data as ProductsResponse | Product[];
  const { items, meta, context } = Array.isArray(response) 
    ? { items: response, meta: undefined, context: undefined }
    : { items: response?.items, meta: response?.meta, context: response?.context };
  const allItems: Product[] = items || [];
  // Filter to show only active products
  const filteredItems = allItems.filter((product: Product) => product.status === "active");

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const { addItem, has } = useLocalCart();
    const { requireAuth } = useAuthGate();
    const colorAttr = (product?.attributes || []).find(
      (a: ProductAttribute) => a.type?.toLowerCase?.() === "color" || a.name?.toLowerCase?.() === "color"
    );
    const primaryImage =
      colorAttr?.values?.[0]?.images?.[0] || product?.images?.[0] || "/next.svg";
    const variant = (product?.variants || [])[0];
    
    // Calculate price with discount support
    const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;
    const variantFinal = hasVariants ? variant?.finalPrice : undefined;
    const variantDiscPrice = hasVariants ? variant?.discountedPrice : undefined;
    const variantDiscPct = hasVariants ? (variant?.discountPercentage ?? variant?.discount) : undefined;
    
    const productFinal = !hasVariants ? product?.price : undefined;
    const productDiscPrice = !hasVariants ? product?.discountedPrice : undefined;
    const productDiscPct = !hasVariants ? product?.discountPercentage : undefined;
    
    const basePrice = hasVariants ? variantFinal : productFinal;
    const discounted = hasVariants ? variantDiscPrice : productDiscPrice;
    const pct = hasVariants ? variantDiscPct : productDiscPct;
    
    const formatPrice = (v: unknown) => {
      if (v === undefined || v === null) return "";
      const isNumeric = typeof v === 'number' || (!!v && /^\d+(?:\.\d+)?$/.test(String(v)));
      if (!isNumeric) return String(v);
      return `৳${Number(v).toLocaleString()}`;
    };
    
    const isNumeric = (val: unknown) => typeof val === 'number' || (!!val && /^\d+(?:\.\d+)?$/.test(String(val)));
    const showDiscount = isNumeric(discounted) && isNumeric(basePrice) && Number(discounted) < Number(basePrice);
    const pctText = (() => {
      if (pct !== undefined && pct !== null && pct > 0) return `${parseFloat(String(pct)).toFixed(0)}% OFF`;
      if (showDiscount) {
        const p = Number(basePrice);
        const d = Number(discounted);
        if (p > 0) return `${Math.round((1 - d / p) * 100)}% OFF`;
      }
      return null;
    })();
    
    const finalPrice = showDiscount && discounted ? Number(discounted) : (isNumeric(basePrice) ? Number(basePrice) : 0);
    
    const matcher = {
      productId: product?._id as string,
      slug: product?.slug as string,
      name: product?.name as string,
      image: primaryImage as string,
      price: finalPrice,
      basePrice: isNumeric(basePrice) ? Number(basePrice) : undefined,
      discountedPrice: showDiscount && discounted ? Number(discounted) : undefined,
      sku: variant?.sku as string | undefined,
      selectedOptions: undefined,
    };
    const inCart = has(matcher);
    
    return (
      <div className="h-full rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-[0_25px_70px_-60px_rgba(5,150,145,0.45)] transition hover:shadow-[0_25px_70px_-45px_rgba(5,150,145,0.55)] relative group">
        {/* Discount Badge */}
        {showDiscount && pctText && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-red-500 text-white border-transparent font-bold text-xs px-2 py-1">
              {pctText}
            </Badge>
          </div>
        )}
        <Link href={`/product/${product.slug}`} className="cursor-pointer block">
          {/* Product Image */}
          <div className="relative w-full h-40 sm:h-48 mb-3 bg-gray-50 rounded-xl overflow-hidden">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
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
        </Link>
        {/* Price */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {showDiscount ? (
            <>
              <div className="text-base sm:text-lg font-bold text-emerald-600">
                {formatPrice(discounted)}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 line-through">
                {formatPrice(basePrice)}
              </div>
            </>
          ) : (
            <div className="text-base sm:text-lg font-semibold text-[#111827]">
              {formatPrice(basePrice)}
            </div>
          )}
        </div>
        {/* Add to Cart Button */}
        <button
          className={`mt-3 w-full h-10 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            inCart
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white hover:bg-[#02C1BE] hover:text-white hover:border-[#02C1BE] text-gray-700 border-gray-200"
          }`}
          onClick={(e) => {
            e.preventDefault();
            if (inCart) return;
            if (!requireAuth()) return;
            addItem({ ...matcher, quantity: 1 });
          }}
          disabled={inCart}
        >
          {inCart ? (
            "Added to Cart"
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
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
                  Category Collection
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                  {context?.category?.name || resolvedParams.category}
                </h1>
                <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                  Explore our curated selection of {context?.category?.name || resolvedParams.category} products
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
              {filteredItems.map((product: Product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.pages && meta.pages > 1 && meta.page && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white shadow-sm px-4 sm:px-8 py-4 sm:py-6">
                <div className="text-sm text-gray-600">
                  Showing page {meta.page} of {meta.pages} ({meta.total} products)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateParams({ page: Math.max(1, (meta.page || 1) - 1) })}
                    disabled={meta.page <= 1}
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Prev
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, meta.pages) }, (_, i) => {
                      let pageNum;
                      if (meta.pages! <= 5) {
                        pageNum = i + 1;
                      } else if ((meta.page || 1) <= 3) {
                        pageNum = i + 1;
                      } else if ((meta.page || 1) >= meta.pages! - 2) {
                        pageNum = meta.pages! - 4 + i;
                      } else {
                        pageNum = (meta.page || 1) - 2 + i;
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
                    onClick={() => updateParams({ page: Math.min(meta.pages!, (meta.page || 1) + 1) })}
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
            <p className="text-gray-500 text-lg">No active products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

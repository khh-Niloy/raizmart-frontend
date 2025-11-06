"use client";
import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { useGetProductsBySlugsQuery } from "@/app/redux/features/product/product.api";
import { useLocalCart } from "@/hooks/useLocalCart";
import { ProductGridSkeleton } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthGate } from "@/hooks/useAuthGate";

export default function SubcategoryListing({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const resolvedParams = React.use(params);
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);
  const sort = searchParams.get("sort") || "newest";

  const { data, isLoading, isError } = useGetProductsBySlugsQuery({
    category: resolvedParams.category,
    subcategory: resolvedParams.subcategory,
    page,
    limit,
    sort,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-20">
        <Skeleton className="h-8 w-64 mb-6" />
        <ProductGridSkeleton count={limit} />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="container mx-auto py-20">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Failed to Load Products</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  const { items, meta, context } = data as any;

  const Card: React.FC<{ product: any }> = ({ product }) => {
    const { addItem, has } = useLocalCart();
    const { requireAuth } = useAuthGate();
    const colorAttr = (product?.attributes || []).find(
      (a: any) => a.type?.toLowerCase?.() === "color" || a.name?.toLowerCase?.() === "color"
    );
    const primaryImage =
      colorAttr?.values?.[0]?.images?.[0] || product?.images?.[0] || "/next.svg";
    const variant = (product?.variants || [])[0];
    
    // Calculate price with discount support
    const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;
    const variantFinal = hasVariants ? variant?.finalPrice : undefined;
    const variantDiscPrice = hasVariants ? variant?.discountedPrice : undefined;
    const variantDiscPct = hasVariants ? (variant?.discountPercentage ?? variant?.discount) : undefined;
    
    const productFinal = !hasVariants ? (product as any)?.price : undefined;
    const productDiscPrice = !hasVariants ? (product as any)?.discountedPrice : undefined;
    const productDiscPct = !hasVariants ? (product as any)?.discountPercentage : undefined;
    
    const basePrice = hasVariants ? variantFinal : productFinal;
    const discounted = hasVariants ? variantDiscPrice : productDiscPrice;
    const pct = hasVariants ? variantDiscPct : productDiscPct;
    
    const formatPrice = (v: any) => {
      if (v === undefined || v === null) return "";
      const isNumeric = typeof v === 'number' || (!!v && /^\d+(?:\.\d+)?$/.test(String(v)));
      if (!isNumeric) return String(v);
      return `৳${Number(v).toLocaleString()}`;
    };
    
    const isNumeric = (val: any) => typeof val === 'number' || (!!val && /^\d+(?:\.\d+)?$/.test(String(val)));
    const showDiscount = isNumeric(discounted) && isNumeric(basePrice) && Number(discounted) < Number(basePrice);
    const pctText = (() => {
      if (pct !== undefined && pct !== null && pct !== '') return `${parseFloat(String(pct)).toFixed(0)}% OFF`;
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
      selectedOptions: undefined as any,
    };
    const inCart = has(matcher as any);
    
    return (
      <div className="border rounded-2xl p-3 bg-white hover:shadow transition">
        <Link href={`/product/${product.slug}`} className="cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={primaryImage} alt={product.name} className="w-full h-48 object-contain" />
          {product?.isFreeDelivery && (
            <div className="mt-2">
              <Badge className="bg-emerald-600 text-white border-transparent">Free Delivery</Badge>
            </div>
          )}
          <div className="mt-3 font-medium text-gray-900 line-clamp-2 min-h-[44px]">{product.name}</div>
        </Link>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          {showDiscount ? (
            <>
              <div className="text-[#111827] font-semibold text-rose-600">
                {formatPrice(discounted)}
              </div>
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(basePrice)}
              </div>
              {pctText && (
                <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold">
                  {pctText}
                </span>
              )}
            </>
          ) : (
            <div className="text-[#111827] font-semibold">
              {formatPrice(basePrice)}
            </div>
          )}
        </div>
        <button
          className={`mt-3 w-full h-10 rounded-xl border text-sm ${
            inCart ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
          onClick={() => {
            if (inCart) return;
            if (!requireAuth()) return;
            addItem({ ...matcher, quantity: 1 });
          }}
          disabled={inCart}
        >
          {inCart ? "Added" : "Add to Cart"}
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-20">
      <h1 className="text-2xl font-semibold mb-4">{context?.subcategory?.name}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items?.map((p: any) => (
          <Card key={p._id} product={p} />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-6">
        <a
          href={`?page=${Math.max(1, meta.page - 1)}&limit=${limit}&sort=${sort}`}
          className="px-3 py-1 border rounded"
          aria-disabled={meta.page <= 1}
        >
          Prev
        </a>
        <span className="text-sm">Page {meta.page} of {meta.pages}</span>
        <a
          href={`?page=${Math.min(meta.pages, meta.page + 1)}&limit=${limit}&sort=${sort}`}
          className="px-3 py-1 border rounded"
          aria-disabled={meta.page >= meta.pages}
        >
          Next
        </a>
      </div>
    </div>
  );
}



"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGetProductsBySlugsQuery } from "@/app/redux/features/product/product.api";
import { useLocalCart } from "@/hooks/useLocalCart";

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

  if (isLoading) return <div className="py-10">Loading...</div>;
  if (isError || !data?.success) return <div className="py-10">Failed to load products</div>;

  const { items, meta, context } = data as any;

  const Card: React.FC<{ product: any }> = ({ product }) => {
    const { addItem, has } = useLocalCart();
    const colorAttr = (product?.attributes || []).find(
      (a: any) => a.type?.toLowerCase?.() === "color" || a.name?.toLowerCase?.() === "color"
    );
    const primaryImage =
      colorAttr?.values?.[0]?.images?.[0] || product?.images?.[0] || "/next.svg";
    const variant = (product?.variants || [])[0];
    const matcher = {
      productId: product?._id as string,
      slug: product?.slug as string,
      name: product?.name as string,
      image: primaryImage as string,
      price: (variant?.finalPrice as number) || 0,
      sku: variant?.sku as string | undefined,
      selectedOptions: undefined as any,
    };
    const inCart = has(matcher as any);
    return (
      <div className="border rounded-2xl p-3 bg-white hover:shadow transition">
        <Link href={`/product/${product.slug}`} className="cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={primaryImage} alt={product.name} className="w-full h-48 object-contain" />
          <div className="mt-3 font-medium text-gray-900 line-clamp-2 min-h-[44px]">{product.name}</div>
        </Link>
        <div className="mt-1 text-[#111827] font-semibold">{variant?.finalPrice ? `৳ ${variant.finalPrice}` : ""}</div>
        <button
          className={`mt-3 w-full h-10 rounded-xl border text-sm ${
            inCart ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
          onClick={() => {
            if (inCart) return;
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



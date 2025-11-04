"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGetBrandProductsQuery } from "@/app/redux/features/brand/brand.api";
import { ProductGridSkeleton } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandListing({ params }: { params: Promise<{ brand: string }> }) {
  const resolved = React.use(params);
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);
  const sort = searchParams.get("sort") || "newest";

  const { data, isLoading, isError } = useGetBrandProductsQuery({ brand: resolved.brand, page, limit, sort });

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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">{context?.brand?.name}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items?.map((p: any) => (
          <Link key={p._id} href={`/product/${p.slug}`} className="border rounded p-3 block hover:shadow-sm cursor-pointer">
            <div className="font-medium mb-1">{p.name}</div>
            <div className="text-sm text-gray-500">{p.brand?.name}</div>
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-6">
        <a href={`?page=${Math.max(1, meta.page - 1)}&limit=${limit}&sort=${sort}`} className="px-3 py-1 border rounded">
          Prev
        </a>
        <span className="text-sm">Page {meta.page} of {meta.pages}</span>
        <a href={`?page=${Math.min(meta.pages, meta.page + 1)}&limit=${limit}&sort=${sort}`} className="px-3 py-1 border rounded">
          Next
        </a>
      </div>
    </div>
  );
}



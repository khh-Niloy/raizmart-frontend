"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGetBrandProductsQuery } from "@/app/redux/features/brand/brand.api";

export default function BrandListing({ params }: { params: Promise<{ brand: string }> }) {
  const resolved = React.use(params);
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);
  const sort = searchParams.get("sort") || "newest";

  const { data, isLoading, isError } = useGetBrandProductsQuery({ brand: resolved.brand, page, limit, sort });

  if (isLoading) return <div className="py-10">Loading...</div>;
  if (isError || !data?.success) return <div className="py-10">Failed to load brand products</div>;

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



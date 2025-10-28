"use client";
import React from "react";
import { useGetProductBySlugQuery } from "@/app/redux/features/product/product.api";

export default function ProductDetailBySlug({ params }: { params: { slug: string } }) {
  const { data, isLoading, isError } = useGetProductBySlugQuery(params.slug);

  if (isLoading) return <div className="py-10">Loading...</div>;
  if (isError || !data?.success) return <div className="py-10">Product not found</div>;

  const product = (data as any).data;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
      <div className="text-sm text-gray-500 mb-4">{product.brand?.name}</div>
      <div className="prose max-w-none">
        {/* description render here if available */}
      </div>
    </div>
  );
}



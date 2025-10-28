"use client";
import React from "react";
import { useGetProductBySlugQuery } from "@/app/redux/features/product/product.api";

export default function ProductDetailBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const { data, isLoading, isError } = useGetProductBySlugQuery(resolvedParams.slug);
  console.log("product detail response", data);

  if (isLoading) return <div className="py-10">Loading...</div>;
  if (isError || !data?.success) return <div className="py-10">Product not found</div>;

  const product = (data as any).data;
  console.log("product", product);

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



"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useGetBrandsQuery } from "@/app/redux/features/brand/brand.api";

export default function AllBrandPage() {
  const { data, isFetching } = useGetBrandsQuery(undefined);
  const brands: any[] = (data?.data ?? data ?? []) as any[];

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">All Brands</h1>
            <p className="text-gray-600 mt-1">Browse all brands</p>
          </div>

          <div className="px-6 pb-6">
            {isFetching ? (
              <div className="text-gray-600">Loading brands...</div>
            ) : brands.length === 0 ? (
              <div className="text-gray-600">No brands found.</div>
            ) : (
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {brands.map((brand: any) => (
                  <li key={brand.id ?? brand._id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-900 font-medium">{brand.brandName ?? brand.name ?? "Unnamed"}</span>
                      <Button type="button" variant="outline" className="px-4 py-1 h-9">Update</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

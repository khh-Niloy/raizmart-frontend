"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useGetBrandsQuery } from "@/app/redux/features/brand/brand.api";

interface Brand {
  id?: string;
  _id?: string;
  brandName?: string;
  name?: string;
  image?: string;
}

export default function AllBrandPage() {
  const { data, isFetching } = useGetBrandsQuery(undefined);
  console.log("Brands data:", data);
  // Ensure data is an array (transformResponse already extracts data, so data should be the array)
  const brands: Brand[] = Array.isArray(data) ? data : [];

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
                {brands.map((brand: Brand) => (
                  <li key={brand.id ?? brand._id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-gray-900 font-medium">{brand.brandName ?? brand.name ?? "Unnamed"}</span>
                        {!!brand?.image && (
                          <img
                            src={brand.image?.startsWith?.('http') ? brand.image : '/' + brand.image?.replace?.(/^\/*/, '')}
                            alt="Brand"
                            className="h-8 w-8 object-contain rounded border border-gray-200 bg-white"
                          />
                        )}
                      </div>
                      <Link href={`/admin/dashboard/edit-brand/${brand.id ?? brand._id}`} className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm" className="px-4 py-1 h-9">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
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

"use client"
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useGetBrandProductsQuery } from "@/app/redux/features/product/product.api";
import { useGetBrandsQuery } from "@/app/redux/features/brand/brand.api";
import { ProductCardSkeleton } from "@/components/ui/loading";
import { resolveImageUrl, pickProductImage } from "@/lib/utils";
import PaginationButtons from "@/components/main/pagination/PaginationButtons";

interface Product {
  _id: string;
  name: string;
  slug: string;
  status: string;
  brand?: string | { _id: string; name: string; slug?: string };
  price?: number | string;
  discountedPrice?: number;
  images?: string[];
  isFreeDelivery?: boolean;
  attributes?: Array<{
    type?: string;
    name?: string;
    values?: Array<{
      images?: string[];
    }>;
  }>;
  variants?: Array<{
    finalPrice?: number;
    discountedPrice?: number;
    discountPercentage?: number;
  }>;
  [key: string]: unknown;
}

interface ProductsResponse {
  items?: Product[];
  data?: Product[] | {
    items?: Product[];
  };
}

export default function BrandProducts() {
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  // Limit to 6 to show pagination for 7 items
  const productsPerPage = 6;
  
  // Use dedicated hook to fetch ALL brand products (server-filtered)
  const { data: productsData, isLoading: productsLoading, isError } = useGetBrandProductsQuery(undefined);
  const { data: brandsData, isLoading: brandsLoading } = useGetBrandsQuery(undefined);

  // Parse products
  const response = productsData as Product[] | ProductsResponse | undefined;
  let allItems: Product[] = [];
  
  if (Array.isArray(response)) {
    allItems = response;
  } else if (response) {
    if (Array.isArray(response.items)) {
      allItems = response.items;
    } else if (response.data) {
      if (Array.isArray(response.data)) {
        allItems = response.data;
      } else if (Array.isArray(response.data.items)) {
        allItems = response.data.items;
      }
    }
  }

  // Parse brands
  const allBrands = Array.isArray(brandsData) ? brandsData : [];

  // Parse brands and filter to only show those that have active brand products
  const brandsWithProducts = useMemo(() => {
    const brands = Array.isArray(brandsData) ? brandsData : [];
    // Count how many active brand products each brand has
    const brandCounts = allItems.reduce((acc, product) => {
      // Must be active and have isBrandProduct=true
      if (product.status === "active" && product.isBrandProduct === true) {
        const rawBrandId = typeof product.brand === "string" 
          ? product.brand 
          : product.brand?._id;
        
        if (rawBrandId) {
          const brandId = String(rawBrandId);
          acc[brandId] = (acc[brandId] || 0) + 1;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    return brands.filter(brand => brandCounts[String(brand._id)] > 0);
  }, [brandsData, allItems]);

  // Automatically select the first brand if "all" is selected or current selection is invalid
  React.useEffect(() => {
    if (brandsWithProducts.length > 0) {
      const isValidSelection = brandsWithProducts.some(b => String(b._id) === selectedBrand);
      if (selectedBrand === "all" || !isValidSelection) {
        setSelectedBrand(String(brandsWithProducts[0]._id));
      }
    }
  }, [brandsWithProducts, selectedBrand]);

  // Filter products by active status, isBrandProduct, and selected brand
  const filteredProducts = useMemo(() => {
    // Basic filter: active + has brand + isBrandProduct
    const validProducts = allItems.filter(
      (product: Product) => 
        product.status === "active" && 
        product.brand && 
        product.isBrandProduct === true
    );

    // Filter by specific brand
    const filtered = validProducts.filter((product) => {
      const productBrandId = typeof product.brand === "string" 
        ? product.brand 
        : product.brand?._id;
      return String(productBrandId) === selectedBrand;
    });

    return filtered;
  }, [allItems, selectedBrand]);

  // Reset pagination when brand changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage]);

  const isLoading = productsLoading || brandsLoading;

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 h-full">
      <div className="rounded-3xl border border-gray-100 bg-white shadow-[0_30px_90px_-60px_rgba(5,150,145,0.4)] px-4 sm:px-8 py-8 h-full flex flex-col">
        <header className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#02C1BE]">
              Shop by brand
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">
              <span className="text-gray-900">Brand </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
                Products
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Choose a brand to see curated assortments, exclusive bundles, and
              special financing options.
            </p>
          </div>
        </header>

        {/* Brand Tabs */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 min-w-max pb-2">
            {brandsWithProducts.map((brand: any) => (
              <button
                key={brand._id}
                onClick={() => setSelectedBrand(String(brand._id))}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 border-2 ${
                  selectedBrand === String(brand._id)
                    ? "bg-[#02C1BE] border-[#02C1BE] text-white shadow-lg shadow-[#02C1BE]/30"
                    : "bg-white border-gray-100 text-gray-600 hover:border-[#02C1BE]/30 hover:bg-gray-50"
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-inner"
              >
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : isError ? null : paginatedProducts?.length ? (
          <div className="space-y-8">
            <div className="grid flex-1 gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-5">
              {paginatedProducts.map((product: Product) => {
              const colorAttr = Array.isArray(product?.attributes)
                ? product.attributes.find(
                    (a) =>
                      (typeof a?.type === "string" &&
                        a.type.toLowerCase() === "color") ||
                      (typeof a?.name === "string" &&
                        a.name.toLowerCase() === "color")
                  )
                : undefined;

              const primaryImage = resolveImageUrl(
                (colorAttr?.values?.[0]?.images?.[0] as string | undefined) || pickProductImage(product)
              );

              const variant = Array.isArray(product?.variants)
                ? product.variants[0]
                : undefined;

              // Prefer numbers, fallback to 0
              const getNumber = (val: unknown): number =>
                typeof val === "number" && !isNaN(val) ? val : 0;

              const basePrice =
                getNumber(variant?.finalPrice) || getNumber(product?.price);
              const discountedPrice =
                getNumber(variant?.discountedPrice) ||
                getNumber(product?.discountedPrice);

              const hasDiscount =
                basePrice > 0 &&
                discountedPrice > 0 &&
                discountedPrice < basePrice;

              const finalPrice = hasDiscount ? discountedPrice : basePrice;
              const discountPercentage =
                hasDiscount && basePrice > 0
                  ? Math.round(
                      ((basePrice - discountedPrice) / basePrice) * 100
                    )
                  : 0;

              return (
                <Link
                  key={String(product._id)}
                  href={`/product/${product.slug ?? ""}`}
                  className="block"
                >
                  <div className="h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_25px_70px_-60px_rgba(5,150,145,0.45)] transition hover:shadow-[0_25px_70px_-45px_rgba(5,150,145,0.55)] relative">
                    {/* Discount Badge */}
                    {hasDiscount && discountPercentage > 0 && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-red-500 text-white border-transparent font-bold text-xs px-2 py-1">
                          -{discountPercentage}%
                        </Badge>
                      </div>
                    )}

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={typeof primaryImage === "string" ? primaryImage : "/next.svg"}
                      alt={String(product.name)}
                      className="w-full h-32 object-contain"
                    />

                    {product?.isFreeDelivery && (
                      <div className="mt-2">
                        <Badge className="bg-emerald-600 text-white border-transparent">
                          Free Delivery
                        </Badge>
                      </div>
                    )}
                    <div className="mt-3 font-medium text-gray-900 line-clamp-2 min-h-[44px]">
                      {String(product.name)}
                    </div>
                    <div className="mt-2 flex flex-col gap-1">
                      {hasDiscount ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-emerald-600">
                              ৳ {finalPrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              ৳ {basePrice.toLocaleString()}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-lg font-semibold text-[#111827]">
                          {finalPrice > 0 ? (
                            `৳ ${finalPrice.toLocaleString()}`
                          ) : typeof product.price === "string" && product.price ? (
                            <span className="text-orange-500 font-bold">{product.price}</span>
                          ) : (
                            ""
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-4">
                <PaginationButtons
                  meta={{
                    page: currentPage,
                    pages: totalPages,
                    total: filteredProducts.length
                  }}
                  updateParams={({ page }) => {
                    if (page) setCurrentPage(page);
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-slate-50/60 p-10 text-center text-gray-500">
            {selectedBrand === "all" 
              ? "No brand products available at the moment. Check back soon!"
              : "No products found for this brand. Try another one!"}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useGetProductsQuery,
  useToggleFreeDeliveryMutation,
} from "@/app/redux/features/product/product.api";
import { useLocalCart } from "@/hooks/useLocalCart";
import { useLocalWishlist } from "@/hooks/useLocalWishlist";

interface ProductItem {
  _id: string;
  name: string;
  brand?: { brandName: string };
  category?: { name: string };
  isFreeDelivery?: boolean;
}

export default function ManageFreeDeliveryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: productsData,
    isLoading,
    error,
  } = useGetProductsQuery(undefined);
  const [toggleFreeDelivery, { isLoading: isToggling }] =
    useToggleFreeDeliveryMutation();
  const { updateProductInfo: updateCartProductInfo } = useLocalCart();
  const { updateProductInfo: updateWishlistProductInfo } = useLocalWishlist();

  // Ensure data is an array (transformResponse already extracts data, so productsData should be the array)
  const products: ProductItem[] = useMemo(() => Array.isArray(productsData) ? productsData : [], [productsData]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (products.length === 0) return;
    const initial = new Set<string>();
    (products as ProductItem[]).forEach((p) => {
      if (p.isFreeDelivery) initial.add(p._id);
    });
    setSelectedIds(initial);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => {
      return (
        p.name?.toLowerCase().includes(term) ||
        p.brand?.brandName?.toLowerCase().includes(term) ||
        p.category?.name?.toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm]);

  const handleSelect = async (product: ProductItem) => {
    try {
      await toggleFreeDelivery({
        id: product._id,
        isFreeDelivery: true,
      }).unwrap();
      setSelectedIds((prev) => new Set(prev).add(product._id));
      updateCartProductInfo(product._id, { isFreeDelivery: true });
      updateWishlistProductInfo(product._id, { isFreeDelivery: true });
      toast.success("Set as free delivery");
    } catch {
      toast.error("Failed to set free delivery");
    }
  };

  const handleDeselect = async (product: ProductItem) => {
    try {
      await toggleFreeDelivery({
        id: product._id,
        isFreeDelivery: false,
      }).unwrap();
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(product._id);
        return next;
      });
      updateCartProductInfo(product._id, { isFreeDelivery: false });
      updateWishlistProductInfo(product._id, { isFreeDelivery: false });
      toast.success("Removed from free delivery");
    } catch {
      toast.error("Failed to update free delivery");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Manage Free Delivery
          </h1>
          <Card>
            <CardContent className="p-6">Loading products...</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Manage Free Delivery
          </h1>
          <Card>
            <CardContent className="p-6">Failed to load products.</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manage Free Delivery
              </h1>
              <p className="text-gray-600 mt-1">
                Search products and add/remove from free delivery
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products, categories, or brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div>
            {/* Selected Container */}
            <div className="mb-10">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Selected for Free Delivery{" "}
                    <Badge className="ml-2">{selectedIds.size}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedIds.size === 0 ? (
                    <div className="text-gray-600">No products selected.</div>
                  ) : (
                    <div className="space-y-2">
                      {(products as ProductItem[])
                        .filter((p) => selectedIds.has(p._id))
                        .map((p) => (
                          <div
                            key={p._id}
                            className="flex items-center justify-between py-1"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="truncate">{p.name}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeselect(p)}
                              disabled={isToggling}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="">
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredProducts.length === 0 ? (
                    <div className="text-center text-gray-600 py-8">
                      No products found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredProducts.map((p) => {
                        const isSelected = selectedIds.has(p._id);
                        return (
                          <div
                            key={p._id}
                            className="flex items-center justify-between py-3"
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {p.name}
                              </div>
                              <div className="text-sm text-gray-600 truncate">
                                {p.brand?.brandName && (
                                  <span>{p.brand.brandName}</span>
                                )}
                                {p.brand?.brandName && p.category?.name && (
                                  <span> • </span>
                                )}
                                {p.category?.name && (
                                  <span>{p.category.name}</span>
                                )}
                              </div>
                            </div>
                            {isSelected ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeselect(p)}
                                disabled={isToggling}
                              >
                                <X className="h-4 w-4 mr-1" /> Remove
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleSelect(p)}
                                disabled={isToggling}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

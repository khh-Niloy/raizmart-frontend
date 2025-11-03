"use client";

import React, { useState } from "react";
import { useGetProductsQuery, useToggleFeaturedMutation } from "@/app/redux/features/product/product.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  StarOff,
  Filter,
  MoreHorizontal,
  Package,
  Tag,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: {
    _id: string;
    name: string;
  };
  subCategory: {
    _id: string;
    name: string;
  };
  subSubCategory?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    brandName: string;
  };
  variants: Array<{
    sku: string;
    finalPrice: number;
    stock: number;
    isActive: boolean;
    attributeCombination: Array<{
      attributeName: string;
      attributeType: string;
      attributeValue: string;
      attributeLabel: string;
    }>;
  }>;
  attributes: Array<{
    name: string;
    type: string;
    values: Array<{
      label: string;
      value: string;
      colorCode?: string;
      images?: string[];
    }>;
  }>;
  specifications: Array<{
    key: string;
    value: string;
  }>;
  status: "active" | "inactive";
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AllProductPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "not-featured">("all");

  const { data: products = [], isLoading, error } = useGetProductsQuery(undefined);
  const [toggleFeatured, { isLoading: isTogglingFeatured }] = useToggleFeaturedMutation();

  // Filter products based on search and filters
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.brand?.brandName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesFeatured = featuredFilter === "all" || 
                           (featuredFilter === "featured" && product.isFeatured) ||
                           (featuredFilter === "not-featured" && !product.isFeatured);

    return matchesSearch && matchesStatus && matchesFeatured;
  });

  const handleToggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      await toggleFeatured({ id: productId, isFeatured: !currentStatus }).unwrap();
      toast.success(`Product ${!currentStatus ? 'added to' : 'removed from'} featured`);
    } catch (error) {
      toast.error("Failed to update featured status");
    }
  };

  const getMinPrice = (variants: Product['variants']) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map(v => v.finalPrice));
  };

  const getMaxPrice = (variants: Product['variants']) => {
    if (!variants || variants.length === 0) return 0;
    return Math.max(...variants.map(v => v.finalPrice));
  };

  const getTotalStock = (variants: Product['variants']) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((total, variant) => total + variant.stock, 0);
  };

  const getVariantCount = (variants: Product['variants']) => {
    return variants?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
            <p className="text-gray-600">Failed to load products. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">
                Manage your product inventory ({filteredProducts.length} products)
              </p>
            </div>
            <Link href="/admin/dashboard/add-product" className="cursor-pointer">
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products, categories, or brands..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    All Status
                  </Button>
                  <Button
                    variant={statusFilter === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("active")}
                  >
                    Active
                  </Button>
                  <Button
                    variant={statusFilter === "inactive" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("inactive")}
                  >
                    Inactive
                  </Button>
                </div>

                {/* Featured Filter */}
                <div className="flex gap-2">
                  <Button
                    variant={featuredFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeaturedFilter("all")}
                  >
                    All Products
                  </Button>
                  <Button
                    variant={featuredFilter === "featured" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeaturedFilter("featured")}
                  >
                    Featured
                  </Button>
                  <Button
                    variant={featuredFilter === "not-featured" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeaturedFilter("not-featured")}
                  >
                    Not Featured
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "all" || featuredFilter !== "all"
                    ? "No products match your current filters."
                    : "Get started by adding your first product."}
                </p>
                <Link href="/admin/dashboard/add-product" className="cursor-pointer">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: Product) => (
                <Card key={product._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {product.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={product.status === "active" ? "default" : "secondary"}>
                            {product.status}
                          </Badge>
                          {product.isFeatured && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/edit-product/${product._id}`} className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Product
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleFeatured(product._id, product.isFeatured)}
                            disabled={isTogglingFeatured}
                          >
                            {product.isFeatured ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" />
                                Remove from Featured
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Add to Featured
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Category & Brand */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="h-4 w-4" />
                        <span>{product.category?.name}</span>
                        {product.subCategory && (
                          <>
                            <span>•</span>
                            <span>{product.subCategory.name}</span>
                          </>
                        )}
                        {product.subSubCategory && (
                          <>
                            <span>•</span>
                            <span>{product.subSubCategory.name}</span>
                          </>
                        )}
                      </div>
                      {product.brand && (
                        <div className="text-sm text-gray-600">
                          Brand: {product.brand.brandName}
                        </div>
                      )}
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Price Range:</span>
                        <span className="text-sm font-semibold text-green-600">
                          ৳{getMinPrice(product.variants).toLocaleString()}
                          {getMinPrice(product.variants) !== getMaxPrice(product.variants) && 
                            ` - ৳${getMaxPrice(product.variants).toLocaleString()}`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {getVariantCount(product.variants)}
                        </div>
                        <div className="text-xs text-gray-600">Variants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {getTotalStock(product.variants)}
                        </div>
                        <div className="text-xs text-gray-600">Total Stock</div>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Created {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

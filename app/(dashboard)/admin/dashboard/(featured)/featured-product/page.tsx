"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Star, Plus, Package } from "lucide-react";
import { useGetProductsQuery, useToggleFeaturedMutation } from "@/app/redux/features/product/product.api";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  basePrice: number;
  category: any;
  subCategory: any;
  brand?: any;
  isFeatured?: boolean;
  status: string;
}

export default function FeaturedProductPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // Fetch all products
  const { data: allProducts, isLoading: productsLoading } = useGetProductsQuery(undefined);
  const [toggleFeatured, { isLoading: isToggling }] = useToggleFeaturedMutation();

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    if (!allProducts) return;

    const filtered = allProducts.filter((product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.subCategory?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchTerm, allProducts]);

  // Toggle featured status
  const handleToggleFeatured = async (product: Product) => {
    try {
      await toggleFeatured({
        id: product._id,
        isFeatured: !product.isFeatured
      }).unwrap();

      toast.success(
        `Product ${!product.isFeatured ? 'added to' : 'removed from'} featured`
      );
    } catch (error) {
      console.error("Error toggling featured status:", error);
      toast.error("Failed to toggle featured status");
    }
  };

  // Get featured products
  const featuredProducts = allProducts?.filter((product: Product) => product.isFeatured) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Featured Product Management</h1>
          <p className="text-gray-600 mt-2">
            Manage which products are featured on your homepage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search products by name, category, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Search Results */}
            {searchTerm && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">
                  Search Results ({searchResults.length}):
                </h4>
                {productsLoading ? (
                  <div className="text-gray-500 text-sm">Loading products...</div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{product.name}</p>
                              {product.isFeatured && (
                                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              ${product.basePrice} • {product.category?.name} → {product.subCategory?.name}
                              {product.brand && ` • ${product.brand.name}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleToggleFeatured(product)}
                          disabled={isToggling}
                          className={product.isFeatured ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                        >
                          {product.isFeatured ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No products found matching "{searchTerm}"</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Products Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Featured Products ({featuredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featuredProducts.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {featuredProducts.map((product: Product, index: number) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          ${product.basePrice} • {product.category?.name} → {product.subCategory?.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleToggleFeatured(product)}
                      disabled={isToggling}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No featured products yet</p>
                <p className="text-sm">Search and add products to feature them</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Search for products by name, category, subcategory, or brand</li>
            <li>• Click the + button to add a product to featured</li>
            <li>• Click the X button to remove a product from featured</li>
            <li>• Featured products will appear on your homepage</li>
            <li>• Changes are saved automatically</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

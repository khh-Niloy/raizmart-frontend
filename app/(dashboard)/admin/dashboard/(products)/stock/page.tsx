"use client";

import React, { useState } from "react";
import { useGetAllProductsStockQuery } from "@/app/redux/features/product/product.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Package, Image as ImageIcon, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface StockProduct {
  productId: string;
  productName: string;
  slug: string;
  status: "active" | "inactive";
  variants?: Array<{
    sku: string;
    stock: number;
    price: number;
    images: string[];
    attributeCombination?: Array<{
      attributeName: string;
      attributeLabel: string;
      attributeType?: string;
      attributeValue?: string;
    }>;
  }>;
  stock?: number;
  images?: string[];
}

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: stockData = [], isLoading, error } = useGetAllProductsStockQuery(undefined);
  const products: StockProduct[] = Array.isArray(stockData) ? stockData : [];

  // Flatten products into rows for table display
  const allTableRows: Array<{
    productId: string;
    productName: string;
    slug: string;
    status: string;
    sku?: string;
    stock: number;
    price?: number;
    images: string[];
    attributeCombination?: Array<{
      attributeName: string;
      attributeLabel: string;
    }>;
  }> = [];

  products.forEach((product) => {
    if (product.variants && product.variants.length > 0) {
      // For products with variants, create a row for each variant
      product.variants.forEach((variant) => {
        allTableRows.push({
          productId: product.productId,
          productName: product.productName,
          slug: product.slug,
          status: product.status,
          sku: variant.sku,
          stock: variant.stock || 0,
          price: variant.price,
          images: variant.images || [],
          attributeCombination: variant.attributeCombination,
        });
      });
    } else {
      // For products without variants, create a single row
      allTableRows.push({
        productId: product.productId,
        productName: product.productName,
        slug: product.slug,
        status: product.status,
        stock: product.stock || 0,
        images: product.images || [],
      });
    }
  });

  // Filter table rows based on search (including attributes)
  const tableRows = allTableRows.filter((row) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in product name
    const matchesName = row.productName.toLowerCase().includes(searchLower);
    
    // Search in slug
    const matchesSlug = row.slug.toLowerCase().includes(searchLower);
    
    // Search in SKU
    const matchesSku = row.sku?.toLowerCase().includes(searchLower) || false;
    
    // Search in attributes (both attribute name and label)
    const matchesAttributes = row.attributeCombination?.some((attr) => {
      const attrNameMatch = attr.attributeName.toLowerCase().includes(searchLower);
      const attrLabelMatch = attr.attributeLabel.toLowerCase().includes(searchLower);
      return attrNameMatch || attrLabelMatch;
    }) || false;
    
    return matchesName || matchesSlug || matchesSku || matchesAttributes;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Loading stock data...</div>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
            </div>
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Stock</h3>
                <p className="text-gray-600">Failed to load stock data. Please try again.</p>
              </CardContent>
            </Card>
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
              <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
              <p className="text-gray-600 mt-1">
                View and manage product stock levels ({tableRows.length} items)
              </p>
            </div>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products, SKU, or attributes (e.g., Black, 512GB, USA)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stock Table */}
          {tableRows.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stock Data Found</h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "No products match your search criteria."
                    : "No stock data available."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attributes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tableRows.map((row, index) => (
                        <tr key={`${row.productId}-${row.sku || 'no-variant'}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {row.images && row.images.length > 0 ? (
                              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                                <Image
                                  src={row.images[0]}
                                  alt={row.productName}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {row.productName}
                            </div>
                            <div className="text-sm text-gray-500">{row.slug}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">
                              {row.sku || (
                                <span className="text-gray-400 italic">No SKU</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {row.attributeCombination && row.attributeCombination.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {row.attributeCombination.map((attr, idx) => (
                                  <div key={idx} className="text-xs text-gray-600">
                                    <span className="font-medium">{attr.attributeName}:</span>{" "}
                                    <span>{attr.attributeLabel}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">No attributes</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {row.price !== undefined ? (
                              <div className="text-sm font-semibold text-gray-900">
                                ৳{row.price.toLocaleString()}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold">
                              <span
                                className={
                                  row.stock === 0
                                    ? "text-red-600"
                                    : row.stock < 10
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                }
                              >
                                {row.stock}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={row.status === "active" ? "default" : "secondary"}
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/admin/dashboard/edit-product/${row.productId}`} className="cursor-pointer">
                              <Button type="button" variant="outline" size="sm" className="px-3">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

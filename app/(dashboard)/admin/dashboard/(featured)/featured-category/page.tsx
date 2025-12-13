"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Star, Plus } from "lucide-react";
import { useGetCategoriesQuery, useGetSubcategoriesQuery, useGetSubSubcategoriesQuery } from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { useGetFeaturedItemsQuery, useCreateFeaturedItemMutation, useDeleteFeaturedItemMutation } from "@/app/redux/features/featured/featured.api";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  type: 'category' | 'subcategory' | 'subsubcategory';
  parentCategory?: string;
  parentSubcategory?: string;
}

interface FeaturedItem {
  _id: string;
  name: string;
  path: string;
}

interface CategoryItem {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  slug?: string;
  category?: string | { _id?: string; id?: string };
  subcategory?: string | { _id?: string; id?: string };
}

export default function FeaturedCategoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Category[]>([]);

  // Fetch all categories, subcategories, and sub-subcategories
  const { data: allCategories, isLoading: categoriesLoading } = useGetCategoriesQuery(undefined);
  const { data: allSubcategories, isLoading: subcategoriesLoading } = useGetSubcategoriesQuery(undefined);
  const { data: allSubSubcategories, isLoading: subSubcategoriesLoading } = useGetSubSubcategoriesQuery(undefined);
  
  // Fetch featured items
  const { data: featuredItems, isLoading: featuredLoading } = useGetFeaturedItemsQuery(undefined);
  const [createFeaturedItem] = useCreateFeaturedItemMutation();
  const [deleteFeaturedItem, { isLoading: isDeleting }] = useDeleteFeaturedItemMutation();

  // Ensure data is arrays
  const categoriesArray: CategoryItem[] = useMemo(() => Array.isArray(allCategories) ? allCategories : [], [allCategories]);
  const subcategoriesArray: CategoryItem[] = useMemo(() => Array.isArray(allSubcategories) ? allSubcategories : [], [allSubcategories]);
  const subSubcategoriesArray: CategoryItem[] = useMemo(() => Array.isArray(allSubSubcategories) ? allSubSubcategories : [], [allSubSubcategories]);
  const featuredItemsArray: FeaturedItem[] = useMemo(() => Array.isArray(featuredItems) ? featuredItems : [], [featuredItems]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    if (categoriesArray.length === 0 && subcategoriesArray.length === 0 && subSubcategoriesArray.length === 0) return;

    const searchResults: Category[] = [];

    // Search in categories
    categoriesArray.forEach((category: CategoryItem) => {
      if (category.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        const id = category._id || category.id;
        const name = category.name;
        if (id && name) {
          searchResults.push({
            id,
            name,
            type: 'category',
            description: category.description,
            image: category.image
          });
        }
      }
    });

    // Search in subcategories
    subcategoriesArray.forEach((subcategory: CategoryItem) => {
      if (subcategory.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        // Find parent category name
        const parentCategory = categoriesArray.find((cat: CategoryItem) => 
          (cat._id ?? cat.id) === (typeof subcategory.category === 'string' ? subcategory.category : subcategory.category?._id ?? subcategory.category?.id)
        );
        
        const id = subcategory._id || subcategory.id;
        const name = subcategory.name;
        if (id && name) {
          searchResults.push({
            id,
            name,
            type: 'subcategory',
            parentCategory: parentCategory?.name || 'Unknown Category',
            description: subcategory.description,
            image: subcategory.image
          });
        }
      }
    });

    // Search in sub-subcategories
    subSubcategoriesArray.forEach((subSubcategory: CategoryItem) => {
      if (subSubcategory.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        // Find parent subcategory and category names
        const parentSubcategory = subcategoriesArray.find((sub: CategoryItem) => 
          (sub._id ?? sub.id) === (typeof subSubcategory.subcategory === 'string' ? subSubcategory.subcategory : subSubcategory.subcategory?._id ?? subSubcategory.subcategory?.id)
        );
        const parentCategory = categoriesArray.find((cat: CategoryItem) => 
          (cat._id ?? cat.id) === (typeof parentSubcategory?.category === 'string' ? parentSubcategory.category : parentSubcategory?.category?._id ?? parentSubcategory?.category?.id)
        );
        
        const id = subSubcategory._id || subSubcategory.id;
        const name = subSubcategory.name;
        if (id && name) {
          searchResults.push({
            id,
            name,
            type: 'subsubcategory',
            parentCategory: parentCategory?.name || 'Unknown Category',
            parentSubcategory: parentSubcategory?.name || 'Unknown Subcategory',
            description: subSubcategory.description,
            image: subSubcategory.image
          });
        }
      }
    });

    setSearchResults(searchResults);
  }, [searchTerm, categoriesArray, subcategoriesArray, subSubcategoriesArray]);

  // Generate path based on category type
  const generatePath = (category: Category) => {
    if (category.type === 'category') {
      // Find category slug
      const categoryData = categoriesArray.find((cat: CategoryItem) => 
        (cat._id ?? cat.id) === category.id
      );
      return `/category/${categoryData?.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`;
    } else if (category.type === 'subcategory') {
      // Find subcategory and parent category slugs
      const subcategoryData = subcategoriesArray.find((sub: CategoryItem) => 
        (sub._id ?? sub.id) === category.id
      );
      const parentCategory = categoriesArray.find((cat: CategoryItem) => 
        (cat._id ?? cat.id) === (typeof subcategoryData?.category === 'string' ? subcategoryData.category : subcategoryData?.category?._id ?? subcategoryData?.category?.id)
      );
      return `/category/${parentCategory?.slug || 'category'}/${subcategoryData?.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`;
    } else if (category.type === 'subsubcategory') {
      // Find sub-subcategory, subcategory, and parent category slugs
      const subSubcategoryData = subSubcategoriesArray.find((subSub: CategoryItem) => 
        (subSub._id ?? subSub.id) === category.id
      );
      const parentSubcategory = subcategoriesArray.find((sub: CategoryItem) => 
        (sub._id ?? sub.id) === (typeof subSubcategoryData?.subcategory === 'string' ? subSubcategoryData.subcategory : subSubcategoryData?.subcategory?._id ?? subSubcategoryData?.subcategory?.id)
      );
      const parentCategory = categoriesArray.find((cat: CategoryItem) => 
        (cat._id ?? cat.id) === (typeof parentSubcategory?.category === 'string' ? parentSubcategory.category : parentSubcategory?.category?._id ?? parentSubcategory?.category?.id)
      );
      return `/category/${parentCategory?.slug || 'category'}/${parentSubcategory?.slug || 'subcategory'}/${subSubcategoryData?.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`;
    }
    return '/category';
  };

  // Add category to featured
  const addToFeatured = async (category: Category) => {
    try {
      // Check if already featured
      const isAlreadyFeatured = featuredItemsArray.some(
        (item: FeaturedItem) => item.name === category.name
      );

      if (isAlreadyFeatured) {
        toast.error("This item is already featured");
        return;
      }

      const path = generatePath(category);
      
      await createFeaturedItem({
        name: category.name,
        path: path
      }).unwrap();

      setSearchTerm("");
      setSearchResults([]);
      toast.success("Item added to featured");
    } catch {
      toast.error("Failed to add item to featured");
    }
  };

  // Remove item from featured
  const removeFromFeatured = async (itemId: string) => {
    try {
      await deleteFeaturedItem(itemId).unwrap();
      toast.success("Item removed from featured");
    } catch {
      toast.error("Failed to remove item from featured");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Featured Items Management</h1>
          <p className="text-gray-600 mt-2">
            Manage which items are featured on your homepage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search categories, subcategories, or sub-subcategories (e.g., 'electronics', 'tv', 'android')"
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
                {(categoriesLoading || subcategoriesLoading || subSubcategoriesLoading) ? (
                  <div className="text-gray-500 text-sm">Loading...</div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          {category.image && (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{category.name}</p>
                              <Badge 
                                variant={category.type === 'category' ? 'default' : 
                                         category.type === 'subcategory' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {category.type === 'category' ? 'Category' : 
                                 category.type === 'subcategory' ? 'Subcategory' : 'Sub-Subcategory'}
                              </Badge>
                            </div>
                            {category.parentCategory && (
                              <p className="text-sm text-gray-500">
                                Parent: {category.parentCategory}
                                {category.parentSubcategory && ` → ${category.parentSubcategory}`}
                              </p>
                            )}
                            {category.description && (
                              <p className="text-sm text-gray-500">{category.description}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToFeatured(category)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No categories found matching &quot;{searchTerm}&quot;</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Featured Items ({featuredItemsArray.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featuredLoading ? (
              <div className="text-gray-500 text-sm">Loading featured items...</div>
            ) : featuredItemsArray.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {featuredItemsArray.map((item: FeaturedItem, index: number) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Path: {item.path}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromFeatured(item._id)}
                      disabled={isDeleting}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No featured items yet</p>
                <p className="text-sm">Search and add items to feature them</p>
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
            <li>• Search across all levels: Categories, Subcategories, and Sub-Subcategories</li>
            <li>• Results show the hierarchy (e.g., &quot;Electronics → TV → Android&quot;)</li>
            <li>• Click the + button to add any level to featured</li>
            <li>• Featured items will appear on your homepage with proper redirects</li>
            <li>• Use the X button to remove items from featured</li>
            <li>• Changes are saved automatically</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
  useGetSubSubcategoriesQuery,
} from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  isFeatured?: boolean;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  category?: Category;
  isFeatured?: boolean;
}

interface SubSubcategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  subcategory?: Subcategory;
  category?: Category; // Depending on populate
  isFeatured?: boolean;
}

interface FeaturedItem {
  _id: string;
  name: string;
  image?: string;
  url: string;
  type: "category" | "subcategory" | "subsubcategory";
}

const FeaturedCategories = () => {
  const { data: categoriesData, isLoading: isCatLoading } = useGetCategoriesQuery(undefined);
  const { data: subcategoriesData, isLoading: isSubLoading } = useGetSubcategoriesQuery(undefined);
  const { data: subSubcategoriesData, isLoading: isSubSubLoading } = useGetSubSubcategoriesQuery(undefined);

  const featuredItems = useMemo(() => {
    const items: FeaturedItem[] = [];

    // Process Categories
    const categories = Array.isArray(categoriesData) ? (categoriesData as Category[]) : [];
    categories.forEach((cat) => {
      if (cat.isFeatured) {
        items.push({
          _id: cat._id,
          name: cat.name,
          image: cat.image,
          url: `/category/${cat.slug}`,
          type: "category",
        });
      }
    });

    // Process Subcategories
    const subcategories = Array.isArray(subcategoriesData) ? (subcategoriesData as Subcategory[]) : [];
    subcategories.forEach((sub) => {
      if (sub.isFeatured && sub.category?.slug) {
        items.push({
          _id: sub._id,
          name: sub.name,
          image: sub.image,
          url: `/category/${sub.category.slug}/${sub.slug}`,
          type: "subcategory",
        });
      }
    });

    // Process Sub-Subcategories
    const subSubcategories = Array.isArray(subSubcategoriesData) ? (subSubcategoriesData as SubSubcategory[]) : [];
    subSubcategories.forEach((ss) => {
      // Access deep populated category via subcategory
      const sub = ss.subcategory;
      const cat = sub?.category;
      
      if (ss.isFeatured && sub?.slug && cat?.slug) {
        items.push({
          _id: ss._id,
          name: ss.name,
          image: ss.image,
          url: `/category/${cat.slug}/${sub.slug}/${ss.slug}`,
          type: "subsubcategory",
        });
      }
    });

    return items;
  }, [categoriesData, subcategoriesData, subSubcategoriesData]);

  const isLoading = isCatLoading || isSubLoading || isSubSubLoading;

  if (isLoading) {
    return (
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 py-8">
        <div className="rounded-3xl border border-gray-100 bg-white shadow-[0_30px_90px_-60px_rgba(5,150,145,0.4)] px-4 sm:px-8 py-8 flex flex-col">
          <div className="flex flex-col gap-4 mb-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredItems.length === 0) {
    return null;
  }

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 py-8">
      <div className="rounded-3xl border border-gray-100 bg-white shadow-[0_30px_90px_-60px_rgba(5,150,145,0.4)] px-4 sm:px-8 py-8 flex flex-col">
        <header className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#02C1BE]">Featured collection</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
              <span>Featured </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
                Categories
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Explore our top picks for you
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {featuredItems.map((item) => (
            <Link
              key={`${item.type}-${item._id}`}
              href={item.url}
              className="group flex flex-col items-center bg-white transition-all duration-300"
            >
              <div className="relative h-20 w-20 mb-3 overflow-hidden rounded-full border-2 border-slate-50 group-hover:border-[#02C1BE]/20 transition-colors">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-slate-50 text-slate-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-slate-800 text-center line-clamp-2 group-hover:text-[#02C1BE] transition-colors">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;

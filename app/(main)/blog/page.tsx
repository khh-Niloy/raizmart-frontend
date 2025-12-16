"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetBlogsQuery } from "@/app/redux/features/blog-category/blog-category.api";
import { BlogCardSkeleton } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";

export default function BlogPage() {
  const { data, isLoading, isError } = useGetBlogsQuery(undefined);
  interface Blog {
    _id?: string;
    id?: string;
    slug?: string;
    blogTitle?: string;
    title?: string;
    status?: string;
    image?: string;
    thumbnail?: string;
    category?: {
      _id?: string;
      id?: string;
      name?: string;
    } | string;
    categoryName?: string;
    tags?: string[];
    blogContent?: unknown;
    content?: unknown;
    createdAt?: string;
    [key: string]: unknown;
  }

  // Ensure data is an array (transformResponse already extracts data, so data should be the array)
  const blogs: Blog[] = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12 pb-16">
            <div className="mb-12">
              <Skeleton className="h-10 w-48 mb-4" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12 pb-16">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-red-600 font-semibold">Failed to load blogs. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter only active blogs
  const activeBlogs = blogs.filter(
    (blog) => blog.status === "active" || !blog.status
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-10">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-16 pb-16">
          {/* Header Section */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12">
            <section className="rounded-3xl border border-white/70 bg-white/95 p-6 sm:p-8 lg:p-12 shadow-[0_30px_90px_-60px_rgba(5,150,145,0.45)]">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                  Latest Insights & Updates
                </h1>
                <p className="text-base sm:text-lg text-slate-600">
                  Stay informed with expert tips, product guides, and industry news to make smarter purchasing decisions.
                </p>
              </div>
            </section>
          </div>

          {/* Blog Grid */}
          <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-14">
            {activeBlogs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#02C1BE]/30 bg-[#f7fffe] p-12 text-center">
                <BookOpen className="h-12 w-12 text-[#02C1BE] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No blog posts available</h3>
                <p className="text-slate-600">Check back soon for new articles and insights.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBlogs.map((blog: Blog) => {
                  const id = blog.id ?? blog._id;
                  const slug = blog.slug || id;
                  const title = blog.blogTitle || blog.title || "Untitled";
                  const category = (typeof blog.category === 'object' && blog.category !== null)
                    ? (blog.category.name || blog.categoryName || "Uncategorized")
                    : (blog.categoryName || "Uncategorized");
                  const image = blog.image || blog.thumbnail;
                  const tags = Array.isArray(blog.tags) ? blog.tags : [];
                  const createdAt = blog.createdAt 
                    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "";

                  // Extract excerpt from content
                  let excerpt = "";
                  if (blog.blogContent || blog.content) {
                    const content = blog.blogContent || blog.content;
                    if (typeof content === "string") {
                      const plainText = content
                        .replace(/<[^>]*>/g, "")
                        .replace(/\s+/g, " ")
                        .trim();
                      excerpt = plainText.length > 120 
                        ? plainText.substring(0, 120) + "..." 
                        : plainText;
                    }
                  }

                  return (
                    <Link
                      key={id}
                      href={`/blog/${slug}`}
                      className="group flex flex-col h-full rounded-3xl border border-white/70 bg-white/95 overflow-hidden shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_-55px_rgba(5,150,145,0.6)]"
                    >
                      {/* Image */}
                      {image && (
                        <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-gray-100">
                          <Image
                            src={
                              image.startsWith("http")
                                ? image
                                : `/${image.replace(/^\/*/, "")}`
                            }
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="inline-flex items-center rounded-full bg-[#02C1BE]/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white uppercase tracking-wide">
                              {category}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex flex-col flex-1 p-5 sm:p-6">
                        {/* Title */}
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 group-hover:text-[#02C1BE] transition-colors line-clamp-2">
                          {title}
                        </h2>

                        {/* Excerpt */}
                        {excerpt && (
                          <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-1">
                            {excerpt}
                          </p>
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {tags.slice(0, 2).map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {tags.length > 2 && (
                              <span className="text-xs px-2.5 py-1 text-slate-500">
                                +{tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          {createdAt && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{createdAt}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs font-semibold text-[#02C1BE] group-hover:gap-2 transition-all">
                            <span>Read more</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

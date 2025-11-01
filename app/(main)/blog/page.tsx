"use client";

import React from "react";
import Link from "next/link";
import { useGetBlogsQuery } from "@/app/redux/features/blog-category/blog-category.api";

export default function BlogPage() {
  const { data, isLoading, isError } = useGetBlogsQuery(undefined);
  const blogs: any[] = (data?.data ?? data ?? []) as any[];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">Loading blogs...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-red-600">Failed to load blogs</div>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Our Blog</h1>
          <p className="text-gray-600">No blog posts available at the moment.</p>
        </div>
      </div>
    );
  }

  // Filter only active blogs
  const activeBlogs = blogs.filter(
    (blog) => blog.status === "active" || !blog.status
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Our Blog
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay updated with the latest news, tips, and insights
        </p>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {activeBlogs.map((blog: any) => {
          const id = blog.id ?? blog._id;
          const slug = blog.slug || id;
          const title = blog.blogTitle || blog.title || "Untitled";
          const category = blog.category?.name || blog.categoryName || "Uncategorized";
          const image = blog.image || blog.thumbnail;
          const tags = Array.isArray(blog.tags) ? blog.tags : [];
          const createdAt = blog.createdAt 
            ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "";

          // Extract excerpt from content
          let excerpt = "";
          if (blog.blogContent || blog.content) {
            const content = blog.blogContent || blog.content;
            if (typeof content === "string") {
              // Remove HTML tags and get first 150 characters
              const plainText = content
                .replace(/<[^>]*>/g, "")
                .replace(/\s+/g, " ")
                .trim();
              excerpt = plainText.length > 150 
                ? plainText.substring(0, 150) + "..." 
                : plainText;
            }
          }

          return (
            <Link
              key={id}
              href={`/blog/${slug}`}
              className="group block bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
            >
              {/* Image */}
              {image && (
                <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-100">
                  <img
                    src={
                      image.startsWith("http")
                        ? image
                        : `/${image.replace(/^\/*/, "")}`
                    }
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Category */}
                <div className="mb-2">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    {category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {title}
                </h2>

                {/* Excerpt */}
                {excerpt && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {excerpt}
                  </p>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.slice(0, 3).map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="text-xs px-2 py-1 text-gray-500">
                        +{tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Date */}
                {createdAt && (
                  <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    {createdAt}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {activeBlogs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No active blog posts available.</p>
        </div>
      )}
    </div>
  );
}

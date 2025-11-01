"use client";

import React from "react";
import Link from "next/link";
import { useGetBlogByIdQuery, useGetBlogsQuery } from "@/app/redux/features/blog-category/blog-category.api";

// Helper to parse and render Tiptap content
const renderTiptapContent = (content: any) => {
  if (!content) return null;

  // If content is a string, try to parse it as JSON
  let parsedContent;
  if (typeof content === "string") {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      // If parsing fails, treat as HTML
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
  } else {
    parsedContent = content;
  }

  // If it's a Tiptap JSON structure
  if (parsedContent && typeof parsedContent === "object") {
    if (parsedContent.type === "doc" && parsedContent.content) {
      return renderTiptapNodes(parsedContent.content);
    }
  }

  // Fallback to HTML rendering
  return <div dangerouslySetInnerHTML={{ __html: String(content) }} />;
};

const renderTiptapNodes = (nodes: any[]): JSX.Element[] => {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "paragraph":
        return (
          <p key={index} className="mb-4">
            {node.content && renderTiptapNodes(node.content)}
          </p>
        );
      case "heading":
        const level = node.attrs?.level || 1;
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={index} className={`mb-4 ${getHeadingClass(level)}`}>
            {node.content && renderTiptapNodes(node.content)}
          </HeadingTag>
        );
      case "bulletList":
        return (
          <ul key={index} className="list-disc list-inside mb-4 ml-4">
            {node.content && renderTiptapNodes(node.content)}
          </ul>
        );
      case "orderedList":
        return (
          <ol key={index} className="list-decimal list-inside mb-4 ml-4">
            {node.content && renderTiptapNodes(node.content)}
          </ol>
        );
      case "listItem":
        return (
          <li key={index} className="mb-2">
            {node.content && renderTiptapNodes(node.content)}
          </li>
        );
      case "text":
        return <React.Fragment key={index}>{node.text}</React.Fragment>;
      case "hardBreak":
        return <br key={index} />;
      case "blockquote":
        return (
          <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-4">
            {node.content && renderTiptapNodes(node.content)}
          </blockquote>
        );
      default:
        return (
          <div key={index}>
            {node.content && renderTiptapNodes(node.content)}
          </div>
        );
    }
  });
};

const getHeadingClass = (level: number) => {
  switch (level) {
    case 1:
      return "text-4xl font-bold";
    case 2:
      return "text-3xl font-bold";
    case 3:
      return "text-2xl font-semibold";
    case 4:
      return "text-xl font-semibold";
    default:
      return "text-lg font-semibold";
  }
};

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = React.use(params);
  const { slug } = resolvedParams;

  // Get all blogs first to find the one matching the slug
  const { data: allBlogsResp, isLoading: isLoadingBlogs } = useGetBlogsQuery(undefined);
  const allBlogs: any[] = (allBlogsResp?.data ?? allBlogsResp ?? []) as any[];

  // Find the blog ID from the slug
  const blogFromSlug = React.useMemo(() => {
    if (!allBlogs || allBlogs.length === 0) return null;
    
    // Try to find by slug first
    let foundBlog = allBlogs.find((b: any) => b.slug === slug);
    
    // If not found by slug, try to match by ID (in case slug is actually an ID)
    if (!foundBlog) {
      foundBlog = allBlogs.find(
        (b: any) => (b.id ?? b._id) === slug || String(b.id ?? b._id) === slug
      );
    }
    
    return foundBlog || null;
  }, [allBlogs, slug]);

  // Get the blog ID
  const blogId = blogFromSlug ? (blogFromSlug.id ?? blogFromSlug._id) : null;

  // Fetch the full blog by ID using the backend endpoint
  const { data: blogResponse, isLoading: isLoadingBlog, isError } = useGetBlogByIdQuery(
    blogId as string,
    { skip: !blogId }
  );

  const isLoading = isLoadingBlogs || isLoadingBlog;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">Loading blog post...</div>
      </div>
    );
  }

  // Check if blog was not found
  if (!blogFromSlug || (!blogId && !isLoading)) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <Link href="/blog" className="text-blue-600 hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (isError || !blogResponse) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Blog Post</h1>
          <Link href="/blog" className="text-blue-600 hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Extract blog data from the response
  // Backend returns: { success: true, message: "...", data: blog }
  const blog: any = blogResponse?.data ?? blogResponse;

  // Don't show if blog is not active
  if (blog.status && blog.status !== "active") {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Available</h1>
          <Link href="/blog" className="text-blue-600 hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const title = blog.blogTitle || blog.title || "Untitled";
  const category = blog.category?.name || blog.categoryName || "Uncategorized";
  const categoryId = blog.category?._id || blog.category?.id || blog.category;
  const image = blog.image || blog.thumbnail;
  const tags = Array.isArray(blog.tags) ? blog.tags : [];
  const content = blog.blogContent || blog.content;
  const createdAt = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const updatedAt = blog.updatedAt
    ? new Date(blog.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Get related blogs (same category, excluding current)
  const relatedBlogs = allBlogs
    .filter(
      (b: any) =>
        (b.id ?? b._id) !== (blog.id ?? blog._id) &&
        (b.status === "active" || !b.status) &&
        ((b.category?._id || b.category?.id || b.category) === categoryId ||
          b.category === categoryId)
    )
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      {/* Back Button */}
      <Link
        href="/blog"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Blog
      </Link>

      {/* Featured Image */}
      {image && (
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
          <img
            src={
              image.startsWith("http") ? image : `/${image.replace(/^\/*/, "")}`
            }
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Header */}
      <article>
        {/* Category */}
        <div className="mb-4">
          <Link
            href={`/blog?category=${categoryId}`}
            className="text-sm font-semibold text-blue-600 uppercase tracking-wide hover:text-blue-800"
          >
            {category}
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          {title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-200">
          {createdAt && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Published:</span> {createdAt}
            </div>
          )}
          {updatedAt && updatedAt !== createdAt && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Updated:</span> {updatedAt}
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {content ? (
            renderTiptapContent(content)
          ) : (
            <p className="text-gray-600">No content available.</p>
          )}
        </div>
      </article>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBlogs.map((relatedBlog: any) => {
              const relatedId = relatedBlog.id ?? relatedBlog._id;
              const relatedSlug = relatedBlog.slug || relatedId;
              const relatedTitle = relatedBlog.blogTitle || relatedBlog.title || "Untitled";
              const relatedImage = relatedBlog.image || relatedBlog.thumbnail;
              const relatedCategory = relatedBlog.category?.name || relatedBlog.categoryName || "Uncategorized";

              return (
                <Link
                  key={relatedId}
                  href={`/blog/${relatedSlug}`}
                  className="group block bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
                >
                  {relatedImage && (
                    <div className="relative w-full h-40 overflow-hidden bg-gray-100">
                      <img
                        src={
                          relatedImage.startsWith("http")
                            ? relatedImage
                            : `/${relatedImage.replace(/^\/*/, "")}`
                        }
                        alt={relatedTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      {relatedCategory}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {relatedTitle}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Back to Blog Button */}
      <div className="mt-12 text-center">
        <Link
          href="/blog"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View All Posts
        </Link>
      </div>
    </div>
  );
}


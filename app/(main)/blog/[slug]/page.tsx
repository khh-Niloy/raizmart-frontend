"use client";

import React from "react";
import Link from "next/link";
import { useGetBlogByIdQuery, useGetBlogsQuery } from "@/app/redux/features/blog-category/blog-category.api";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, Tag as TagIcon, BookOpen, ArrowRight } from "lucide-react";

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

const renderTiptapNodes = (nodes: any[]): React.ReactElement[] => {
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
        const HeadingTag = `h${Math.min(Math.max(level, 1), 6)}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        const HeadingComponent = HeadingTag;
        return (
          <HeadingComponent key={index} className={`mb-4 ${getHeadingClass(level)}`}>
            {node.content && renderTiptapNodes(node.content)}
          </HeadingComponent>
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
          <blockquote key={index} className="border-l-4 border-[#02C1BE] pl-6 pr-4 py-4 my-6 bg-[#f7fffe] rounded-r-lg italic text-slate-700">
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
      <div className="min-h-screen bg-slate-50">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12 pb-16">
            <div className="max-w-4xl mx-auto space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-64 w-full rounded-3xl" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if blog was not found
  if (!blogFromSlug || (!blogId && !isLoading)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12 pb-16">
            <div className="rounded-3xl border border-dashed border-[#02C1BE]/30 bg-[#f7fffe] p-12 text-center">
              <BookOpen className="h-12 w-12 text-[#02C1BE] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Blog Post Not Found</h1>
              <Link href="/blog" className="inline-flex items-center gap-2 text-[#02C1BE] hover:text-[#01b1ae] font-semibold">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !blogResponse) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12 pb-16">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blog Post</h1>
              <Link href="/blog" className="inline-flex items-center gap-2 text-[#02C1BE] hover:text-[#01b1ae] font-semibold">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </div>
          </div>
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
      <div className="min-h-screen bg-slate-50">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12 pb-16">
            <div className="rounded-3xl border border-dashed border-[#02C1BE]/30 bg-[#f7fffe] p-12 text-center">
              <BookOpen className="h-12 w-12 text-[#02C1BE] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Blog Post Not Available</h1>
              <Link href="/blog" className="inline-flex items-center gap-2 text-[#02C1BE] hover:text-[#01b1ae] font-semibold">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </div>
          </div>
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
    <div className="min-h-screen bg-slate-50">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-16 pb-16">
          {/* Header Section */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 pt-8 lg:pt-12">
            {/* Back Button */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 mb-6 text-[#02C1BE] hover:text-[#01b1ae] font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blog</span>
            </Link>

            {/* Featured Image */}
            {image && (
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden shadow-[0_30px_90px_-60px_rgba(5,150,145,0.45)] border border-white/70">
                <img
                  src={
                    image.startsWith("http") ? image : `/${image.replace(/^\/*/, "")}`
                  }
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-14">
            <article className="rounded-3xl border border-white/70 bg-white/95 p-6 sm:p-8 lg:p-12 shadow-[0_30px_90px_-60px_rgba(5,150,145,0.45)]">
              {/* Category */}
              <div className="mb-4">
                <Link
                  href={`/blog?category=${categoryId}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#02C1BE]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE] hover:bg-[#02C1BE]/20 transition"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {category}
                </Link>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                {title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 pb-6 border-b border-gray-200">
                {createdAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-[#02C1BE]" />
                    <span className="font-medium">Published:</span>
                    <span>{createdAt}</span>
                  </div>
                )}
                {updatedAt && updatedAt !== createdAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-[#02C1BE]" />
                    <span className="font-medium">Updated:</span>
                    <span>{updatedAt}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      <TagIcon className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none mb-8 prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-[#02C1BE] prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700 prose-li:text-slate-700">
                {content ? (
                  renderTiptapContent(content)
                ) : (
                  <p className="text-slate-600">No content available.</p>
                )}
              </div>
            </article>
          </div>

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Related Posts
                </h2>
                <p className="text-slate-600 mt-2">Discover more articles you might like</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="group flex flex-col h-full rounded-3xl border border-white/70 bg-white/95 overflow-hidden shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_-55px_rgba(5,150,145,0.6)]"
                    >
                      {relatedImage && (
                        <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-gray-100">
                          <img
                            src={
                              relatedImage.startsWith("http")
                                ? relatedImage
                                : `/${relatedImage.replace(/^\/*/, "")}`
                            }
                            alt={relatedTitle}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="inline-flex items-center rounded-full bg-[#02C1BE]/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white uppercase tracking-wide">
                              {relatedCategory}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col flex-1 p-5 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 group-hover:text-[#02C1BE] transition-colors line-clamp-2">
                          {relatedTitle}
                        </h3>
                        <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-[#02C1BE] group-hover:gap-2 transition-all">
                          <span>Read more</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back to Blog Button */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full bg-[#02C1BE] hover:bg-[#01b1ae] text-white font-semibold px-6 py-3 shadow-[0_18px_40px_-30px_rgba(5,150,145,0.7)] transition"
            >
              <span>View All Posts</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


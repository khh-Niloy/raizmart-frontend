"use client";
import React, { useCallback } from "react";
import { useLocalCart } from "@/hooks/useLocalCart";
import { useLocalWishlist } from "@/hooks/useLocalWishlist";
import { useGetProductBySlugQuery, useGetProductsBySlugsQuery } from "@/app/redux/features/product/product.api";
import { useSyncProductPrices } from "@/hooks/useSyncProductPrices";
import Link from "next/link";
import { ProductDetailSkeleton } from "@/components/ui/loading";
import { useAuthGate } from "@/hooks/useAuthGate";
import { toast } from "sonner";

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function ProductDetailBySlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = React.use(params);
  const { data, isLoading, isError } = useGetProductBySlugQuery(
    resolvedParams.slug
  );
  interface ProductData {
    _id?: string;
    name?: string;
    slug?: string;
    price?: number;
    discountedPrice?: number;
    discountPercentage?: number;
    images?: string[];
    video?: string;
    video_url?: string;
    descriptionImages?: string[];
    descriptionImage?: string; // Keep for backward compatibility
    description_image?: string; // Keep for backward compatibility
    isFreeDelivery?: boolean;
    isWarrantyAvailable?: boolean;
    category?: string | { slug?: string; name?: string; [key: string]: unknown };
    subCategory?: string | { slug?: string; name?: string; [key: string]: unknown };
    subSubCategory?: string | { slug?: string; name?: string; [key: string]: unknown };
    attributes?: Array<{
      name: string;
      type: string;
      values: Array<{
        label: string;
        value: string;
        attributeValue?: string;
        colorCode?: string;
        images?: string[];
        isDefault?: boolean;
      }>;
    }>;
    variants?: Array<{
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
    specifications?: Array<{
      key: string;
      value: string;
    }>;
    [key: string]: unknown;
  }

  interface ProductResponse {
    data?: ProductData;
  }

  const product = ((data as ProductResponse)?.data ?? data ?? null) as ProductData | null;
  const brandName = (product?.brand as { name?: string } | null | undefined)?.name;
  console.log(product);

  // Sync cart and wishlist prices when product data changes
  useSyncProductPrices(product?._id, product as unknown as ProductData);

  // Extract category information from product
  // Category can be an object with slug/name or a string
  const getCategorySlug = React.useMemo(() => {
    try {
      if (!product) return { categorySlug: undefined, subCategorySlug: undefined, subSubCategorySlug: undefined };
      
      const extractSlug = (cat: unknown): string | undefined => {
        if (!cat) return undefined;
        if (typeof cat === 'string') return cat;
        if (typeof cat === 'object' && cat !== null) {
          const obj = cat as { slug?: string; name?: string; [key: string]: unknown };
          return obj.slug || obj.name;
        }
        return undefined;
      };

      return {
        categorySlug: extractSlug(product.category),
        subCategorySlug: extractSlug(product.subCategory),
        subSubCategorySlug: extractSlug(product.subSubCategory),
      };
    } catch (error) {
      // If category extraction fails, just return undefined values
      console.warn('Error extracting category information:', error);
      return { categorySlug: undefined, subCategorySlug: undefined, subSubCategorySlug: undefined };
    }
  }, [product]);

  const { categorySlug, subCategorySlug, subSubCategorySlug } = getCategorySlug;

  // Fetch related products by same category hierarchy (exclude current product)
  // Only fetch if we have at least category or subcategory
  const hasCategoryData = !!(categorySlug || subCategorySlug);
  const {
    data: relatedProductsData,
    isLoading: isRelatedLoading,
    isError: isRelatedError,
  } = useGetProductsBySlugsQuery(
    {
      category: categorySlug,
      subcategory: subCategorySlug,
      subsubcategory: subSubCategorySlug,
      page: 1,
      limit: 12,
      sort: "newest",
    },
    { skip: !product || !hasCategoryData }
  );

  // Prepare attributes/options
  const attributes = React.useMemo(() => (product?.attributes ?? []) as Array<{
    name: string;
    type: string;
    values: Array<{
      label: string;
      value: string;
      colorCode?: string;
      images?: string[];
      isDefault?: boolean;
    }>;
  }>, [product?.attributes]);
  const variants = React.useMemo(() => (product?.variants ?? []) as Array<{
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
  }>, [product?.variants]);

  const [selectedByName, setSelectedByName] = React.useState<
    Record<string, string>
  >(() => {
    // Initialize state with initial selections (prefer default flags, else first option)
    const acc: Record<string, string> = {};
    attributes.forEach((attr) => {
      const def = attr.values.find((v) => v.isDefault) || attr.values[0];
      if (def)
        acc[attr.name] = (def as { attributeValue?: string }).attributeValue || def.value || def.label;
    });
    return acc;
  });

  // Update selections when product changes (only when product ID changes)
  React.useEffect(() => {
    if (product?._id) {
      const newSelections: Record<string, string> = {};
      attributes.forEach((attr) => {
        const def = attr.values.find((v) => v.isDefault) || attr.values[0];
        if (def)
          newSelections[attr.name] =
            (def as { attributeValue?: string }).attributeValue || def.value || def.label;
      });
      setSelectedByName(newSelections);
    }
  }, [product?._id, attributes]);
  const [activeImage, setActiveImage] = React.useState<string | undefined>(
    undefined
  );
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const [zoomOrigin, setZoomOrigin] = React.useState<{ x: string; y: string }>({
    x: "50%",
    y: "50%",
  });
  const specRef = React.useRef<HTMLDivElement | null>(null);
  const descRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLDivElement | null>(null);
  const warrantyRef = React.useRef<HTMLDivElement | null>(null);
  const scrollToWithOffset = (el: HTMLElement | null, offset = 100) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Determine selected variant by matching attributeCombination
  const selectedVariant = React.useMemo(() => {
    if (!variants.length) return undefined;
    const match = variants.find((v) =>
      (v.attributeCombination || []).every((c) => {
        const chosen = selectedByName[c.attributeName];
        // attributeValue may store machine value; attributeLabel is human label – check both
        return chosen === c.attributeValue || chosen === c.attributeLabel;
      })
    );
    return match || variants[0];
  }, [variants, selectedByName]);

  // Collect gallery images (prefer selected color's images if present)
  const colorAttr = attributes.find(
    (a) =>
      a.type?.toLowerCase?.() === "color" || a.name.toLowerCase() === "color"
  );
  const selectedColor = colorAttr?.values.find(
    (v) =>
      v.value === selectedByName[colorAttr?.name || ""] ||
      v.label === selectedByName[colorAttr?.name || ""]
  );
  // Flatten ALL variant/color images so we always show the full set
  const allColorImages: string[] = React.useMemo(() => {
    const set = new Set<string>();
    (colorAttr?.values || []).forEach((v) => {
      (v.images || []).forEach((src) => set.add(src));
    });
    return Array.from(set);
  }, [colorAttr]);

  // Map image -> color label/value to optionally sync selection on click
  const imageToColorValue = React.useMemo(() => {
    const map = new Map<string, string>();
    (colorAttr?.values || []).forEach((v) => {
      (v.images || []).forEach((src) => map.set(src, v.value || v.label));
    });
    return map;
  }, [colorAttr]);

  // Product-level images fallback when variant/color images are missing
  const productLevelImages: string[] = React.useMemo(
    () => (Array.isArray(product?.images) ? (product.images as string[]) : []),
    [product?.images]
  );

  // Prefer variant/color images; if none, fall back to product.images
  const galleryImages: string[] = React.useMemo(() => {
    if (allColorImages.length > 0) return allColorImages;
    return productLevelImages;
  }, [allColorImages, productLevelImages]);

  React.useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveIndex(0);
      setActiveImage(galleryImages[0]);
      setZoomOrigin({ x: "50%", y: "50%" });
    } else {
      setActiveIndex(0);
      setActiveImage(undefined);
      setZoomOrigin({ x: "50%", y: "50%" });
    }
  }, [galleryImages]);

  const goToIndex = (nextIndex: number) => {
    if (nextIndex === activeIndex) return;
    setActiveIndex(nextIndex);
    setActiveImage(galleryImages[nextIndex]);
    // If this image belongs to a specific color, sync selection
    const colorName = colorAttr?.name;
    if (colorName) {
      const val = imageToColorValue.get(galleryImages[nextIndex]);
      if (val) setSelectedByName((prev) => ({ ...prev, [colorName]: val }));
    }
  };

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x: `${x.toFixed(2)}%`, y: `${y.toFixed(2)}%` });
  };

  const handleSelect = (attributeName: string, value: string) => {
    setSelectedByName((prev) => ({ ...prev, [attributeName]: value }));
    // If selecting a color, update active image to that color's first image
    if (colorAttr?.name && attributeName === colorAttr.name) {
      const match = (colorAttr.values || []).find(
        (v) => (v.value || v.label) === value
      );
      const firstImg =
        match?.images && match.images.length > 0 ? match.images[0] : undefined;
      if (firstImg) {
        const idx = galleryImages.findIndex((src) => src === firstImg);
        if (idx !== -1) {
          setActiveIndex(idx);
          setActiveImage(firstImg);
          setZoomOrigin({ x: "50%", y: "50%" });
        }
      }
    }
  };

  interface TipTapNode {
    type: string;
    content?: TipTapNode[];
    text?: string;
    marks?: Array<{
      type: string;
      attrs?: Record<string, string>;
    }>;
    attrs?: {
      level?: number;
      [key: string]: unknown;
    };
  }

  // Minimal TipTap JSON -> HTML renderer (headings, paragraphs, lists, blockquote, code, hardBreak, marks)
  const renderTiptapToHTML = useCallback((node: TipTapNode | null | undefined): string => {
    if (!node) return "";
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const renderMarks = (text: string, marks?: TipTapNode['marks']) => {
      if (!marks || !marks.length) return text;
      return marks.reduce((acc, m) => {
        if (m.type === "bold") return `<strong>${acc}</strong>`;
        if (m.type === "italic") return `<em>${acc}</em>`;
        if (m.type === "strike") return `<s>${acc}</s>`;
        if (m.type === "underline") return `<u>${acc}</u>`;
        if (m.type === "code") return `<code>${acc}</code>`;
        if (m.type === "link") {
          const href = esc(m.attrs?.href || "#");
          const rel = esc(m.attrs?.rel || "noopener noreferrer nofollow");
          const target = esc(m.attrs?.target || "_blank");
          return `<a href="${href}" target="${target}" rel="${rel}">${acc}</a>`;
        }
        return acc;
      }, text);
    };

    const renderChildren = (children: TipTapNode[] | undefined) =>
      (children || []).map(renderTiptapToHTML).join("");

    switch (node.type) {
      case "doc":
        return renderChildren(node.content);
      case "paragraph":
        return `<p>${renderChildren(node.content)}</p>`;
      case "text":
        return renderMarks(esc(node.text || ""), node.marks);
      case "heading": {
        const lvl = Math.min(6, Math.max(1, node.attrs?.level || 2));
        return `<h${lvl}>${renderChildren(node.content)}</h${lvl}>`;
      }
      case "bulletList":
        return `<ul>${renderChildren(node.content)}</ul>`;
      case "orderedList":
        return `<ol>${renderChildren(node.content)}</ol>`;
      case "listItem":
        return `<li>${renderChildren(node.content)}</li>`;
      case "blockquote":
        return `<blockquote>${renderChildren(node.content)}</blockquote>`;
      case "codeBlock":
        return `<pre><code>${esc(node.content?.[0]?.text || "")}</code></pre>`;
      case "hardBreak":
        return "<br/>";
      default:
        return renderChildren(node.content);
    }
  }, []);

  // Render TipTap JSON description to HTML
  const descriptionHtml = React.useMemo(() => {
    const desc = product?.description;
    try {
      const json = typeof desc === "string" ? JSON.parse(desc) : desc;
      if (json && typeof json === "object" && json.type) {
        return renderTiptapToHTML(json);
      }
    } catch {
      /* fall through to raw string */
    }
    if (typeof desc === "string") return desc; // assume already HTML
    return "";
  }, [product?.description, renderTiptapToHTML]);

  // Extract video and descriptionImages from product
  const videoUrl = React.useMemo(() => {
    return product?.video || product?.video_url || "";
  }, [product]);

  const descriptionImages = React.useMemo(() => {
    // Support new descriptionImages array and backward compatibility with single descriptionImage
    if (product?.descriptionImages && Array.isArray(product.descriptionImages)) {
      return product.descriptionImages;
    }
    // Fallback to old single image fields
    const singleImage = product?.descriptionImage || product?.description_image;
    return singleImage ? [singleImage] : [];
  }, [product]);

  const videoId = React.useMemo(() => {
    return videoUrl ? getYouTubeVideoId(videoUrl) : null;
  }, [videoUrl]);

  // Presence flags
  const hasSpecs = React.useMemo(
    () => Array.isArray(product?.specifications) && (product?.specifications?.length || 0) > 0,
    [product?.specifications]
  );
  const hasDescription = React.useMemo(() => {
    if (!descriptionHtml) return false;
    const textOnly = descriptionHtml.replace(/<[^>]*>/g, "").trim();
    return textOnly.length > 0;
  }, [descriptionHtml]);
  const hasVideo = React.useMemo(() => !!videoId, [videoId]);
  const hasDescriptionImages = React.useMemo(() => descriptionImages.length > 0, [descriptionImages]);

  // Loading state
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // Error state
  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <p className="text-gray-600">
            {isError ? "Failed to load product. Please try again." : "The product you're looking for doesn't exist."}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3fffe] via-white to-white">
      <main className="mx-auto flex w-[90%] mx-auto flex-col gap-12 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <header className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)] sm:p-7">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE]">Product</p>
              <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">{product?.name}</h1>
              <p className="text-sm text-slate-500">
                Discover premium specs, live pricing, and flexible delivery options tailored for you.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE]">
              {brandName && (
                <Link 
                  href={`/brands/${brandName}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#02C1BE]/30 bg-[#02C1BE]/10 px-4 py-2 text-xs font-semibold text-[#02C1BE] transition hover:bg-[#01b1ae]/10"
                >
                  Brand: {brandName}
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Left: Gallery with vertical thumbnails on desktop */}
        <div className="flex flex-col gap-5 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-[0_25px_80px_-60px_rgba(5,150,145,0.4)]">
          {/* Local styles for slide animations */}
          <style jsx>{`
            @keyframes slideInRight {
              from {
                opacity: 0;
                transform: translateX(16px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            .slide-right-in {
              animation: slideInRight 650ms ease both;
            }
          `}</style>
          <div
            className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 sm:aspect-[4/5] lg:aspect-[5/6]"
            onMouseMove={handleZoomMove}
          >
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${activeIndex}-${activeImage}`}
                src={activeImage}
                alt={product.name}
                className={`max-h-full max-w-full object-contain slide-right-in transition-transform duration-300 ease-out hover:scale-[1.5]`}
                style={{ transformOrigin: `${zoomOrigin.x} ${zoomOrigin.y}` }}
              />
            ) : (
              <div className="text-gray-400">No image</div>
            )}
          </div>

          {/* Thumbnails below the main image (all screens) */}
          {galleryImages.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {galleryImages.map((src, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx}
                  src={src}
                  alt={`thumb-${idx}`}
                  className={`h-16 w-16 flex-shrink-0 cursor-pointer rounded-xl border bg-white object-cover transition ${
                    activeIndex === idx
                      ? "border-[#02C1BE] shadow-[0_10px_25px_-15px_rgba(5,150,145,0.6)]"
                      : "hover:border-[#02C1BE]/40 hover:shadow-md"
                  }`}
                  onClick={() => goToIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & selectors */}
        <div className="flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)] sm:p-7">
          {product?.isFreeDelivery === true && (
            <span className="inline-flex w-max items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Free Delivery
            </span>
          )}

          {(() => {
            const formatPrice = (v: number | string | undefined) => `৳${Number(v).toLocaleString()}`;
            const hasVariants = Array.isArray(variants) && variants.length > 0;
            const sv = selectedVariant;
            const variantFinal = hasVariants ? sv?.finalPrice : undefined;
            const variantDiscPrice = hasVariants ? (sv as { discountedPrice?: number }).discountedPrice : undefined;
            const variantDiscPct = hasVariants ? (sv as { discountPercentage?: number }).discountPercentage : undefined;

            const productFinal = !hasVariants ? product?.price : undefined;
            const productDiscPrice = !hasVariants ? product?.discountedPrice : undefined;
            const productDiscPct = !hasVariants ? product?.discountPercentage : undefined;

            const basePrice = hasVariants ? variantFinal : productFinal;
            const discounted = hasVariants ? variantDiscPrice : productDiscPrice;
            const pct = hasVariants ? variantDiscPct : productDiscPct;
            const stockCount = hasVariants ? parseInt(String(sv?.stock ?? 0)) : parseInt(String(product?.stock ?? 0));
            const inStock = Number.isFinite(stockCount) ? stockCount > 0 : false;

            if (basePrice === undefined && discounted === undefined) return null;

            const isNumeric = (val: unknown) => typeof val === 'number' || (!!val && /^\d+(?:\.\d+)?$/.test(String(val)));
            const isTBA = basePrice && !isNumeric(basePrice) && String(basePrice).toUpperCase().trim() === 'TBA';
            const showDiscount = isNumeric(discounted) && isNumeric(basePrice) && Number(discounted) < Number(basePrice);
            const pctText = (() => {
              if (pct !== undefined && pct !== null && typeof pct === 'number') return `${parseFloat(String(pct)).toFixed(0)}% OFF`;
              if (showDiscount) {
                const p = Number(basePrice);
                const d = Number(discounted);
                if (p > 0) return `${Math.round((1 - d / p) * 100)}% OFF`;
              }
              return null;
            })();
            const savedAmount = showDiscount && isNumeric(basePrice) && isNumeric(discounted)
              ? Math.max(0, Number(basePrice) - Number(discounted))
              : undefined;

            return (
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {!inStock ? (
                  <div className="text-2xl font-bold tracking-tight text-rose-600">
                    {(!isNumeric(basePrice) && basePrice) ? basePrice : "Not available"}
                  </div>
                ) : showDiscount ? (
                  <>
                    <div className="text-2xl font-bold tracking-tight text-rose-600">
                      {formatPrice(discounted)}
                    </div>
                    <div className="text-lg text-gray-500 line-through">
                      {formatPrice(basePrice)}
                    </div>
                    {pctText && (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                        {pctText}
                      </span>
                    )}
                  {savedAmount !== undefined && (
                    <span className="text-sm font-semibold text-emerald-600">
                      You save {formatPrice(savedAmount)}
                    </span>
                  )}
                  </>
                ) : (
                  <div className="text-2xl font-bold tracking-tight text-gray-900">
                    {isNumeric(basePrice) ? formatPrice(basePrice) : basePrice}
                  </div>
                )}

                {!isTBA && (
                  <>
                    <div className="text-lg">
                      <span className="font-semibold">Availability:</span>
                      <span className="ml-1">
                        {inStock ? "In Stock" : "Out of stock"}
                      </span>
                    </div>
                    <span className="h-4 w-px bg-gray-200" />
                  </>
                )}
                {sv?.sku && (
                  <div className="text-lg">
                    <span className="font-semibold">Code:</span>
                    <span className="ml-1">{sv.sku}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Attribute selectors */}
              <div className="grid gap-4 sm:grid-cols-2">
            {attributes.map((attr) => {
              const isColor =
                attr.type?.toLowerCase?.() === "color" ||
                attr.name.toLowerCase() === "color";
              return (
                <div
                  className="border border-gray-200 rounded-xl p-4"
                  key={attr.name}
                >
                  <div className="mb-2 font-medium text-gray-800">
                    {attr.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((v) => {
                      const valueKey = v.value || v.label;
                      const isActive =
                        selectedByName[attr.name] === valueKey ||
                        selectedByName[attr.name] === v.label;

                      if (isColor) {
                        const activeBorder = v.colorCode || "#f97316"; // default to orange tone
                        return (
                          <button
                            key={valueKey}
                            type="button"
                            onClick={() => handleSelect(attr.name, valueKey)}
                            className={`h-10 pl-2 pr-4 rounded-full border-2 text-sm flex items-center gap-2 bg-white transition-colors ${
                              isActive
                                ? "text-gray-700 shadow-sm"
                                : "hover:border-gray-400"
                            }`}
                            style={{
                              borderColor: isActive ? activeBorder : "#e5e7eb", // gray-200
                            }}
                            aria-pressed={isActive}
                          >
                            <span
                              className="h-4 w-4 rounded-full border"
                              style={{
                                backgroundColor: v.colorCode || "#e5e7eb",
                                borderColor: v.colorCode
                                  ? "transparent"
                                  : "#d1d5db",
                              }}
                            />
                            <span className="font-medium">{v.label}</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={valueKey}
                          type="button"
                          onClick={() => handleSelect(attr.name, valueKey)}
                          className={`h-9 px-3 rounded-md border text-sm transition-colors ${
                            isActive
                              ? "border-teal-600 text-teal-700 bg-teal-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          aria-pressed={isActive}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantity + actions */}
          {/** Cart state for this page */}
          {(() => {
            // Inline IIFE to keep local state near the buttons
              const QuantityControls: React.FC = () => {
              const [qty, setQty] = React.useState<number>(1);
              const { addItem, has } = useLocalCart();
              const { toggle, has: hasWish } = useLocalWishlist();
                const { requireAuth: ensureAuth } = useAuthGate();

              const primaryImage =
                (selectedColor?.images && selectedColor.images[0]) ||
                (product?.images?.[0] as string | undefined);

              // Calculate correct price with discount
              const calculatePrice = React.useMemo(() => {
                const hasVariants = Array.isArray(variants) && variants.length > 0;
                const sv = selectedVariant;
                
                if (hasVariants && sv) {
                  const variantFinal = sv?.finalPrice;
                  const variantDiscPrice = (sv as { discountedPrice?: number }).discountedPrice;
                  const isNumeric = (val: unknown) => typeof val === 'number' || (!!val && /^\d+(?:\.\d+)?$/.test(String(val)));
                  const isTBA = variantFinal && !isNumeric(variantFinal) && String(variantFinal).toUpperCase().trim() === 'TBA';
                  
                  if (isTBA) return { price: 'TBA', basePrice: undefined, discountedPrice: undefined, isTBA: true };
                  
                  const basePrice = typeof variantFinal === 'number' ? variantFinal : (isNumeric(variantFinal) ? parseFloat(String(variantFinal)) : undefined);
                  const discounted = typeof variantDiscPrice === 'number' ? variantDiscPrice : (isNumeric(variantDiscPrice) ? parseFloat(String(variantDiscPrice)) : undefined);
                  
                  const finalPrice = (discounted && basePrice && discounted < basePrice) ? discounted : basePrice;
                  return { 
                    price: finalPrice, 
                    basePrice: basePrice, 
                    discountedPrice: (discounted && basePrice && discounted < basePrice) ? discounted : undefined,
                    isTBA: false 
                  };
                } else {
                  const productFinal = product?.price;
                  const productDiscPrice = product?.discountedPrice;
                  const isNumeric = (val: unknown) => typeof val === 'number' || (!!val && /^\d+(?:\.\d+)?$/.test(String(val)));
                  const isTBA = productFinal && !isNumeric(productFinal) && String(productFinal).toUpperCase().trim() === 'TBA';
                  
                  if (isTBA) return { price: 'TBA', basePrice: undefined, discountedPrice: undefined, isTBA: true };
                  
                  const basePrice = typeof productFinal === 'number' ? productFinal : (isNumeric(productFinal) ? parseFloat(String(productFinal)) : undefined);
                  const discounted = typeof productDiscPrice === 'number' ? productDiscPrice : (isNumeric(productDiscPrice) ? parseFloat(String(productDiscPrice)) : undefined);
                  
                  const finalPrice = (discounted && basePrice && discounted < basePrice) ? discounted : basePrice;
                  return { 
                    price: finalPrice, 
                    basePrice: basePrice, 
                    discountedPrice: (discounted && basePrice && discounted < basePrice) ? discounted : undefined,
                    isTBA: false 
                  };
                }
              // eslint-disable-next-line react-hooks/exhaustive-deps
              }, [selectedByName, variants, product]);

              // Variant-wise stock handling
              const stockInfo = React.useMemo(() => {
                const hasVariants = Array.isArray(variants) && variants.length > 0;
                const sv = selectedVariant;
                const stockCount = hasVariants
                  ? Number(sv?.stock ?? 0)
                  : Number((product as unknown as { stock?: number })?.stock ?? 0);
                return {
                  hasVariants,
                  stockCount: Number.isFinite(stockCount) ? Math.max(0, stockCount) : 0,
                };
              // eslint-disable-next-line react-hooks/exhaustive-deps
              }, [selectedByName, variants, product]);

              const inStock = stockInfo.stockCount > 0;
              const maxQty = stockInfo.stockCount || 0;

              // Ensure qty respects current stock when variant/product changes
              React.useEffect(() => {
                setQty((prev) => {
                  if (!inStock) return 1; // keep UI simple when OOS
                  return Math.min(Math.max(1, prev), maxQty);
                });
              }, [inStock, maxQty]);

              const matcher = {
                productId: product?._id as string,
                slug: product?.slug as string,
                name: product?.name as string,
                image: primaryImage,
                price: typeof calculatePrice.price === 'number' ? calculatePrice.price : 0,
                basePrice: calculatePrice.basePrice,
                discountedPrice: calculatePrice.discountedPrice,
                sku: selectedVariant?.sku as string | undefined,
                selectedOptions: selectedByName,
                isFreeDelivery: product?.isFreeDelivery,
              };

              const hasVariants = Array.isArray(variants) && variants.length > 0;
              const inCart = product && (hasVariants ? selectedVariant : true) ? has(matcher) : false;
              const inWishlist = product ? hasWish(matcher) : false;

              const canAddToCart = !calculatePrice.isTBA && typeof calculatePrice.price === 'number' && inStock;

              const onAddToCart = () => {
                if (!product || !canAddToCart) return;
                // Only require selectedVariant if product has variants
                if (hasVariants && !selectedVariant) return;
                if (!ensureAuth()) return;
                addItem({
                  ...matcher,
                  quantity: Math.min(qty, maxQty),
                });
              };

              const onToggleWishlist = () => {
                if (!product) return;
                toggle({
                  productId: product._id as string,
                  slug: product.slug,
                  name: product.name as string,
                  image: primaryImage,
                  price: typeof calculatePrice.price === 'number' ? calculatePrice.price : undefined,
                  basePrice: calculatePrice.basePrice,
                  discountedPrice: calculatePrice.discountedPrice,
                  sku: selectedVariant?.sku,
                  selectedOptions: selectedByName,
                });
              };

              return (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-inner">
                    <button
                      className="px-4 py-2 text-lg text-slate-500 transition hover:text-slate-900"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={!inStock || qty <= 1}
                    >
                      -
                    </button>
                    <div className="px-4 text-sm font-semibold text-slate-800" aria-live="polite">{Math.min(qty, maxQty || 1)}</div>
                    <button
                      className="px-4 py-2 text-lg text-slate-500 transition hover:text-slate-900"
                      onClick={() => {
                        if (!inStock) {
                          toast.warning("Out of stock");
                          return;
                        }
                        setQty((q) => {
                          const next = q + 1;
                          if (maxQty && next > maxQty) {
                            toast.warning(
                              `Only ${maxQty} ${maxQty > 1 ? "items" : "item"} available`
                            );
                            return maxQty;
                          }
                          return next;
                        });
                      }}
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    className={`flex-1 sm:flex-none rounded-full border border-[#02C1BE]/30 px-5 py-3 text-sm font-semibold transition ${
                      inCart || !canAddToCart 
                        ? "cursor-not-allowed bg-slate-100 text-slate-400" 
                        : "bg-[#02C1BE] text-white shadow-[0_20px_40px_-30px_rgba(5,150,145,0.6)] hover:bg-[#01b1ae]"
                    }`}
                    onClick={!inCart && canAddToCart ? onAddToCart : undefined}
                    disabled={inCart || !canAddToCart}
                    title={
                      !inStock
                        ? "Out of stock - Cannot add to cart"
                        : !canAddToCart
                        ? "Price is TBA - Cannot add to cart"
                        : undefined
                    }
                  >
                    {inCart ? "Added" : !inStock ? "Unavailable" : !canAddToCart ? "Price TBA" : "Add To Cart"}
                  </button>
                  <button
                    className={`flex-1 sm:flex-none rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold transition ${inWishlist ? "cursor-not-allowed bg-slate-100 text-slate-400" : "hover:border-[#02C1BE]/40 hover:text-[#02C1BE]"}`}
                    onClick={!inWishlist ? onToggleWishlist : undefined}
                    disabled={inWishlist}
                  >
                    {inWishlist ? "In Wishlist" : "Add To Wishlist"}
                  </button>
                </div>
              );
            };

            return <QuantityControls />;
          })()}

          {/* Small details */}
          {product?.isWarrantyAvailable === true && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600">
              Enjoy 6 month warranty support plus expert assistance from our customer care team.
            </div>
          )}
        </div>
      </div>
      {/* Product details sections */}
      <div className="space-y-10">
        <div className="flex flex-wrap gap-3">
          {hasSpecs && (
            <button
              type="button"
              className="rounded-full border border-[#02C1BE]/20 bg-white px-4 py-2 text-sm font-semibold text-[#02C1BE] transition hover:bg-[#01b1ae]/10"
              onClick={() => scrollToWithOffset(specRef.current)}
            >
              Specification
            </button>
          )}
          {(hasDescription || hasDescriptionImages || hasVideo) && (
            <button
              type="button"
              className="rounded-full border border-[#02C1BE]/20 bg-white px-4 py-2 text-sm font-semibold text-[#02C1BE] transition hover:bg-[#01b1ae]/10"
              onClick={() => scrollToWithOffset(descRef.current)}
            >
              Description
            </button>
          )}
          {hasVideo && (
            <button
              type="button"
              className="rounded-full border border-[#02C1BE]/20 bg-white px-4 py-2 text-sm font-semibold text-[#02C1BE] transition hover:bg-[#01b1ae]/10"
              onClick={() => scrollToWithOffset(videoRef.current)}
            >
              Video
            </button>
          )}
          {product?.isWarrantyAvailable === true && (
            <button
              type="button"
              className="rounded-full border border-[#02C1BE]/20 bg-white px-4 py-2 text-sm font-semibold text-[#02C1BE] transition hover:bg-[#01b1ae]/10"
              onClick={() => scrollToWithOffset(warrantyRef.current)}
            >
              Warranty
            </button>
          )}
        </div>
        {/* Specification */}
        {hasSpecs && (
          <div className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_20px_80px_-70px_rgba(5,150,145,0.45)] sm:p-6" ref={specRef} id="specification">
            <h2 className="text-2xl font-semibold text-slate-900">Specification</h2>
            <table className="mt-4 w-full overflow-hidden rounded-2xl border border-slate-100 text-sm">
                <tbody>
                  {(product?.specifications || []).map(
                    (row: { key?: string; value?: string }, idx: number) => (
                      <tr key={idx} className="odd:bg-white even:bg-slate-50">
                        <td className="w-1/3 border-b border-slate-100 p-3 font-medium text-slate-600">
                          {row.key}
                        </td>
                        <td className="border-b border-slate-100 p-3 text-slate-800">
                          {row.value}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
        )}

        {/* Description */}
        {(hasDescription || hasDescriptionImages || hasVideo) && (
          <div className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_20px_80px_-70px_rgba(5,150,145,0.45)] sm:p-6" ref={descRef} id="description">
            <h2 className="text-2xl font-semibold text-slate-900">Description</h2>
            <div className="space-y-6">
              {/* Description Images */}
              {hasDescriptionImages && (
                <div className="w-full space-y-4">
                  {descriptionImages.map((imgUrl, index) => (
                    <div key={index} className="w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Product description ${index + 1}`}
                        className="h-auto w-full mt-5 rounded-2xl object-cover shadow"
                      />
                    </div>
                  ))}
                </div>
              )}

              

              {/* Description Text */}
              {hasDescription && (
                <div className="prose max-w-none">
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                    .desc-content ul { list-style-type: disc; padding-left: 1.5rem; margin: .5rem 0; }
                    .desc-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: .5rem 0; }
                    .desc-content li { margin: .25rem 0; }
                    .desc-content h1 { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 .5rem; }
                    .desc-content h2 { font-size: 1.5rem; font-weight: 600; margin: .875rem 0 .5rem; }
                    .desc-content h3 { font-size: 1.25rem; font-weight: 600; margin: .75rem 0 .5rem; }
                    .desc-content blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; margin: 1rem 0; font-style: italic; }
                    .desc-content code { background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; }
                  `,
                    }}
                  />
                  <div
                    className="desc-content"
                    dangerouslySetInnerHTML={{
                      __html:
                        descriptionHtml ||
                        '<p class="text-gray-500">No description available.</p>',
                    }}
                  />
                </div>
              )}

              {/* Video */}
              {hasVideo && (
                <div className="w-xl" ref={videoRef} id="video">
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title="Product video"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warranty */}
        {product?.isWarrantyAvailable === true && (
          <div
            ref={warrantyRef}
            id="warranty"
            className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_20px_80px_-70px_rgba(5,150,145,0.45)] sm:p-6"
          >
            <h2 className="text-2xl font-semibold text-slate-900">Warranty</h2>
            <p className="mt-3 text-sm text-slate-600">
              6 month warranty support. Terms may vary by brand and region—our support team is ready to assist with any claims.
            </p>
          </div>
        )}
      </div>
      {/* Related Products by category */}
      {hasCategoryData && !isRelatedError && (
        <div className="mt-10 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_20px_80px_-70px_rgba(5,150,145,0.45)] sm:p-6">
          <h2 className="text-2xl font-semibold text-slate-900">Related Products</h2>
          {isRelatedLoading ? (
            <div className="mt-4 text-sm text-slate-500">Loading related products…</div>
          ) : (() => {
            type Item = {
              _id?: string;
              name?: string;
              slug?: string;
              status?: string;
              images?: string[];
              variants?: Array<{ finalPrice?: number; discountedPrice?: number }>;
              price?: number;
              discountedPrice?: number;
              attributes?: Array<{
                type?: string;
                name?: string;
                values?: Array<{ images?: string[] }>;
              }>;
            };
            interface RelatedProductsResponse {
              items?: Item[];
              [key: string]: unknown;
            }
            const response = (relatedProductsData as RelatedProductsResponse | Item[] | null | undefined) || {};
            const items: Item[] = Array.isArray(response)
              ? response
              : (response.items as Item[]) || [];
            const filtered = (items || [])
              .filter((p) => p && p.status === "active")
              .filter((p) => p._id !== product?._id)
              .slice(0, 10);
            if (!filtered.length) {
              return (
                <div className="mt-3 text-sm text-slate-500">
                  No related products found.
                </div>
              );
            }
            const getPrimaryImage = (p: Item): string => {
              const colorAttr = (p.attributes || []).find(
                (a) =>
                  a?.type?.toLowerCase?.() === "color" ||
                  a?.name?.toLowerCase?.() === "color"
              );
              return (
                (colorAttr?.values?.[0]?.images?.[0] as string | undefined) ||
                (p.images?.[0] as string | undefined) ||
                "/next.svg"
              );
            };
            const getFinalPrice = (p: Item): { final?: number; base?: number } => {
              const v = (p.variants || [])[0];
              const base = (v?.finalPrice || p.price) as number | undefined;
              const disc = (v?.discountedPrice || p.discountedPrice) as
                | number
                | undefined;
              const final =
                base && disc && disc < base ? disc : base ? base : undefined;
              return { final, base };
            };
            return (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filtered.map((rp) => {
                  const img = getPrimaryImage(rp);
                  const { final, base } = getFinalPrice(rp);
                  const showStrike = !!(base && final && base > final);
                  return (
                    <Link
                      key={rp._id}
                      href={`/product/${rp.slug}`}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_25px_70px_-60px_rgba(5,150,145,0.45)] transition hover:shadow-[0_25px_70px_-45px_rgba(5,150,145,0.55)]"
                    >
                      <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={rp.name || "Product"}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="line-clamp-2 min-h-[44px] text-sm font-medium text-gray-900">
                        {rp.name}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {typeof final === "number" && (
                          <span className="text-base font-bold text-emerald-600">
                            ৳ {final.toLocaleString()}
                          </span>
                        )}
                        {showStrike && typeof base === "number" && (
                          <span className="text-xs text-gray-400 line-through">
                            ৳ {base.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
      </main>
    </div>
  );
}

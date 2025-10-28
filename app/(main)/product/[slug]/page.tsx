"use client";
import React from "react";
import { useGetProductBySlugQuery } from "@/app/redux/features/product/product.api";

export default function ProductDetailBySlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = React.use(params);
  const { data, isLoading, isError } = useGetProductBySlugQuery(
    resolvedParams.slug
  );
  const product = (data as any)?.data ?? null;

  // Prepare attributes/options
  const attributes = (product?.attributes ?? []) as Array<{
    name: string;
    type: string;
    values: Array<{
      label: string;
      value: string;
      colorCode?: string;
      images?: string[];
      isDefault?: boolean;
    }>;
  }>;
  const variants = (product?.variants ?? []) as Array<{
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

  // Build initial selections (prefer default flags, else first option)
  const initialSelections = React.useMemo(() => {
    const acc: Record<string, string> = {};
    attributes.forEach((attr) => {
      const def = attr.values.find((v) => v.isDefault) || attr.values[0];
      if (def)
        acc[attr.name] = (def as any).attributeValue || def.value || def.label;
    });
    return acc;
  }, [attributes]);

  const [selectedByName, setSelectedByName] = React.useState<
    Record<string, string>
  >(() => {
    // Initialize state with initial selections directly
    const acc: Record<string, string> = {};
    attributes.forEach((attr) => {
      const def = attr.values.find((v) => v.isDefault) || attr.values[0];
      if (def)
        acc[attr.name] = (def as any).attributeValue || def.value || def.label;
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
          newSelections[attr.name] = (def as any).attributeValue || def.value || def.label;
      });
      setSelectedByName(newSelections);
    }
  }, [product?._id]);
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

  // Always show all images across variants
  const galleryImages: string[] = React.useMemo(
    () => allColorImages,
    [allColorImages]
  );

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

  

  // Minimal TipTap JSON -> HTML renderer (headings, paragraphs, lists, blockquote, code, hardBreak, marks)
  const renderTiptapToHTML = (node: any): string => {
    if (!node) return "";
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const renderMarks = (text: string, marks?: any[]) => {
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

    const renderChildren = (children: any[]) => (children || []).map(renderTiptapToHTML).join("");

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
  };

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
  }, [product?.description]);

  return (
    <div className="w-full px-16 mx-auto py-20 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Gallery with vertical thumbnails on desktop */}
        <div className="grid grid-cols-1 gap-4">
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
            className="w-full h-[420px] md:h-[480px] border rounded-lg flex items-center justify-center overflow-hidden bg-white relative group"
            onMouseMove={handleZoomMove}
          >
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${activeIndex}-${activeImage}`}
                src={activeImage}
                alt={product.name}
                className={`max-h-full max-w-full object-contain slide-right-in transition-transform duration-300 ease-out group-hover:scale-[1.6]`}
                style={{ transformOrigin: `${zoomOrigin.x} ${zoomOrigin.y}` }}
              />
            ) : (
              <div className="text-gray-400">No image</div>
            )}
          </div>

          {/* Thumbnails below the main image (all screens) */}
          {galleryImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-1">
              {galleryImages.map((src, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx}
                  src={src}
                  alt={`thumb-${idx}`}
                  className={`h-16 w-16 object-cover rounded-md border bg-white cursor-pointer ${
                    activeIndex === idx
                      ? "ring-2 ring-teal-500"
                      : "hover:shadow"
                  }`}
                  onClick={() => goToIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & selectors */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            {product?.brand?.name && (
              <span className="py-1 rounded-full text-sm bg-white text-gray-700">
                Brand: {product.brand.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl lg:text-3xl font-semibold mb-3 leading-tight">
            {product?.name}
          </h1>

          {selectedVariant && (
            <div className="mb-6 flex items-center gap-4">
              <div className="text-2xl font-bold tracking-tight text-gray-900">
                ৳{selectedVariant.finalPrice}
              </div>
              <div className="text-lg">
                <span className="font-semibold">Availability:</span>
                <span className="ml-1">
                  {product.status === "active" ? "In Stock" : "Unavailable"}
                </span>
              </div>
              <span className="h-4 w-px bg-gray-200" />
              {selectedVariant?.sku && (
                <div className="text-lg">
                  <span className="font-semibold">Code:</span>
                  <span className="ml-1">{selectedVariant.sku}</span>
                </div>
              )}
            </div>
          )}

          {/* Attribute selectors */}
          <div className="grid grid-cols-2 gap-4">
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
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="inline-flex items-center border rounded-md overflow-hidden">
              <button className="px-3 py-2 hover:bg-gray-50">-</button>
              <div className="px-4">1</div>
              <button className="px-3 py-2 hover:bg-gray-50">+</button>
            </div>
            <button className="flex-1 sm:flex-none px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-md shadow-sm transition-colors">
              Shop Now
            </button>
            <button className="flex-1 sm:flex-none px-5 py-3 border rounded-md hover:bg-gray-50 transition-colors">
              Add To Cart
            </button>
          </div>

          {/* Small details */}
          <div className="mt-6 text-sm text-gray-600">
            <div>1 Year Official Warranty Support</div>
          </div>
        </div>
      </div>
      {/* Product details sections */}
      <div className="mt-20 space-y-10">
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
            onClick={() => scrollToWithOffset(specRef.current)}
          >
            Specification
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
            onClick={() => scrollToWithOffset(descRef.current)}
          >
            Description
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
            onClick={() => scrollToWithOffset(warrantyRef.current)}
          >
            Warranty
          </button>
        </div>
        {/* Specification */}
        <div className="w-[50%]" ref={specRef} id="specification">
          <h2 className="text-2xl font-semibold mb-4">Specification</h2>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {(product?.specifications || []).map((row: any, idx: number) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-50">
                    <td className="w-1/3 p-4 font-medium text-gray-700 border-b border-gray-100">
                      {row.key}
                    </td>
                    <td className="p-4 text-gray-800 border-b border-gray-100">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Description */}
        <div ref={descRef} id="description">
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <div className="prose max-w-none">
            <style dangerouslySetInnerHTML={{
              __html: `
                .desc-content ul { list-style-type: disc; padding-left: 1.5rem; margin: .5rem 0; }
                .desc-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: .5rem 0; }
                .desc-content li { margin: .25rem 0; }
                .desc-content h1 { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 .5rem; }
                .desc-content h2 { font-size: 1.5rem; font-weight: 600; margin: .875rem 0 .5rem; }
                .desc-content h3 { font-size: 1.25rem; font-weight: 600; margin: .75rem 0 .5rem; }
                .desc-content blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; margin: 1rem 0; font-style: italic; }
                .desc-content code { background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; }
              `
            }} />
            <div className="desc-content" dangerouslySetInnerHTML={{ __html: descriptionHtml || "<p class=\"text-gray-500\">No description available.</p>" }} />
          </div>
        </div>

        {/* Warranty */}
        <div ref={warrantyRef} id="warranty">
          <h2 className="text-2xl font-semibold mb-4">Warranty</h2>
          <div className="text-gray-700 bg-white border rounded-xl p-4">
            1 Year Official Warranty Support. Terms may vary by brand and
            region.
          </div>
        </div>
      </div>
    </div>
  );
}

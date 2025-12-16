import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize an image URL from API data. If it's relative, prefix with a public base.
 * Falls back to a placeholder when missing.
 */
export function resolveImageUrl(src?: string) {
  if (!src) return "/next.svg";
  if (/^https?:\/\//i.test(src)) return src;
  const base =
    process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "";
  if (!base) return src;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedSrc = src.startsWith("/") ? src.slice(1) : src;
  return `${normalizedBase}/${normalizedSrc}`;
}

export type ProductLike = {
  attributes?: Array<{
    values?: Array<{
      images?: string[];
    }>;
  }>;
  images?: string[];
  image?: string;
  thumbnail?: string;
  coverImage?: string;
  descriptionImage?: string;
  description_image?: string;
  descriptionImages?: string[];
  [key: string]: unknown;
};

/**
 * Pick the best-guess primary image from a product-like payload.
 * Looks at attribute images (color), product images, common fallbacks.
 */
export function pickProductImage(product: ProductLike | null | undefined): string | undefined {
  if (!product) return undefined;

  // Attribute images (e.g., color)
  const attrs = Array.isArray(product?.attributes)
    ? product.attributes
    : [];
  for (const a of attrs) {
    const vals = Array.isArray(a?.values) ? a.values : [];
    for (const v of vals) {
      if (Array.isArray(v?.images) && v.images[0]) {
        return v.images[0];
      }
    }
  }

  // Product images array
  if (Array.isArray(product?.images) && product.images[0]) {
    return product.images[0];
  }

  // Other common fields
  return (
    product?.image ||
    product?.thumbnail ||
    product?.coverImage ||
    product?.descriptionImage ||
    product?.description_image ||
    (Array.isArray(product?.descriptionImages) && product.descriptionImages[0]
      ? product.descriptionImages[0]
      : undefined)
  );
}

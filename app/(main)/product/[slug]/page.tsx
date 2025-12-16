import ProductDetailClient from "./ProductDetailClient";

// Render this page with full SSR on every request (no static cache/ISR)
export const dynamic = "force-dynamic";

export type Product = {
  id?: string;
  name?: string;
  description?: string | null;
  short_description?: string | null;
  images?: string[];
  image?: string;
  thumbnail?: string;
  coverImage?: string;
  descriptionImage?: string;
  description_image?: string;
  descriptionImages?: string[];
  [key: string]: unknown;
};

type FetchProductResult = {
  product: Product | null;
  notFound: boolean;
};

async function fetchProduct(slug: string): Promise<FetchProductResult> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.warn("NEXT_PUBLIC_BASE_URL not set; skipping server fetch for product page.");
    return { product: null, notFound: false };
  }

  try {
    const res = await fetch(
      `${baseUrl}/products/by-slug?slug=${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      }
    );

    // If backend says 404, don't surface a Next.js 404 yet—let the client query try once.
    if (res.status === 404) {
      return { product: null, notFound: false };
    }

    if (!res.ok) {
      return { product: null, notFound: false };
    }

    const json = (await res.json()) as { data?: Product | null } | Product | null;
    const product =
      json && typeof json === "object" && "data" in json
        ? (json as { data?: Product | null }).data ?? null
        : (json as Product | null);
    return { product, notFound: false };
  } catch (error) {
    console.error("Failed to fetch product for SSR", error);
    return { product: null, notFound: false };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { product } = await fetchProduct(slug);
  return {
    title: product?.name ? `${product.name} | Raizmart` : "Product | Raizmart",
    description: product?.description || product?.short_description || undefined,
    openGraph: {
      images: product?.images?.length ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { product } = await fetchProduct(slug);

  return <ProductDetailClient slug={slug} initialProduct={product} />;
}

// SKU generator - stable, human-readable, variant-aware
// Example output: RM-IPH14-128GB-BLK-7X9D

type Segment = string | number | null | undefined

// Keep only A-Z0-9, uppercased
export function sanitizeSegment(segment: Segment): string {
  if (segment === null || segment === undefined) return ""
  const s = String(segment)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toUpperCase()
  return s
}

// Make a short code from words: "iPhone 14 Pro" -> "IPH14PRO"
function toAcronym(name: Segment, maxLen = 8): string {
  const clean = sanitizeSegment(name)
  if (!clean) return ""
  // Try to keep letters and digits grouped while limiting length
  return clean.slice(0, maxLen)
}

// Base36 non-crypto hash for stable short suffix
function hashBase36(input: string, size = 4): string {
  let h1 = 0x811c9dc5 | 0
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i)
    h1 = Math.imul(h1, 0x01000193) | 0
  }
  const n = Math.abs(h1)
  const b36 = n.toString(36).toUpperCase()
  return b36.padStart(size, "0").slice(0, size)
}

export interface GenerateSkuOptions {
  brand?: Segment // e.g., "RM"
  productName: Segment // e.g., "iPhone 14"
  attributes?: Record<string, Segment> // e.g., { storage: "128GB", color: "Black" }
  category?: Segment // optional category code
  region?: Segment // optional region/market
}

// Deterministic SKU: BRAND-PRODUCT-ATTRS(-REGION|-CAT)-HASH
export function generateSku(options: GenerateSkuOptions): string {
  const { brand, productName, attributes, category, region } = options

  const brandCode = sanitizeSegment(brand)
  const productCode = toAcronym(productName, 10)

  // Build attribute code in a consistent key order
  let attrCode = ""
  if (attributes && Object.keys(attributes).length) {
    const parts: string[] = []
    for (const key of Object.keys(attributes).sort()) {
      const val = sanitizeSegment(attributes[key])
      if (val) parts.push(val)
    }
    attrCode = parts.join("") // e.g., 128GBBLK
  }

  const regionOrCat = sanitizeSegment(region) || sanitizeSegment(category)

  const bodySegments = [brandCode, productCode, attrCode, regionOrCat]
    .filter(Boolean)

  const body = bodySegments.join("-") || "SKU"

  // Stable short hash from the meaningful parts
  const hashInput = `${brandCode}|${productCode}|${attrCode}|${regionOrCat}`
  const suffix = hashBase36(hashInput, 4)

  return `${body}-${suffix}`
}

// Convenience: simplest form using only product name (still stable)
export function generateSimpleSku(productName: Segment): string {
  return generateSku({ productName })
}



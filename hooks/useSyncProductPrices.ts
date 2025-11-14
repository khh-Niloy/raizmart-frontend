"use client";

import { useEffect } from "react";
import { useLocalCart } from "./useLocalCart";
import { useLocalWishlist } from "./useLocalWishlist";

interface PriceData {
  price: number;
  basePrice: number;
  discountedPrice?: number;
}

/**
 * Helper to calculate price with discount
 */
function calculatePriceData(basePrice: unknown, discountedPrice: unknown): PriceData | null {
  const isNumeric = (val: unknown): boolean => typeof val === 'number' || (!!val && /^\d+(?:\.\d+)?$/.test(String(val)));
  const isTBA = basePrice && !isNumeric(basePrice) && String(basePrice).toUpperCase().trim() === 'TBA';
  
  if (isTBA) return null;
  
  const base = typeof basePrice === 'number' ? basePrice : (isNumeric(basePrice) ? parseFloat(String(basePrice)) : undefined);
  const discounted = typeof discountedPrice === 'number' ? discountedPrice : (isNumeric(discountedPrice) ? parseFloat(String(discountedPrice)) : undefined);
  
  if (base === undefined) return null;
  
  const finalPrice = (discounted && base && discounted < base) ? discounted : base;
  return { 
    price: finalPrice, 
    basePrice: base, 
    discountedPrice: (discounted && base && discounted < base) ? discounted : undefined
  };
}

interface Product {
  _id?: string;
  name?: string;
  slug?: string;
  images?: string[];
  image?: string;
  price?: number | string;
  discountedPrice?: number | string;
  isFreeDelivery?: boolean;
  variants?: Array<{
    sku: string;
    finalPrice: number;
    discountedPrice?: number;
    stock: number;
    isActive: boolean;
    attributeCombination: Array<{
      attributeName: string;
      attributeType: string;
      attributeValue: string;
      attributeLabel: string;
    }>;
  }>;
  [key: string]: unknown;
}

/**
 * Hook to sync cart and wishlist product information when a product is updated
 * Call this hook on product pages to keep product data (name, image, slug, prices) in sync
 */
export function useSyncProductPrices(productId: string | undefined, product: Product | undefined) {
  const { items: cartItems, updateProductInfo: updateCartProductInfo } = useLocalCart();
  const { items: wishlistItems, updateProductInfo: updateWishlistProductInfo } = useLocalWishlist();

  useEffect(() => {
    if (!productId || !product) return;

    // Extract product-level information
    const productName = product.name;
    const productSlug = product.slug;
    const productImages = product.images || [];
    const productImage = product.image || (productImages.length > 0 ? productImages[0] : undefined);
    const productIsFreeDelivery = product.isFreeDelivery;

    const variants = (product?.variants ?? []) as Array<{
      sku: string;
      finalPrice: number;
      discountedPrice?: number;
      stock: number;
      isActive: boolean;
      attributeCombination: Array<{
        attributeName: string;
        attributeType: string;
        attributeValue: string;
        attributeLabel: string;
      }>;
    }>;

    const hasVariants = Array.isArray(variants) && variants.length > 0;

    // Sync cart items
    cartItems.forEach((cartItem) => {
      if (cartItem.productId !== productId) return;

      // Prepare updates object
      const updates: {
        name?: string;
        slug?: string;
        image?: string;
        price?: number;
        basePrice?: number;
        discountedPrice?: number;
        isFreeDelivery?: boolean;
      } = {};

      // Update product info (name, slug, image) if changed
      if (productName && cartItem.name !== productName) {
        updates.name = productName;
      }
      if (productSlug && cartItem.slug !== productSlug) {
        updates.slug = productSlug;
      }
      if (productImage && cartItem.image !== productImage) {
        updates.image = productImage;
      }
      if (typeof productIsFreeDelivery === 'boolean' && cartItem.isFreeDelivery !== productIsFreeDelivery) {
        updates.isFreeDelivery = productIsFreeDelivery;
      }

      // Update prices
      let priceData: PriceData | null = null;
      if (hasVariants && cartItem.sku) {
        // Find matching variant by SKU
        const variant = variants.find((v) => v.sku === cartItem.sku);
        if (variant) {
          priceData = calculatePriceData(variant.finalPrice, variant.discountedPrice);
        }
      } else {
        // Product-level price (no variants)
        priceData = calculatePriceData(product?.price, product?.discountedPrice);
      }

      if (priceData && typeof priceData.price === 'number') {
        // Only update if price changed
        if (cartItem.price !== priceData.price || 
            cartItem.basePrice !== priceData.basePrice || 
            cartItem.discountedPrice !== priceData.discountedPrice) {
          updates.price = priceData.price;
          updates.basePrice = priceData.basePrice;
          updates.discountedPrice = priceData.discountedPrice;
        }
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        updateCartProductInfo(productId, updates);
      }
    });

    // Sync wishlist items
    wishlistItems.forEach((wishlistItem) => {
      if (wishlistItem.productId !== productId) return;

      // Prepare updates object
      const updates: {
        name?: string;
        slug?: string;
        image?: string;
        price?: number;
        basePrice?: number;
        discountedPrice?: number;
        isFreeDelivery?: boolean;
      } = {};

      // Update product info (name, slug, image) if changed
      if (productName && wishlistItem.name !== productName) {
        updates.name = productName;
      }
      if (productSlug && wishlistItem.slug !== productSlug) {
        updates.slug = productSlug;
      }
      if (productImage && wishlistItem.image !== productImage) {
        updates.image = productImage;
      }
      if (typeof productIsFreeDelivery === 'boolean' && wishlistItem.isFreeDelivery !== productIsFreeDelivery) {
        updates.isFreeDelivery = productIsFreeDelivery;
      }

      // Update prices
      let priceData: PriceData | null = null;
      if (hasVariants && wishlistItem.sku) {
        // Find matching variant by SKU
        const variant = variants.find((v) => v.sku === wishlistItem.sku);
        if (variant) {
          priceData = calculatePriceData(variant.finalPrice, variant.discountedPrice);
        }
      } else {
        // Product-level price (no variants)
        priceData = calculatePriceData(product?.price, product?.discountedPrice);
      }

      if (priceData && typeof priceData.price === 'number') {
        // Only update if price changed
        if (wishlistItem.price !== priceData.price || 
            wishlistItem.basePrice !== priceData.basePrice || 
            wishlistItem.discountedPrice !== priceData.discountedPrice) {
          updates.price = priceData.price;
          updates.basePrice = priceData.basePrice;
          updates.discountedPrice = priceData.discountedPrice;
        }
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        updateWishlistProductInfo(productId, updates);
      }
    });
  }, [productId, product, cartItems, wishlistItems, updateCartProductInfo, updateWishlistProductInfo]);
}


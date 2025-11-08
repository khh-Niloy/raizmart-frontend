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
  price?: number | string;
  discountedPrice?: number | string;
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
 * Hook to sync cart and wishlist prices when a product is updated
 * Call this hook on product pages to keep prices in sync
 */
export function useSyncProductPrices(productId: string | undefined, product: Product | undefined) {
  const { items: cartItems, updateItemPrice: updateCartItemPrice } = useLocalCart();
  const { items: wishlistItems, updateItemPrice: updateWishlistItemPrice } = useLocalWishlist();

  useEffect(() => {
    if (!productId || !product) return;

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

      if (hasVariants && cartItem.sku) {
        // Find matching variant by SKU
        const variant = variants.find((v) => v.sku === cartItem.sku);
        if (variant) {
          const priceData = calculatePriceData(variant.finalPrice, variant.discountedPrice);
          if (priceData && typeof priceData.price === 'number') {
            // Only update if price changed
            if (cartItem.price !== priceData.price || 
                cartItem.basePrice !== priceData.basePrice || 
                cartItem.discountedPrice !== priceData.discountedPrice) {
              updateCartItemPrice(
                {
                  productId: cartItem.productId,
                  slug: cartItem.slug,
                  name: cartItem.name,
                  image: cartItem.image,
                  price: cartItem.price,
                  sku: cartItem.sku,
                  selectedOptions: cartItem.selectedOptions,
                },
                {
                  price: priceData.price,
                  basePrice: priceData.basePrice,
                  discountedPrice: priceData.discountedPrice,
                }
              );
            }
          }
        }
      } else {
        // Product-level price (no variants)
        const priceData = calculatePriceData(product?.price, product?.discountedPrice);
        if (priceData && typeof priceData.price === 'number') {
          // Only update if price changed
          if (cartItem.price !== priceData.price || 
              cartItem.basePrice !== priceData.basePrice || 
              cartItem.discountedPrice !== priceData.discountedPrice) {
            updateCartItemPrice(
              {
                productId: cartItem.productId,
                slug: cartItem.slug,
                name: cartItem.name,
                image: cartItem.image,
                price: cartItem.price,
                sku: cartItem.sku,
                selectedOptions: cartItem.selectedOptions,
              },
              {
                price: priceData.price,
                basePrice: priceData.basePrice,
                discountedPrice: priceData.discountedPrice,
              }
            );
          }
        }
      }
    });

    // Sync wishlist items
    wishlistItems.forEach((wishlistItem) => {
      if (wishlistItem.productId !== productId) return;

      if (hasVariants && wishlistItem.sku) {
        // Find matching variant by SKU
        const variant = variants.find((v) => v.sku === wishlistItem.sku);
        if (variant) {
          const priceData = calculatePriceData(variant.finalPrice, variant.discountedPrice);
          if (priceData && typeof priceData.price === 'number') {
            // Only update if price changed
            if (wishlistItem.price !== priceData.price || 
                wishlistItem.basePrice !== priceData.basePrice || 
                wishlistItem.discountedPrice !== priceData.discountedPrice) {
              updateWishlistItemPrice(
                {
                  productId: wishlistItem.productId,
                  slug: wishlistItem.slug,
                  name: wishlistItem.name,
                  image: wishlistItem.image,
                  price: wishlistItem.price,
                  sku: wishlistItem.sku,
                  selectedOptions: wishlistItem.selectedOptions,
                },
                {
                  price: priceData.price,
                  basePrice: priceData.basePrice,
                  discountedPrice: priceData.discountedPrice,
                }
              );
            }
          }
        }
      } else {
        // Product-level price (no variants)
        const priceData = calculatePriceData(product?.price, product?.discountedPrice);
        if (priceData && typeof priceData.price === 'number') {
          // Only update if price changed
          if (wishlistItem.price !== priceData.price || 
              wishlistItem.basePrice !== priceData.basePrice || 
              wishlistItem.discountedPrice !== priceData.discountedPrice) {
            updateWishlistItemPrice(
              {
                productId: wishlistItem.productId,
                slug: wishlistItem.slug,
                name: wishlistItem.name,
                image: wishlistItem.image,
                price: wishlistItem.price,
                sku: wishlistItem.sku,
                selectedOptions: wishlistItem.selectedOptions,
              },
              {
                price: priceData.price,
                basePrice: priceData.basePrice,
                discountedPrice: priceData.discountedPrice,
              }
            );
          }
        }
      }
    });
  }, [productId, product, cartItems, wishlistItems, updateCartItemPrice, updateWishlistItemPrice]);
}


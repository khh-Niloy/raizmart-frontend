import { Heart, ShoppingCart, Trash2, X } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocalWishlist } from "@/hooks/useLocalWishlist";
import { useLocalCart } from "@/hooks/useLocalCart";
import { useRouter } from "next/navigation";
import { useAuthGate } from "@/hooks/useAuthGate";

export default function WishList() {
  const { items, count, remove, clear } = useLocalWishlist();
  const { addItem, has } = useLocalCart();
  const router = useRouter();
  const { requireAuth } = useAuthGate();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const onCloseAll = () => setIsOpen(false);
    if (typeof window !== "undefined") {
      window.addEventListener("dialog:closeAll", onCloseAll as any);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("dialog:closeAll", onCloseAll as any);
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center space-x-2 p-2.5 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200 cursor-pointer relative">
          <Heart className="h-5 w-5" />
          <span className="hidden lg:block text-sm font-medium">Wishlist</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#02C1BE] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
              {count}
            </span>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Wishlist</h2>
            {items.length > 0 && (
              <button
                className="text-orange-600 text-sm font-medium hover:underline"
                onClick={clear}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {items.length === 0 && (
              <div className="text-gray-500 text-sm">No items in wishlist.</div>
            )}
            {items.map((it) => (
              <div key={`${it.productId}-${it.sku || ""}`} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.image || "/next.svg"}
                    alt={it.name}
                    className="w-14 h-14 object-contain rounded-md border"
                  />
                  <div>
                    <div className="font-medium">{it.name}</div>
                    {typeof it.price === "number" && (
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        {it.discountedPrice && it.basePrice && it.discountedPrice < it.basePrice ? (
                          <>
                            <span className="text-rose-600 font-semibold">৳ {it.discountedPrice.toFixed(2)}</span>
                            <span className="text-gray-400 line-through">৳ {it.basePrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span>৳ {it.price.toFixed(2)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const matcher = {
                      productId: it.productId,
                      slug: it.slug,
                      name: it.name,
                      image: it.image,
                      price: (it.price as number) || 0,
                      basePrice: it.basePrice,
                      discountedPrice: it.discountedPrice,
                      sku: it.sku,
                      selectedOptions: it.selectedOptions,
                    };
                    const inCart = has(matcher as any);
                    const canAddToCart = typeof it.price === "number" && it.price > 0;
                    return (
                      <button
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
                          inCart || !canAddToCart
                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                            : "bg-[#02C1BE] hover:bg-[#02C1BE]/80 text-white"
                        }`}
                        onClick={() => {
                          if (inCart || !canAddToCart) return;
                          if (!requireAuth()) {
                            setIsOpen(false);
                            return;
                          }
                          addItem({ ...matcher, quantity: 1 });
                        }}
                        disabled={inCart || !canAddToCart}
                        title={!canAddToCart ? "Price is TBA - Cannot add to cart" : undefined}
                      >
                        <ShoppingCart className="h-4 w-4" /> {inCart ? "In Cart" : !canAddToCart ? "Price TBA" : "Add to Cart"}
                      </button>
                    );
                  })()}
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => remove(it)}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

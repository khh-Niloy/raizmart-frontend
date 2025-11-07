import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
        <div className="relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-transparent p-2.5 text-slate-600 transition hover:border-[#02C1BE]/30 hover:bg-[#02C1BE]/10 hover:text-[#02C1BE] lg:flex-row lg:items-center lg:gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#02C1BE]/10 text-[#02C1BE] shadow-inner">
            <Heart className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-slate-700 lg:text-sm">
            Wishlist
          </span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#02C1BE] text-xs font-bold text-white shadow-[0_6px_18px_-6px_rgba(5,150,145,0.6)]">
              {count}
            </span>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="w-[90%] md:w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/40 bg-white/60 p-0 backdrop-blur-xl">
        <div className="flex flex-col gap-6 rounded-[28px] bg-gradient-to-br from-white via-white to-[#ecfffd] p-6 sm:p-8 shadow-[0_40px_120px_-70px_rgba(5,150,145,0.55)]">
          <header className="flex items-center justify-start gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">
                Wishlist
              </h2>
            </div>
            {items.length > 0 && (
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[#02C1BE]/40 bg-white px-4 py-2 text-sm font-semibold text-[#02C1BE] transition hover:bg-[#02C1BE]/10"
                onClick={clear}
              >
                <Trash2 className="h-4 w-4" /> Clear All
              </button>
            )}
          </header>

          <div className="max-h-[65vh] overflow-y-auto pr-2">
            {items.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#02C1BE]/30 bg-[#f7fffe] text-center text-sm text-slate-500">
                <Heart className="h-6 w-6 text-[#02C1BE]" />
                <p className="max-w-sm px-6">
                  You haven't saved anything yet. Explore the catalog and tap
                  the heart icon to build your shortlist.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((it) => {
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
                  const canAddToCart =
                    typeof it.price === "number" && it.price > 0;

                  return (
                    <div
                      key={`${it.productId}-${it.sku || ""}`}
                      className="group relative flex items-center gap-6 rounded-3xl border border-white/70 bg-white p-5 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.5)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_-55px_rgba(5,150,145,0.6)] "
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <div className="flex-1 min-w-0 flex flex-col gap-4">
                      <img
                        src={it.image || "/next.svg"}
                        alt={it.name}
                        className="h-20 w-20 flex-shrink-0 rounded-xl border object-contain shadow-inner"
                      />
                        <div className="space-y-3">
                          <p className="text-base font-semibold text-slate-900 truncate">
                            {it.name}
                          </p>
                          {typeof it.price === "number" && (
                            <div className="flex flex-wrap items-baseline gap-2">
                              {it.discountedPrice &&
                              it.basePrice &&
                              it.discountedPrice < it.basePrice ? (
                                <>
                                  <span className="text-lg font-semibold text-emerald-600">
                                    ৳ {it.discountedPrice.toFixed(2)}
                                  </span>
                                  <span className="text-sm text-slate-400 line-through">
                                    ৳ {it.basePrice.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-semibold text-slate-700">
                                  ৳ {it.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                          {it.selectedOptions &&
                            Object.keys(it.selectedOptions || {}).length >
                              0 && (
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(it.selectedOptions).map(
                                  ([optionKey, optionValue]) => (
                                    <span
                                      key={optionKey}
                                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                                    >
                                      {optionKey}: {String(optionValue)}
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition shadow-[0_18px_40px_-30px_rgba(5,150,145,0.7)] ${
                              inCart || !canAddToCart
                                ? "bg-gray-200 text-gray-500 shadow-none"
                                : "bg-[#02C1BE] text-white hover:bg-[#01b1ae]"
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
                            title={
                              !canAddToCart
                                ? "Price is TBA - Cannot add to cart"
                                : undefined
                            }
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {inCart
                              ? "Already in Cart"
                              : !canAddToCart
                              ? "Price TBA"
                              : "Move to Cart"}
                          </button>
                          <button
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-[#02C1BE]/20 hover:text-[#02C1BE]"
                            onClick={() => remove(it)}
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

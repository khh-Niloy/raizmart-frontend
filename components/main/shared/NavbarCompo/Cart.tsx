import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocalCart } from "@/hooks/useLocalCart";
import { useRouter } from "next/navigation";
import { useAuthGate } from "@/hooks/useAuthGate";

export default function Cart() {
  const { items, subTotal, totalQuantity, clear, updateQuantity, removeItem } =
    useLocalCart();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const { requireAuth } = useAuthGate();

  const totals = React.useMemo(() => {
    const summary = items.reduce(
      (acc, it) => {
        const base =
          typeof it.basePrice === "number"
            ? it.basePrice
            : Number(it.basePrice) || 0;
        const price =
          typeof it.price === "number" ? it.price : Number(it.price) || 0;
        const discounted =
          typeof it.discountedPrice === "number"
            ? it.discountedPrice
            : Number(it.discountedPrice) || price;
        const effective = discounted || price;

        acc.mrp += base || price;
        acc.payable += effective;
        return acc;
      },
      { mrp: 0, payable: 0 }
    );

    const savings = Math.max(0, summary.mrp - summary.payable);
    return {
      mrp: summary.mrp,
      payable: summary.payable,
      savings,
    };
  }, [items]);

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

  const handleContinue = () => {
    if (!requireAuth()) {
      // ensure any open cart dialog is closed before showing auth
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-transparent p-2.5 text-slate-600 transition hover:border-[#02C1BE]/30 hover:bg-[#02C1BE]/10 hover:text-[#02C1BE] lg:flex-row lg:items-center lg:gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#02C1BE]/10 text-[#02C1BE] shadow-inner">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-slate-700 lg:text-sm">
              Cart
            </span>
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#02C1BE] text-xs font-bold text-white shadow-[0_6px_18px_-6px_rgba(5,150,145,0.6)]">
                {totalQuantity}
              </span>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[30px] border border-white/40 bg-white/60 p-0 backdrop-blur-xl">
          <div className="flex flex-col gap-4 rounded-[26px] bg-white p-5 sm:p-6 max-h-[85vh] overflow-hidden">
            <header className="flex items-center justify-start gap-3 flex-shrink-0">
              <h2 className="text-2xl font-bold text-slate-900">Your Bag</h2>
              {items.length > 0 && (
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-gray-50"
                  onClick={clear}
                >
                  <Trash2 className="h-4 w-4" /> Clear
                </button>
              )}
            </header>

            <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                {items.length === 0 ? (
                  <div className="flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#02C1BE]/30 bg-[#f7fffe] p-6 text-center text-sm text-slate-500">
                    <ShoppingCart className="h-8 w-8 text-[#02C1BE]" />
                    <p className="max-w-sm">
                      Your cart is empty. Browse our latest arrivals and tap
                      "Add to Cart" to bring them here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((it) => (
                      <div
                        key={`${it.productId}-${it.sku}`}
                        className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={it.image || "/next.svg"}
                          alt={it.name}
                          className="h-16 w-16 flex-shrink-0 rounded-lg border border-gray-200 bg-white object-contain"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {it.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            {it.discountedPrice &&
                            it.basePrice &&
                            it.discountedPrice < it.basePrice ? (
                              <>
                                <span className="text-base font-semibold text-emerald-600">
                                  ৳ {it.discountedPrice.toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-400 line-through">
                                  ৳ {it.basePrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-base font-semibold text-slate-700">
                                ৳ {it.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {it.selectedOptions &&
                            Object.keys(it.selectedOptions || {}).length >
                              0 && (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {Object.entries(it.selectedOptions).map(
                                  ([optionKey, optionValue]) => (
                                    <span
                                      key={optionKey}
                                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-slate-600"
                                    >
                                      {optionKey}: {String(optionValue)}
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white">
                            <button
                              className="p-1.5 text-slate-500 transition hover:text-slate-900"
                              onClick={() =>
                                updateQuantity(
                                  {
                                    productId: it.productId,
                                    name: it.name,
                                    price: it.price,
                                    sku: it.sku,
                                    selectedOptions: it.selectedOptions,
                                    image: it.image,
                                    slug: it.slug,
                                  },
                                  Math.max(0, it.quantity - 1)
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-2 text-sm font-medium text-slate-800">
                              {it.quantity}
                            </span>
                            <button
                              className="p-1.5 text-slate-500 transition hover:text-slate-900"
                              onClick={() =>
                                updateQuantity(
                                  {
                                    productId: it.productId,
                                    name: it.name,
                                    price: it.price,
                                    sku: it.sku,
                                    selectedOptions: it.selectedOptions,
                                    image: it.image,
                                    slug: it.slug,
                                  },
                                  it.quantity + 1
                                )
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
                            onClick={() =>
                              removeItem({
                                productId: it.productId,
                                name: it.name,
                                price: it.price,
                                sku: it.sku,
                                selectedOptions: it.selectedOptions,
                                image: it.image,
                                slug: it.slug,
                              })
                            }
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-5 flex-shrink-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>MRP (incl. VAT)</span>
                      <span className="font-medium text-slate-900">৳ {totals.mrp.toFixed(2)}</span>
                    </div>
                    {totals.savings > 0 && (
                      <div className="flex items-center justify-between text-emerald-600">
                        <span>Savings</span>
                        <span>- ৳ {totals.savings.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900">৳ {totals.payable.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-base font-semibold text-slate-900">
                      <span>Total payable</span>
                      <span>৳ {totals.payable.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    className="mt-4 w-full rounded-lg bg-[#02C1BE] py-2.5 text-sm font-semibold text-white transition hover:bg-[#01b1ae]"
                    onClick={handleContinue}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

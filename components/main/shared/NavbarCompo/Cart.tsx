import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocalCart } from "@/hooks/useLocalCart";
import { useRouter } from "next/navigation";

export default function Cart() {
  const { items, subTotal, totalQuantity, clear, updateQuantity, removeItem } =
    useLocalCart();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleContinue = () => {
    setIsOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center space-x-2 p-2.5 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200 relative cursor-pointer">
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden lg:block text-sm font-medium">Cart</span>
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#02C1BE] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                {totalQuantity}
              </span>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Cart</h2>
              {items.length > 0 && (
                <button
                  className="text-orange-600 text-sm font-medium hover:underline"
                  onClick={clear}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Items */}
            <div className="mt-6 space-y-4">
              {items.length === 0 && (
                <div className="text-gray-500 text-sm">Your cart is empty.</div>
              )}
              {items.map((it) => (
                <div key={`${it.productId}-${it.sku}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image || "/next.svg"}
                      alt={it.name}
                      className="w-14 h-14 object-contain rounded-md border"
                    />
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-sm text-gray-600">৳ {it.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-full px-2 py-1">
                      <button
                        className="p-1"
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
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3">{it.quantity}</span>
                      <button
                        className="p-1"
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
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600"
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
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-8">
              <div className="text-xl font-semibold">Order Summary</div>
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <input
                    className="flex-1 border rounded-full px-4 py-3 text-sm"
                    placeholder="Apply Coupon"
                    disabled
                  />
                  <button className="px-4 py-3 rounded-full bg-black/90 text-white text-sm" disabled>
                    Apply Coupon
                  </button>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sub Total ({items.length} items)</span>
                    <span>৳ {subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span>৳ 0.00</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>৳ {subTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                className="w-full h-14 rounded-full bg-[#02C1BE] hover:bg-[#02C1BE]/80 hover:cursor-pointer text-white font-semibold"
                onClick={handleContinue}
                disabled={items.length === 0}
              >
                Continue
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

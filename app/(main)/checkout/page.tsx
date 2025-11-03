"use client";
import React from "react";
import Link from "next/link";
import { useLocalCart } from "@/hooks/useLocalCart";

export default function CheckoutPage() {
  const { items, subTotal } = useLocalCart();
  const [agree, setAgree] = React.useState(false);
  const [payment, setPayment] = React.useState<"COD" | "ONLINE">("COD");
  const [deliveryMethod, setDeliveryMethod] = React.useState<"COURIER">("COURIER");

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">&lt; Back</Link>
        <h1 className="text-3xl font-semibold mt-2">Checkout &amp; Confirm Order</h1>
        <div className="mt-3 bg-orange-100 text-orange-700 text-sm rounded-xl px-4 py-3 inline-block">
          অর্ডার সংক্রান্ত যেকোনো প্রয়োজনে কথা বলুন আমাদের কাস্টমার সার্ভিস প্রতিনিধি সাথে - 09678148148
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Delivery form */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Full Name *</label>
              <input className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="Enter full name" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="Enter Email" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Phone Number *</label>
              <input className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="Enter phone number" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Division *</label>
              <select className="mt-1 w-full border rounded-xl px-3 py-2 bg-white">
                <option value="">Select your division</option>
                <option>Dhaka</option>
                <option>Chattogram</option>
                <option>Rajshahi</option>
                <option>Khulna</option>
                <option>Barishal</option>
                <option>Sylhet</option>
                <option>Rangpur</option>
                <option>Mymensingh</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">District *</label>
              <select className="mt-1 w-full border rounded-xl px-3 py-2 bg-white">
                <option value="">Select your city</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Upazila *</label>
              <select className="mt-1 w-full border rounded-xl px-3 py-2 bg-white">
                <option value="">Select your area</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Post Code</label>
              <input className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="Enter Post Code" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Address *</label>
              <input className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="For ex: House: 23, Road: 24, Block: B" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`border rounded-2xl p-4 text-left ${payment === "COD" ? "border-[#02C1BE] ring-2 ring-[#02C1BE]/20" : ""}`}
                  onClick={() => setPayment("COD")}
                >
                  Cash on Delivery
                </button>
                <button
                  className={`border rounded-2xl p-4 text-left ${payment === "ONLINE" ? "border-[#02C1BE] ring-2 ring-[#02C1BE]/20" : ""}`}
                  onClick={() => setPayment("ONLINE")}
                >
                  Online Payment
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Delivery Method</h3>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                <button
                  className={`border rounded-2xl p-4 text-left ${deliveryMethod === "COURIER" ? "border-[#02C1BE] ring-2 ring-[#02C1BE]/20" : ""}`}
                  onClick={() => setDeliveryMethod("COURIER")}
                >
                  Courier Service
                </button>
                {/* Shop Pickup intentionally omitted */}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-4">
            {items.map((it) => (
              <div key={`${it.productId}-${it.sku || ""}`} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image || "/next.svg"} alt={it.name} className="w-12 h-12 object-contain rounded-md border" />
                  <div>
                    <div className="text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-gray-500">{it.quantity} quantity</div>
                  </div>
                </div>
                <div className="text-sm">৳ {(it.price * it.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Apply Coupon</div>
            <div className="flex items-center gap-2">
              <input className="flex-1 border rounded-full px-4 py-2 text-sm" placeholder="Apply Coupon" />
              <button className="px-4 py-2 rounded-full bg-[#111] text-white text-sm cursor-pointer" disabled>Apply Coupon</button>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sub Total ({items.length} items)</span>
              <span>৳ {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="flex items-center gap-1">will be added</span>
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

          <div className="mt-6 text-xs text-gray-700">
            <label className="inline-flex items-start gap-2">
              <input type="checkbox" className="mt-0.5" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                I have read &amp; agree to the website <Link href="#" className="underline cursor-pointer">Terms and Conditions</Link>
              </span>
            </label>
          </div>

          <button
            className={`mt-4 w-full h-12 rounded-full text-white font-semibold ${items.length === 0 || !agree ? "bg-[#02C1BE]/50" : "bg-[#02C1BE] hover:bg-[#02C1BE]/80"}`}
            disabled={items.length === 0 || !agree}
          >
            Confirm &amp; Place Order
          </button>
        </div>
      </div>
    </div>
  );
}



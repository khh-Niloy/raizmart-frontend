"use client";
import React from "react";
import Link from "next/link";
import { useLocalCart } from "@/hooks/useLocalCart";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import { Wallet, Truck } from "lucide-react";
import { useGetCouponsQuery } from "@/app/redux/features/coupon/coupon.api";
import { toast } from "sonner";
import { useCreateOrderMutation } from "@/app/redux/features/order/order.api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subTotal, clear } = useLocalCart();
  const [agree, setAgree] = React.useState(false);
  const [payment, setPayment] = React.useState<"COD" | "ONLINE">("COD");
  const [deliveryMethod, setDeliveryMethod] = React.useState<"COURIER">("COURIER");
  const { data: userInfo } = useUserInfoQuery(undefined);

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [division, setDivision] = React.useState("");
  const [note, setNote] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [upazila, setUpazila] = React.useState("");
  const [postCode, setPostCode] = React.useState("");
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();

  // Location data (basic cascading)
  const divisionOptions = [
    "Dhaka",
    "Chattogram",
    "Rajshahi",
    "Khulna",
    "Barishal",
    "Sylhet",
    "Rangpur",
    "Mymensingh",
  ];

  const districtByDivision: Record<string, string[]> = {
    Dhaka: ["Dhaka", "Gazipur", "Narayanganj"],
    Chattogram: ["Chattogram", "Cox's Bazar"],
    Rajshahi: ["Rajshahi"],
    Khulna: ["Khulna"],
    Barishal: ["Barishal"],
    Sylhet: ["Sylhet"],
    Rangpur: ["Rangpur"],
    Mymensingh: ["Mymensingh"],
  };

  const upazilaByDistrict: Record<string, string[]> = {
    Dhaka: ["Dhanmondi", "Gulshan", "Mirpur"],
    Gazipur: ["Gazipur Sadar"],
    Narayanganj: ["Narayanganj Sadar"],
    Chattogram: ["Kotwali", "Pahartali"],
    "Cox's Bazar": ["Cox's Bazar Sadar"],
    Rajshahi: ["Rajshahi Sadar"],
    Khulna: ["Khulna Sadar"],
    Barishal: ["Barishal Sadar"],
    Sylhet: ["Sylhet Sadar"],
    Rangpur: ["Rangpur Sadar"],
    Mymensingh: ["Mymensingh Sadar"],
  };

  const deliveryCharge = React.useMemo(() => {
    if (!division) return 0;
    return division === "Dhaka" ? 60 : 120;
  }, [division]);

  // Coupon handling
  const { data: coupons } = useGetCouponsQuery(undefined);
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<any | null>(null);
  const [justApplied, setJustApplied] = React.useState(false);

  const computeDiscountForCoupon = React.useCallback((coupon: any) => {
    if (!coupon) return 0;
    const type = (coupon.discountType || "").toString().toUpperCase();
    const value = Number(coupon.discountValue ?? 0);
    if (Number.isNaN(value) || value <= 0) return 0;
    if (type === "PERCENT") {
      const pct = Math.min(Math.max(value, 0), 100);
      return (subTotal * pct) / 100;
    }
    // FIXED
    return Math.min(subTotal, value);
  }, [subTotal]);

  const discount = React.useMemo(() => {
    return computeDiscountForCoupon(appliedCoupon);
  }, [appliedCoupon, computeDiscountForCoupon]);

  const handleApplyCoupon = () => {
    const code = couponCode; // exact text & casing
    if (!code) {
      setAppliedCoupon(null);
      toast.error("Enter a coupon code");
      return;
    }
    const list = Array.isArray(coupons) ? coupons : [];
    const found = list.find((c: any) => (c?.code ?? "") === code);
    if (!found) {
      setAppliedCoupon(null);
      toast.error("Invalid coupon code");
      return;
    }
    // Validate active and date range if present
    const isActive = Boolean(found.isActive ?? true);
    const now = Date.now();
    const starts = found.startDate ? new Date(found.startDate).getTime() : undefined;
    const ends = found.endDate ? new Date(found.endDate).getTime() : undefined;
    const withinStart = starts === undefined || (Number.isFinite(starts) && now >= starts);
    const withinEnd = ends === undefined || (Number.isFinite(ends) && now <= ends);
    if (!isActive || !withinStart || !withinEnd) {
      setAppliedCoupon(null);
      toast.error("Coupon is not active or has expired");
      return;
    }
    setAppliedCoupon(found);
    const saved = computeDiscountForCoupon(found);
    setJustApplied(true);
    window.setTimeout(() => setJustApplied(false), 1200);
    toast.success(`🎉 Coupon applied!`, {
      description: `You saved ৳ ${saved.toFixed(2)}`,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  React.useEffect(() => {
    if (userInfo) {
      setFullName((prev) => (prev ? prev : userInfo.name || ""));
      setEmail((prev) => (prev ? prev : userInfo.email || ""));
      setPhone((prev) => (prev ? prev : userInfo.phone || ""));
    }
  }, [userInfo]);

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
              <input
                className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input
                className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Phone Number *</label>
              <input
                className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Division *</label>
              <Select
                value={division}
                onValueChange={(val) => {
                  setDivision(val);
                  setDistrict("");
                  setUpazila("");
                }}
              >
                <SelectTrigger className="mt-1 w-full rounded-xl">
                  <SelectValue placeholder="Select your division" />
                </SelectTrigger>
                <SelectContent>
                  {divisionOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-700">District *</label>
              <Select
                value={district}
                onValueChange={(val) => {
                  setDistrict(val);
                  setUpazila("");
                }}
                disabled={!division}
              >
                <SelectTrigger className="mt-1 w-full rounded-xl">
                  <SelectValue placeholder="Select your district" />
                </SelectTrigger>
                <SelectContent>
                  {(districtByDivision[division] || []).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Upazila *</label>
              <Select
                value={upazila}
                onValueChange={(val) => setUpazila(val)}
                disabled={!district}
              >
                <SelectTrigger className="mt-1 w-full rounded-xl">
                  <SelectValue placeholder="Select your upazila" />
                </SelectTrigger>
                <SelectContent>
                  {(upazilaByDistrict[district] || []).map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Post Code</label>
              <input
                className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="Enter Post Code"
                value={postCode}
                onChange={(e) => setPostCode(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Address *</label>
              <input
                className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="For ex: House: 23, Road: 24, Block: B"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-700">Order Note</label>
              <textarea
                className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[88px]"
                placeholder="Any special instructions? (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold">Payment Method</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">We currently accept cash on delivery.</p>
              <div className="grid grid-cols-1 gap-3">
                <label
                  className={`group relative flex items-center justify-between border rounded-2xl p-4 cursor-pointer transition-colors ${
                    payment === "COD" ? "border-[#02C1BE] ring-2 ring-[#02C1BE]/20" : "hover:border-gray-300"
                  }`}
                  onClick={() => setPayment("COD")}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-[#02C1BE]" />
                    <div className="text-left">
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-xs text-gray-500">Pay when your order arrives</div>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="COD" checked={payment === "COD"} readOnly className="sr-only" />
                </label>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Delivery Method</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">Fast nationwide courier delivery.</p>
              <div className="grid grid-cols-1 gap-3">
                <label
                  className={`group relative flex items-center justify-between border rounded-2xl p-4 cursor-pointer transition-colors ${
                    deliveryMethod === "COURIER" ? "border-[#02C1BE] ring-2 ring-[#02C1BE]/20" : "hover:border-gray-300"
                  }`}
                  onClick={() => setDeliveryMethod("COURIER")}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-[#02C1BE]" />
                    <div className="text-left">
                      <div className="font-medium">Courier Service</div>
                      <div className="text-xs text-gray-500">Standard delivery charge applies by division</div>
                    </div>
                  </div>
                  <input type="radio" name="delivery" value="COURIER" checked readOnly className="sr-only" />
                </label>
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
              <input
                className="flex-1 border rounded-full px-4 py-2 text-sm"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={Boolean(appliedCoupon)}
              />
              {appliedCoupon ? (
                <button
                  className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm cursor-pointer"
                  onClick={handleRemoveCoupon}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded-full bg-[#111] hover:bg-black text-white text-sm cursor-pointer"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </button>
              )}
            </div>
            {appliedCoupon && (
              <div className="mt-2 text-xs text-green-600">
                Applied: {appliedCoupon.code} — {appliedCoupon.discountType === "PERCENT" ? `${appliedCoupon.discountValue}%` : `৳ ${Number(appliedCoupon.discountValue).toFixed(2)}`} off · You save ৳ {discount.toFixed(2)}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sub Total ({items.length} items)</span>
              <span>৳ {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="flex items-center gap-1">৳ {deliveryCharge.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between ${justApplied ? "bg-green-50 text-green-700 rounded-xl px-3 py-2 transition-colors" : ""}`}>
              <span className="text-gray-600">Discount</span>
              <span>৳ {discount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span>৳ {(subTotal + deliveryCharge - discount).toFixed(2)}</span>
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
            disabled={items.length === 0 || !agree || creatingOrder}
            onClick={async () => {
              const payload = {
                customer: {
                  fullName,
                  email,
                  phone,
                  division,
                  district,
                  upazila,
                  postCode,
                  address,
                  note,
                },
                payment: {
                  method: payment,
                },
                delivery: {
                  method: deliveryMethod,
                  division,
                  charge: deliveryCharge,
                },
                cart: items.map((it) => ({
                  productId: it.productId,
                  sku: it.sku ?? null,
                  quantity: it.quantity,
                })),
                coupon: {
                  code: appliedCoupon ? appliedCoupon.code : (couponCode || null),
                },
              };
              try {
                const res: any = await createOrder(payload).unwrap();
                if (res?.success) {
                  toast.success("Order placed successfully");
                  // Clear cart and reset local checkout state, then redirect to orders page
                  clear();
                  setAppliedCoupon(null);
                  setCouponCode("");
                  setAgree(false);
                  setPayment("COD");
                  setDeliveryMethod("COURIER");
                  setFullName("");
                  setEmail("");
                  setPhone("");
                  setAddress("");
                  setDivision("");
                  setDistrict("");
                  setUpazila("");
                  setPostCode("");
                  setNote("");
                  router.push("/profile/orders");
                } else {
                  toast.success("Order submitted");
                  clear();
                  setAppliedCoupon(null);
                  setCouponCode("");
                  setAgree(false);
                  setPayment("COD");
                  setDeliveryMethod("COURIER");
                  setFullName("");
                  setEmail("");
                  setPhone("");
                  setAddress("");
                  setDivision("");
                  setDistrict("");
                  setUpazila("");
                  setPostCode("");
                  setNote("");
                  router.push("/profile/orders");
                }
              } catch (e: any) {
                const message = e?.data?.message || e?.message || "Failed to place order";
                toast.error(message);
              }
            }}
          >
            {creatingOrder ? "Placing Order..." : "Confirm & Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}



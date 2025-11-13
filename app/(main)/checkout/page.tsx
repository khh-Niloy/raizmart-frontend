"use client";
import React from "react";
import Link from "next/link";
import { useLocalCart } from "@/hooks/useLocalCart";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import { Wallet, Truck } from "lucide-react";
import { useValidateCouponMutation } from "@/app/redux/features/coupon/coupon.api";
import { toast } from "sonner";
import { useCreateOrderMutation } from "@/app/redux/features/order/order.api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useAuthGate } from "@/hooks/useAuthGate";
import { Badge } from "@/components/ui/badge";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subTotal, clear } = useLocalCart();
  const [agree, setAgree] = React.useState(false);
  const [payment, setPayment] = React.useState<"COD" | "ONLINE">("COD");
  const [deliveryMethod, setDeliveryMethod] = React.useState<"COURIER">("COURIER");
  const { data: userInfo, isLoading: isLoadingUser } = useUserInfoQuery(undefined);
  const { openAuth } = useAuthGate();

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
  const hasOpenedAuthRef = React.useRef(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  
  React.useEffect(() => {
    // Only open auth modal once when page loads if user is not logged in
    // Wait for auth query to finish loading before checking
    if (!isLoadingUser && !userInfo && !hasOpenedAuthRef.current) {
      hasOpenedAuthRef.current = true;
      openAuth();
    }
  }, [userInfo, isLoadingUser, openAuth]);

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

  // Coupon handling
  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();
  const [couponCode, setCouponCode] = React.useState("");
  interface Coupon {
    code: string;
    discountType: string;
    discountValue?: number;
  }

  console.log(items);

  const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
  const [justApplied, setJustApplied] = React.useState(false);

  // Calculate delivery charge - free if FREE_DELIVERY coupon is applied OR if any product has isFreeDelivery
  const deliveryCharge = React.useMemo(() => {
    // If FREE_DELIVERY coupon is applied, delivery is free
    if (appliedCoupon?.discountType === "FREE_DELIVERY") {
      return 0;
    }
    // If any product in cart has isFreeDelivery set to true, delivery is free
    const hasFreeDeliveryProduct = items.some((item) => item.isFreeDelivery === true);
    if (hasFreeDeliveryProduct) {
      return 0;
    }
    if (!division) return 0;
    return division === "Dhaka" ? 60 : 120;
  }, [division, appliedCoupon, items]);

  const computeDiscountForCoupon = React.useCallback((coupon: Coupon | null) => {
    if (!coupon) return 0;
    const type = (coupon.discountType || "").toString().toUpperCase();
    
    // FREE_DELIVERY doesn't provide product discount, only free delivery
    if (type === "FREE_DELIVERY") {
      return 0;
    }
    
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

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setAppliedCoupon(null);
      toast.error("Enter a coupon code");
      return;
    }

    try {
      const result = await validateCoupon(code).unwrap();
      if (result) {
        const coupon: Coupon = {
          code,
          discountType: result.discountType,
          discountValue: result.discountValue,
        };
        setAppliedCoupon(coupon);
        const saved = computeDiscountForCoupon(coupon);
        setJustApplied(true);
        window.setTimeout(() => setJustApplied(false), 1200);
        
        // Show different message for FREE_DELIVERY
        if (result.discountType === "FREE_DELIVERY") {
          toast.success(`🎉 Free Delivery Applied!`, {
            description: `Your delivery charge will be free`,
          });
        } else {
          toast.success(`🎉 Coupon applied!`, {
            description: `You saved ৳ ${saved.toFixed(2)}`,
          });
        }
      } else {
        setAppliedCoupon(null);
        toast.error("Invalid coupon code");
      }
    } catch (error: unknown) {
      setAppliedCoupon(null);
      const errorData = error as { data?: { message?: string }; message?: string };
      const message = errorData?.data?.message || errorData?.message || "Invalid coupon code";
      toast.error(message);
    }
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
          অর্ডার সংক্রান্ত যেকোনো প্রয়োজনে কথা বলুন আমাদের কাস্টমার সার্ভিস প্রতিনিধির সাথে - 01601560955
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
                className={`mt-1 w-full border rounded-xl px-3 py-2 ${validationErrors.fullName ? "border-red-500" : ""}`}
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (validationErrors.fullName) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.fullName;
                      return newErrors;
                    });
                  }
                }}
              />
              {validationErrors.fullName && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.fullName}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-700">Email *</label>
              <input
                className={`mt-1 w-full border rounded-xl px-3 py-2 ${validationErrors.email ? "border-red-500" : ""}`}
                placeholder="Enter Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.email;
                      return newErrors;
                    });
                  }
                }}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-700">Phone Number *</label>
              <input
                className={`mt-1 w-full border rounded-xl px-3 py-2 ${validationErrors.phone ? "border-red-500" : ""}`}
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (validationErrors.phone) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.phone;
                      return newErrors;
                    });
                  }
                }}
              />
              {validationErrors.phone && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.phone}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-700">Division *</label>
              <Select
                value={division}
                onValueChange={(val) => {
                  setDivision(val);
                  setDistrict("");
                  setUpazila("");
                  if (validationErrors.division) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.division;
                      return newErrors;
                    });
                  }
                }}
              >
                <SelectTrigger className={`mt-1 w-full rounded-xl ${validationErrors.division ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select your division" />
                </SelectTrigger>
                <SelectContent>
                  {divisionOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.division && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.division}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-700">District *</label>
              <input
                className={`mt-1 w-full border rounded-xl px-3 py-2 ${validationErrors.district ? "border-red-500" : ""}`}
                placeholder="Enter your district"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  if (validationErrors.district) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.district;
                      return newErrors;
                    });
                  }
                }}
              />
              {validationErrors.district && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.district}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-700">Upazila *</label>
              <input
                className={`mt-1 w-full border rounded-xl px-3 py-2 ${validationErrors.upazila ? "border-red-500" : ""}`}
                placeholder="Enter your upazila"
                value={upazila}
                onChange={(e) => {
                  setUpazila(e.target.value);
                  if (validationErrors.upazila) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.upazila;
                      return newErrors;
                    });
                  }
                }}
              />
              {validationErrors.upazila && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.upazila}</p>
              )}
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
                className={`mt-1 w-full border rounded-xl px-3 py-2 ${validationErrors.address ? "border-red-500" : ""}`}
                placeholder="For ex: House: 23, Road: 24, Block: B"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (validationErrors.address) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.address;
                      return newErrors;
                    });
                  }
                }}
              />
              {validationErrors.address && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.address}</p>
              )}
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
              <div key={`${it.productId}-${it.sku || ""}`} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image || "/next.svg"} alt={it.name} className="w-12 h-12 object-contain rounded-md border flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{it.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs text-gray-500">{it.quantity} quantity</div>
                      {it.isFreeDelivery === true && (
                        <Badge className="bg-emerald-600 text-white border-transparent text-[10px] px-1.5 py-0.5 font-medium">
                          Free Delivery
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900 flex-shrink-0">৳ {(it.price * it.quantity).toFixed(2)}</div>
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
                  className="px-4 py-2 rounded-full bg-[#111] hover:bg-black text-white text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon}
                >
                  {isValidatingCoupon ? "Validating..." : "Apply"}
                </button>
              )}
            </div>
            {appliedCoupon && (
              <div className="mt-2 text-xs text-green-600">
                {appliedCoupon.discountType === "FREE_DELIVERY" ? (
                  <span>✅ Applied: {appliedCoupon.code} — Free Delivery</span>
                ) : (
                  <span>Applied: {appliedCoupon.code} — {appliedCoupon.discountType === "PERCENT" ? `${appliedCoupon.discountValue}%` : `৳ ${Number(appliedCoupon.discountValue).toFixed(2)}`} off · You save ৳ {discount.toFixed(2)}</span>
                )}
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
              {appliedCoupon?.discountType === "FREE_DELIVERY" || items.some((item) => item.isFreeDelivery === true) ? (
                <span className="flex items-center gap-1">
                  <span className="text-green-600 font-semibold">Free</span>
                  {division && (
                    <span className="text-xs text-gray-400 line-through">৳ {division === "Dhaka" ? "60.00" : "120.00"}</span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-1">৳ {deliveryCharge.toFixed(2)}</span>
              )}
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
              // Validate all required fields
              const errors: Record<string, string> = {};
              
              if (!fullName.trim()) {
                errors.fullName = "Full name is required";
              }
              
              // Email OR Phone must be provided (at least one)
              if (!email.trim() && !phone.trim()) {
                errors.email = "Email or phone number is required";
                errors.phone = "Email or phone number is required";
              }
              
              if (!division) {
                errors.division = "Division is required";
              }
              
              if (!district) {
                errors.district = "District is required";
              }
              
              if (!upazila) {
                errors.upazila = "Upazila is required";
              }
              
              if (!address.trim()) {
                errors.address = "Address is required";
              }
              
              // If there are validation errors, show them and return
              if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                toast.error("Please fill in all required fields");
                return;
              }
              
              // Clear any previous errors
              setValidationErrors({});
              
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
                interface OrderResponse {
                  success?: boolean;
                  message?: string;
                  data?: unknown;
                  [key: string]: unknown;
                }

                const res = await createOrder(payload).unwrap() as OrderResponse;
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
              } catch (e: unknown) {
                const errorData = e as { data?: { message?: string }; message?: string };
                const message = errorData?.data?.message || errorData?.message || "Failed to place order";
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



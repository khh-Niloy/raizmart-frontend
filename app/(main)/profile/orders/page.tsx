"use client";

import React from "react";
import { Package, Search, Filter } from "lucide-react";
import { useGetMyOrdersQuery } from "@/app/redux/features/order/order.api";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import { useAuthGate } from "@/hooks/useAuthGate";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function OrdersPage() {
  const { data: userInfo, isLoading: isLoadingUser } = useUserInfoQuery(undefined);
  const { openAuth } = useAuthGate();
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(undefined as any, { skip: !userInfo });
  console.log("orders", orders);
  const [open, setOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null);

  const hasOpenedAuthRef = React.useRef(false);
  
  React.useEffect(() => {
    // Only open auth modal once when page loads if user is not logged in
    // Wait for auth query to finish loading before checking
    if (!isLoadingUser && !userInfo && !hasOpenedAuthRef.current) {
      hasOpenedAuthRef.current = true;
      openAuth();
    }
  }, [userInfo, isLoadingUser, openAuth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-600 bg-green-100";
      case "Shipped":
        return "text-blue-600 bg-blue-100";
      case "Processing":
        return "text-yellow-600 bg-yellow-100";
      case "REQUESTED":
        return "text-yellow-700 bg-yellow-100";
      case "CONFIRMED":
        return "text-blue-700 bg-blue-100";
      case "CANCELLED":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-24 ml-auto" />
                  <Skeleton className="h-3 w-20 ml-auto" />
                </div>
              </div>
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order: any) => {
                const slug = order?.slug || order?.orderSlug || order?.order_slug;
                const orderId = order?._id || order?.id || order?.orderId || "#ORDER";
                const status = (order?.status || "").toString();
                const grandTotal = order?.totals?.grandTotal ?? order?.total;
                const currency = order?.currency === "BDT" ? "৳" : "";
                const totalDisplay = grandTotal != null ? `${currency} ${Number(grandTotal).toFixed(0)}` : "";
                const items: any[] = Array.isArray(order?.items) ? order.items : [];
                const firstItem = items?.[0] || {};
                const productName = firstItem?.productName || firstItem?.name || firstItem?.title || "—";
                const productImage = Array.isArray(firstItem?.images) ? firstItem.images[0] : (firstItem?.image || "");
                const productThumbs: string[] = items
                  .map((it: any) => (Array.isArray(it?.images) ? it.images[0] : (it?.image || "")))
                  .filter(Boolean);
                const productList = items.map((it: any) => ({
                  name: it?.productName || it?.name || it?.title || "—",
                  image: Array.isArray(it?.images) ? it.images[0] : (it?.image || ""),
                }));
                const quantityTotal = items.reduce((sum, it: any) => sum + (Number(it?.quantity) || 0), 0) || 0;

                return (
                  <tr key={orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <div className="max-h-28 overflow-auto pr-2 space-y-2">
                            {productList.length === 0 ? (
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-md bg-gray-100 border flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-600">No items</p>
                              </div>
                            ) : (
                              productList.map((p, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={p.image} alt={p.name} className="h-10 w-10 rounded-md border object-cover bg-white" />
                                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                </div>
                              ))
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Order: {slug || orderId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quantityTotal}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status || "Processing"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{totalDisplay}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOpen(true);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <button className="px-6 py-3 bg-custom text-white rounded-lg hover:bg-custom/90 transition-colors duration-200 cursor-pointer">
            Start Shopping
          </button>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="text-gray-500">Order:</span> {selectedOrder.order_slug || selectedOrder.slug || selectedOrder._id || selectedOrder.id}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(String(selectedOrder.status || ""))}`}>
                  {String(selectedOrder.status || "Processing")}
                </span>
              </div>

              {/* Customer & Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">Customer</div>
                  <div className="text-sm text-gray-900">{selectedOrder?.customer?.fullName}</div>
                  <div className="text-xs text-gray-600">{selectedOrder?.customer?.phone}</div>
                  <div className="text-xs text-gray-600 truncate">{selectedOrder?.customer?.email}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">Delivery</div>
                  <div className="text-sm text-gray-900 capitalize">{selectedOrder?.delivery?.method?.toLowerCase?.()}</div>
                  <div className="text-xs text-gray-600">{selectedOrder?.customer?.address}</div>
                  <div className="text-xs text-gray-600">{selectedOrder?.customer?.upazila}, {selectedOrder?.customer?.district}, {selectedOrder?.customer?.division}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">Payment</div>
                  <div className="text-sm text-gray-900">{selectedOrder?.payment?.method}</div>
                  {selectedOrder?.couponCode && (
                    <div className="text-xs text-emerald-700 mt-1">Coupon: {selectedOrder.couponCode}</div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="max-h-72 overflow-auto border rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-600 px-4 py-2">Product</th>
                      <th className="text-left text-xs font-medium text-gray-600 px-4 py-2">Name</th>
                      <th className="text-left text-xs font-medium text-gray-600 px-4 py-2">Qty</th>
                      <th className="text-right text-xs font-medium text-gray-600 px-4 py-2">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((it: any, idx: number) => {
                      const img = it?.image || (Array.isArray(it?.images) ? it.images[0] : undefined) || "/next.svg";
                      const name = it?.name || it?.productName || it?.title || "Item";
                      const qty = Number(it?.quantity ?? 1);
                      const unit = Number(it?.unitPriceFinal ?? it?.unitPrice ?? it?.price ?? 0);
                      const line = Number(it?.lineTotal ?? it?.lineSubtotal ?? unit * qty);
                      return (
                        <tr key={idx}>
                          <td className="px-4 py-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt={name} className="w-10 h-10 object-cover rounded-md border" />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{qty}</td>
                          <td className="px-4 py-2 text-sm text-right">৳ {line.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>৳ {Number(selectedOrder?.totals?.subtotal ?? 0).toFixed(2)}</span>
                </div>
                {(selectedOrder?.totals?.itemDiscountTotal || selectedOrder?.totals?.discountTotal || selectedOrder?.totals?.couponDiscount) && (
                  <div className="space-y-1">
                    {Number(selectedOrder?.totals?.itemDiscountTotal || 0) > 0 && (
                      <div className="flex justify-between text-rose-700">
                        <span>Item Discounts</span>
                        <span>- ৳ {Number(selectedOrder?.totals?.itemDiscountTotal || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {Number(selectedOrder?.totals?.couponDiscount || 0) > 0 && (
                      <div className="flex justify-between text-rose-700">
                        <span>Coupon ({selectedOrder?.couponCode})</span>
                        <span>- ৳ {Number(selectedOrder?.totals?.couponDiscount || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {Number(selectedOrder?.totals?.discountTotal || 0) > 0 && (
                      <div className="flex justify-between text-rose-700">
                        <span>Total Discount</span>
                        <span>- ৳ {Number(selectedOrder?.totals?.discountTotal || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>৳ {Number(selectedOrder?.totals?.shippingTotal ?? selectedOrder?.delivery?.charge ?? 0).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-base">
                  <span>Grand Total</span>
                  <span>৳ {Number(selectedOrder?.totals?.grandTotal ?? selectedOrder?.total ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No order selected.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

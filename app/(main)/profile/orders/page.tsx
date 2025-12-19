"use client";

import React from "react";
import { Package, ChevronRight, FileText, Download } from "lucide-react";
import { useGetMyOrdersQuery } from "@/app/redux/features/order/order.api";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import { useAuthGate } from "@/hooks/useAuthGate";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface OrderItem {
  _id?: string;
  name?: string;
  productName?: string;
  title?: string;
  quantity?: number;
  price?: number;
  image?: string;
  images?: string[];
  [key: string]: unknown;
}

interface Order {
  _id?: string;
  id?: string;
  orderId?: string;
  slug?: string;
  orderSlug?: string;
  order_slug?: string;
  status?: string;
  createdAt?: string;
  total?: number;
  currency?: string;
  items?: OrderItem[];
  totals?: {
    grandTotal?: number;
    subtotal?: number;
    itemDiscountTotal?: number;
    discountTotal?: number;
    couponDiscount?: number;
  };
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    thana?: string;
    district?: string;
    division?: string;
  };
  delivery?: {
    method?: string;
  };
  payment?: {
    method?: string;
  };
  couponCode?: string;
  invoiceUrl?: string | null;
  [key: string]: unknown;
}

export default function OrdersPage() {
  const { data: userInfo, isLoading: isLoadingUser } =
    useUserInfoQuery(undefined);
  const { openAuth } = useAuthGate();
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(undefined, {
    skip: !userInfo,
  });
  const [open, setOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  const hasOpenedAuthRef = React.useRef(false);

  React.useEffect(() => {
    // Only open auth modal once when page loads if user is not logged in
    // Wait for auth query to finish loading before checking
    if (!isLoadingUser && !userInfo && !hasOpenedAuthRef.current) {
      hasOpenedAuthRef.current = true;
      openAuth();
    }
  }, [userInfo, isLoadingUser, openAuth]);

  // Map technical statuses to user-friendly labels (hide Pathao/Steadfast details)
  const getCustomerFriendlyStatus = (status: string): string => {
    const s = status.toLowerCase();
    switch (s) {
      case "sent_with_pathao":
      case "sent_with_steadfast":
        return "Shipped";
      case "dispatch":
        return "Shipped";
      case "pending":
        return "Processing";
      case "approved":
        return "Confirmed";
      case "hold":
        return "On Hold";
      case "cancel":
      case "cancelled":
        return "Cancelled";
      default:
        // Capitalize first letter for other statuses
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "delivered":
        return "text-green-600 bg-green-100";
      case "dispatch":
      case "sent_with_pathao":
      case "sent_with_steadfast":
      case "shipped":
        return "text-blue-600 bg-blue-100";
      case "pending":
      case "processing":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
      case "confirmed":
        return "text-blue-700 bg-blue-100";
      case "hold":
        return "text-orange-600 bg-orange-100";
      case "cancel":
      case "cancelled":
        return "text-red-700 bg-red-100";
      case "returned":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const stats = React.useMemo(() => {
    if (!Array.isArray(orders)) {
      return { total: 0, delivered: 0, processing: 0, cancelled: 0 };
    }
    const delivered = orders.filter(
      (o: Order) => String(o?.status).toLowerCase() === "delivered"
    ).length;
    const processing = orders.filter((o: Order) => {
      const s = String(o?.status).toLowerCase();
      return ["processing", "pending", "approved", "dispatch", "sent_with_pathao", "sent_with_steadfast", "requested", "confirmed", "shipped"].includes(s);
    }).length;
    const cancelled = orders.filter((o: Order) => {
      const s = String(o?.status).toLowerCase();
      return ["cancel", "cancelled"].includes(s);
    }).length;
    return {
      total: orders.length,
      delivered,
      processing,
      cancelled,
    };
  }, [orders]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_30px_100px_-70px_rgba(5,150,145,0.45)] sm:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE]">
              Purchases
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Your Orders</h1>
            <p className="text-sm text-slate-500">
              Track deliveries, review invoices, and manage returns in one
              place.
            </p>
          </div>
          {/* <div className="flex flex-wrap gap-3">
            <label className="relative flex items-center rounded-full border border-[#02C1BE]/20 bg-white px-4 py-2 text-sm text-slate-500">
              <Search className="mr-2 h-4 w-4 text-[#02C1BE]" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-40 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-52"
              />
            </label>
            <button className="inline-flex items-center gap-2 rounded-full border border-[#02C1BE]/20 bg-[#02C1BE]/10 px-4 py-2 text-sm font-semibold text-[#02C1BE] transition hover:bg-[#01b1ae]/10">
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div> */}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Orders",
              value: stats.total,
              tone: "text-[#02C1BE]",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_40px_-30px_rgba(5,150,145,0.3)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {stat.label}
              </p>
              <p className={`mt-2 text-2xl font-bold ${stat.tone}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-[#02C1BE]/30 bg-[#f7fffe] py-16 text-center">
          <Package className="h-12 w-12 text-[#02C1BE]" />
          <h3 className="text-lg font-semibold text-slate-900">
            You haven’t placed any orders yet
          </h3>
          <p className="max-w-sm text-sm text-slate-500">
            Start exploring new arrivals and add products to your cart to see
            them appear here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#02C1BE] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_20px_40px_-30px_rgba(5,150,145,0.65)] transition hover:bg-[#01b1ae]"
          >
            Continue shopping <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order: Order) => {
            const slug = order?.slug || order?.orderSlug || order?.order_slug;
            const orderId =
              order?._id || order?.id || order?.orderId || "#ORDER";
            const status = (order?.status || "").toString();
            const grandTotal = order?.totals?.grandTotal ?? order?.total;
            const currency = order?.currency === "BDT" ? "৳" : "";
            const totalDisplay =
              grandTotal != null
                ? `${currency} ${Number(grandTotal).toFixed(0)}`
                : "";
            const items: OrderItem[] = Array.isArray(order?.items)
              ? order.items
              : [];
            const quantityTotal =
              items.reduce(
                (sum, it: OrderItem) => sum + (Number(it?.quantity) || 0),
                0
              ) || 0;

            const previewItems = items.slice(0, 3);
            const statusTone = getStatusColor(status);

            return (
              <div
                key={orderId}
                className="group flex h-full flex-col justify-between gap-4 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_-55px_rgba(5,150,145,0.6)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Order
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {slug || orderId}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
                    >
                      {getCustomerFriendlyStatus(status) || "Processing"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {previewItems.length === 0 ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400">
                        <Package className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="flex -space-x-2">
                        {previewItems.map((it: OrderItem, idx: number) => {
                          const img = Array.isArray(it?.images)
                            ? it.images[0]
                            : it?.image;
                          return (
                            <div
                              key={idx}
                              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white bg-white shadow"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img || "/next.svg"}
                                alt={it?.name || "Item"}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {previewItems[0]?.name || "Order items"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {quantityTotal} items · {totalDisplay}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Placed on{" "}
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "—"}
                  </div>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-[#02C1BE]/20 bg-[#02C1BE]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#02C1BE] transition hover:bg-[#01b1ae]/10"
                    onClick={() => {
                      setSelectedOrder(order);
                      setOpen(true);
                    }}
                  >
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90%] md:w-full max-w-4xl max-h-[calc(100vh-4rem)] sm:max-h-[85vh] overflow-hidden rounded-[30px] border border-white/40 bg-white/70 p-0 backdrop-blur-xl">
          <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] sm:max-h-[85vh] overflow-hidden rounded-[28px] bg-gradient-to-br from-white via-white to-[#ecfffd]">
            <div className="flex-shrink-0 p-4 sm:p-6 pb-3 border-b border-gray-100">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                  Order Details
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-8">
              {selectedOrder ? (
                <div className="space-y-4 sm:space-y-6 py-4 pb-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-600">
                      <span className="text-slate-400">Order:</span>{" "}
                      {selectedOrder.order_slug ||
                        selectedOrder.slug ||
                        selectedOrder._id ||
                        selectedOrder.id}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedOrder?.invoiceUrl && (
                        <a
                          href={selectedOrder.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[#02C1BE]/20 bg-[#02C1BE]/10 px-4 py-2 text-xs font-semibold text-[#02C1BE] transition hover:bg-[#01b1ae]/10"
                        >
                          <FileText className="h-4 w-4" />
                          View Invoice
                        </a>
                      )}
                      <Badge
                        className={getStatusColor(
                          String(selectedOrder.status || "")
                        )}
                      >
                        {getCustomerFriendlyStatus(String(selectedOrder.status || "Processing"))}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Customer
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {selectedOrder?.customer?.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedOrder?.customer?.phone}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {selectedOrder?.customer?.email}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Delivery
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 capitalize">
                        {selectedOrder?.delivery?.method?.toLowerCase?.()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedOrder?.customer?.address}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedOrder?.customer?.thana},{" "}
                        {selectedOrder?.customer?.district},{" "}
                        {selectedOrder?.customer?.division}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Payment
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {selectedOrder?.payment?.method}
                      </p>
                      {selectedOrder?.couponCode && (
                        <p className="mt-1 text-xs text-emerald-600">
                          Coupon: {selectedOrder.couponCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="max-h-48 sm:max-h-72 overflow-auto rounded-2xl border border-white/60 bg-white">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left text-xs font-medium text-gray-600 px-4 py-2">
                            Product
                          </th>
                          <th className="text-left text-xs font-medium text-gray-600 px-4 py-2">
                            Name
                          </th>
                          <th className="text-left text-xs font-medium text-gray-600 px-4 py-2">
                            Qty
                          </th>
                          <th className="text-right text-xs font-medium text-gray-600 px-4 py-2">
                            Line Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(Array.isArray(selectedOrder.items)
                          ? selectedOrder.items
                          : []
                        ).map((it: OrderItem, idx: number) => {
                          const img =
                            it?.image ||
                            (Array.isArray(it?.images)
                              ? it.images[0]
                              : undefined) ||
                            "/next.svg";
                          const name =
                            it?.name || it?.productName || it?.title || "Item";
                          const qty = Number(it?.quantity ?? 1);
                          const unit = Number(
                            it?.unitPriceFinal ??
                              it?.unitPrice ??
                              it?.price ??
                              0
                          );
                          const line = Number(
                            it?.lineTotal ?? it?.lineSubtotal ?? unit * qty
                          );
                          return (
                            <tr key={idx}>
                              <td className="px-4 py-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={img}
                                  alt={name}
                                  className="w-10 h-10 object-cover rounded-md border"
                                />
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {name}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {qty}
                              </td>
                              <td className="px-4 py-2 text-sm text-right">
                                ৳ {line.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="rounded-2xl border border-white/60 bg-white p-5 text-sm text-slate-600 shadow-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900">
                        ৳{" "}
                        {Number(selectedOrder?.totals?.subtotal ?? 0).toFixed(
                          2
                        )}
                      </span>
                    </div>
                    {(selectedOrder?.totals?.itemDiscountTotal ||
                      selectedOrder?.totals?.discountTotal ||
                      selectedOrder?.totals?.couponDiscount) && (
                      <div className="space-y-1">
                        {Number(selectedOrder?.totals?.itemDiscountTotal || 0) >
                          0 && (
                          <div className="flex justify-between text-rose-700">
                            <span>Item Discounts</span>
                            <span>
                              - ৳{" "}
                              {Number(
                                selectedOrder?.totals?.itemDiscountTotal || 0
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {Number(selectedOrder?.totals?.couponDiscount || 0) >
                          0 && (
                          <div className="flex justify-between text-rose-700">
                            <span>Coupon ({selectedOrder?.couponCode})</span>
                            <span>
                              - ৳{" "}
                              {Number(
                                selectedOrder?.totals?.couponDiscount || 0
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {Number(selectedOrder?.totals?.discountTotal || 0) >
                          0 && (
                          <div className="flex justify-between text-rose-700">
                            <span>Total Discount</span>
                            <span>
                              - ৳{" "}
                              {Number(
                                selectedOrder?.totals?.discountTotal || 0
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-medium text-slate-900">
                        ৳{" "}
                        {Number(
                          (selectedOrder?.totals as { shippingTotal?: number }).shippingTotal ??
                            (selectedOrder?.delivery as { charge?: number }).charge ??
                            0
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-base font-semibold text-slate-900">
                      <span>Grand Total</span>
                      <span>
                        ৳{" "}
                        {Number(
                          selectedOrder?.totals?.grandTotal ??
                            selectedOrder?.total ??
                            0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {selectedOrder?.invoiceUrl && (
                    <div className="flex justify-center">
                      <a
                        href={selectedOrder.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#02C1BE] px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-30px_rgba(5,150,145,0.65)] transition hover:bg-[#01b1ae]"
                      >
                        <Download className="h-4 w-4" />
                        Download Invoice PDF
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No order selected.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

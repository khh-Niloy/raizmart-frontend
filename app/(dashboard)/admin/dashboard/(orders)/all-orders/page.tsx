"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetAllOrdersAdminQuery,
  useSearchOrdersByUserAdminQuery,
  useLazyDownloadOrdersPDFQuery,
  useUpdateOrderStatusMutation,
  useBulkUpdateOrderStatusMutation,
} from "@/app/redux/features/order/order.api";
import { toast } from "sonner";

const formatDateInput = (d?: Date | string) => {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

interface OrderItemAttribute {
  attributeName?: string;
  attributeLabel?: string;
  attributeValue?: string;
  name?: string;
  value?: string;
  [key: string]: unknown;
}

interface OrderItem {
  _id?: string;
  productId?: string;
  variantId?: string;
  quantity?: number;
  productName?: string;
  productSlug?: string;
  sku?: string;
  price?: number;
  images?: string[];
  unitPriceOriginal?: number | string;
  unitPriceFinal?: number | string;
  unitDiscountPct?: number | string;
  lineSubtotal?: number | string;
  lineDiscount?: number | string;
  lineTotal?: number | string;
  productDetails?: {
    name?: string;
    slug?: string;
    images?: string[];
  };
  variantDetails?: {
    sku?: string;
    attributeCombination?: Array<{
      attributeName?: string;
      attributeValue?: string;
      attributeLabel?: string;
    }>;
  };
  attributes?: OrderItemAttribute[];
  humanPricing?: Record<string, string>;
  [key: string]: unknown;
}

interface Order {
  _id: string;
  order_slug?: string;
  status?: string;
  couponCode?: string;
  createdAt?: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  userId?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  delivery?: {
    method?: string;
    division?: string;
    charge?: number;
  };
  items?: OrderItem[];
  totals?: {
    subtotal?: number;
    discountTotal?: number;
    shippingTotal?: number;
    grandTotal?: number;
  };
  humanTotals?: Record<string, string>;
  [key: string]: unknown;
}

export default function AdminAllOrdersPage() {
  const [sort, setSort] = useState<string>("-createdAt");
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const allParams = useMemo(
    () => ({
      sort,
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [sort, status, startDate, endDate]
  );

  const {
    data: allOrders,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
    refetch: refetchAll,
  } = useGetAllOrdersAdminQuery(allParams);
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
    refetch: refetchSearch,
  } = useSearchOrdersByUserAdminQuery(
    { searchTerm, sort, status: status || undefined },
    { skip: !isSearching || !searchTerm.trim() }
  );

  const [downloadPDF, { isLoading: isDownloadingPDF }] =
    useLazyDownloadOrdersPDFQuery();
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();
  const [bulkUpdateStatus, { isLoading: isBulkUpdating }] =
    useBulkUpdateOrderStatusMutation();

  useEffect(() => {
    if (isSearching) {
      refetchSearch();
    } else {
      refetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, startDate, endDate, searchTerm, sort]);

  const orders = isSearching ? searchData?.items ?? [] : allOrders?.items ?? [];

  const refresh = () => {
    if (isSearching) {
      refetchSearch();
    } else {
      refetchAll();
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      const res = await bulkUpdateStatus({
        orderIds: Array.from(selectedOrders),
        status: newStatus,
      }).unwrap();
      toast.success(res.message);
      setSelectedOrders(new Set());
      setIsBulkMode(false);
      refresh();
    } catch (error: any) {
      const errorMsg =
        error?.data?.message ||
        (error?.data?.errors?.length > 0
          ? `${error.data.message}: ${error.data.errors
              .map((e: any) => e.message)
              .join(", ")}`
          : "Failed to update orders");
      toast.error(errorMsg);
    }
  };

  const toggleAllOrders = (checked: boolean) => {
    if (checked) {
      const allIds = orders.map((o: any) => o._id);
      setSelectedOrders(new Set(allIds));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const toggleOrderSelection = (orderId: string, checked: boolean) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (checked) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status?: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "approved":
        return "bg-blue-50 text-blue-700";
      case "hold":
        return "bg-orange-50 text-orange-700";
      case "cancel":
        return "bg-red-50 text-red-700";
      case "sent_with_pathao":
        return "bg-orange-100 text-orange-700";
      case "sent_with_steadfast":
        return "bg-cyan-100 text-cyan-700";
      case "delivered":
        return "bg-green-50 text-green-700";
      case "return_pending":
        return "bg-rose-50 text-rose-700";
      case "returned":
        return "bg-gray-50 text-gray-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getAllowedTransitions = (currentStatus?: string): string[] => {
    const status = (currentStatus || "").toLowerCase();
    const allowedTransitions: Record<string, string[]> = {
      pending: ["approved", "hold", "cancel"],
      approved: [
        "sent_with_pathao",
        "sent_with_steadfast",
        "hold",
        "cancel",
      ],
      hold: ["approved", "cancel"],
      sent_with_pathao: ["delivered", "return_pending"],
      sent_with_steadfast: ["delivered", "return_pending"],
      delivered: [],
      cancel: [],
      return_pending: ["returned", "delivered"],
      returned: [],
    };
    return allowedTransitions[status] || [];
  };

  const getStatusOptionsForOrder = (currentStatus?: string) => {
    const allowed = getAllowedTransitions(currentStatus);
    const allStatuses = [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "hold", label: "Hold" },
      { value: "cancel", label: "Cancel" },
      { value: "sent_with_pathao", label: "Send with Pathao" },
      { value: "sent_with_steadfast", label: "Send with Steadfast" },
      { value: "delivered", label: "Delivered" },
      { value: "return_pending", label: "Return Pending" },
      { value: "returned", label: "Returned" },
    ];
    return allStatuses.filter((status) => allowed.includes(status.value));
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus({
        orderId,
        status: newStatus,
      }).unwrap();
      refresh();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update order status");
    }
  };

  const handleDownloadPDF = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start date and end date to download PDF");
      return;
    }

    try {
      const result = await downloadPDF({
        startDate,
        endDate,
        sort,
        status: status || undefined,
      }).unwrap();

      // Create a blob URL and trigger download
      const blob = new Blob([result], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders_${startDate}_to_${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : error && typeof error === "object" && "message" in error
          ? (error as { message?: string }).message
          : undefined;
      toast.error(errorMessage || "Failed to download PDF");
    }
  };

  const selectedOrderObjects = orders.filter((o: Order) =>
    selectedOrders.has(o._id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">All Orders</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by user name, email, phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={() => setIsSearching(true)}
            disabled={!searchTerm.trim()}
          >
            Search
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setIsSearching(false);
              setSearchTerm("");
            }}
          >
            Clear
          </Button>
          <Button variant="outline" onClick={refresh}>
            Refresh
          </Button>
          <Button
            variant="default"
            onClick={handleDownloadPDF}
            disabled={!startDate || !endDate || isDownloadingPDF}
          >
            {isDownloadingPDF ? "Downloading..." : "Download PDF"}
          </Button>
          <Button
            variant={isBulkMode ? "destructive" : "secondary"}
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              setSelectedOrders(new Set());
            }}
          >
            {isBulkMode ? "Cancel Bulk Update" : "Bulk Update"}
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "hold", label: "Hold" },
              { value: "cancel", label: "Cancel" },
              { value: "sent_with_pathao", label: "Send with Pathao" },
              { value: "sent_with_steadfast", label: "Send with Steadfast" },
              { value: "delivered", label: "Delivered" },
              { value: "return_pending", label: "Return Pending" },
              { value: "returned", label: "Returned" },
            ].map((tab) => (
              <Button
                key={tab.value}
                variant={status === tab.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(tab.value)}
                className={
                  status === tab.value
                    ? "bg-primary text-primary-foreground"
                    : ""
                }
              >
                {tab.label}
              </Button>
            ))}
          </div>
           {isBulkMode && selectedOrderObjects.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t mt-2">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                Apply to {selectedOrderObjects.length} orders:
              </span>
              {(() => {
                const allowedTransitionsPerOrder = selectedOrderObjects.map(
                  (o: any) => getAllowedTransitions(o.status)
                );

                const commonTransitions = allowedTransitionsPerOrder.reduce(
                  (acc: string[], transitions: string[]) =>
                    acc.filter((t: string) => transitions.includes(t)),
                  allowedTransitionsPerOrder[0] || []
                );

                const options = [
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "hold", label: "Hold" },
                  { value: "cancel", label: "Cancel" },
                  { value: "sent_with_pathao", label: "Send with Pathao" },
                  { value: "sent_with_steadfast", label: "Send with Steadfast" },
                  { value: "delivered", label: "Delivered" },
                  { value: "return_pending", label: "Return Pending" },
                  { value: "returned", label: "Returned" },
                ].filter((s) => commonTransitions.includes(s.value));

                if (options.length === 0) {
                  return (
                    <span className="text-sm text-amber-600 italic">
                      No common status transitions available for selected orders.
                    </span>
                  );
                }

                return options.map((s) => (
                  <Button
                    key={s.value}
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                    disabled={isBulkUpdating}
                    onClick={() => handleBulkStatusChange(s.value)}
                  >
                    {s.label}
                  </Button>
                ));
              })()}
            </div>
          )}
          {isBulkMode && selectedOrderObjects.length === 0 && selectedOrders.size > 0 && (
             <div className="flex items-center gap-2 pt-2 border-t mt-2">
               <span className="text-sm text-muted-foreground italic">
                 {selectedOrders.size} orders selected on other tabs/pages. 
                 Switch to the corresponding tab to update them.
               </span>
             </div>
          )}
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">
                Start date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={formatDateInput(new Date())}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">End date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={formatDateInput(new Date())}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Sort</label>
              <select
                className="w-full border rounded-md h-9 px-2"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="-createdAt">Newest</option>
                <option value="createdAt">Oldest</option>
              </select>
            </div>
          </div>

          <div className="text-xs md:text-sm my-4">
            <p className="mb-2">Showing</p>
            <span className="font-semibold text-3xl">{orders.length}</span>{" "}
            {orders.length === 1 ? "order" : "orders"}
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto shadow-none border-none">
        <div className="min-w-[900px]">
          {(isLoadingAll ||
            isFetchingAll ||
            isLoadingSearch ||
            isFetchingSearch) && (
            <div className="px-4 py-3 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          )}
          {!orders?.length &&
            !(
              isLoadingAll ||
              isFetchingAll ||
              isLoadingSearch ||
              isFetchingSearch
            ) && (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                No orders found.
              </div>
            )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {isBulkMode && (
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            checked={
                              orders.length > 0 &&
                              selectedOrders.size === orders.length
                            }
                            onChange={(e) =>
                              toggleAllOrders(e.target.checked)
                            }
                          />
                        </th>
                      )}
                      <th className="text-left px-4 py-3 text-sm font-semibold">
                        Order ID
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">
                        Customer
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">
                        Grand Total
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.map((o: Order, idx: number) => {
                      const isExpanded = expandedOrders.has(o._id);
                      const customerName =
                        o?.customer?.fullName || o?.userId?.name || "-";
                      const grandTotal =
                        o?.humanTotals?.["grand total"] ||
                        `৳ ${o?.totals?.grandTotal ?? 0}`;
                      const orderDate = o.createdAt
                        ? new Date(o.createdAt).toLocaleString()
                        : "-";

                      return (
                        <React.Fragment key={o._id}>
                          <tr
                            className={`border-b transition-colors ${
                              idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                            } hover:bg-muted/20 ${
                              selectedOrders.has(o._id) ? "bg-primary/5" : ""
                            }`}
                          >
                            {isBulkMode && (
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                  checked={selectedOrders.has(o._id)}
                                  onChange={(e) =>
                                    toggleOrderSelection(o._id, e.target.checked)
                                  }
                                />
                              </td>
                            )}
                            <td className="px-4 py-3">
                              <div className="font-semibold">
                                {o.order_slug || `Order ${idx + 1}`}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{customerName}</div>
                              <div className="text-xs text-muted-foreground">
                                {o?.customer?.email || o?.userId?.email || ""}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getStatusColor(
                                  o.status
                                )}`}
                              >
                                {o.status || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold">{grandTotal}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-muted-foreground">
                                {orderDate}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const allowedOptions =
                                    getStatusOptionsForOrder(o.status);
                                  const isFinalState =
                                    allowedOptions.length === 0;

                                  return (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 text-xs"
                                          disabled={
                                            isUpdatingStatus || isFinalState
                                          }
                                        >
                                          {isFinalState
                                            ? "Final State"
                                            : "Change Status"}
                                        </Button>
                                      </DropdownMenuTrigger>
                                      {!isFinalState && (
                                        <DropdownMenuContent align="end">
                                          {allowedOptions.length > 0 ? (
                                            allowedOptions.map((option) => (
                                              <DropdownMenuItem
                                                key={option.value}
                                                onClick={() =>
                                                  handleStatusChange(
                                                    o._id,
                                                    option.value
                                                  )
                                                }
                                                disabled={isUpdatingStatus}
                                              >
                                                {option.label}
                                              </DropdownMenuItem>
                                            ))
                                          ) : (
                                            <DropdownMenuItem disabled>
                                              No available transitions
                                            </DropdownMenuItem>
                                          )}
                                        </DropdownMenuContent>
                                      )}
                                    </DropdownMenu>
                                  );
                                })()}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => toggleOrder(o._id)}
                                >
                                  <ChevronDown
                                    className={`h-4 w-4 transition-transform ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td
                                colSpan={isBulkMode ? 7 : 6}
                                className="px-0"
                              >
                                <div
                                  className={`rounded-md border-t overflow-hidden ${
                                    idx % 2 === 0
                                      ? "bg-background"
                                      : "bg-muted/10"
                                  }`}
                                >
                                  {/* Header */}
                                  <div
                                    className={`flex items-center justify-between px-4 py-3 ${
                                      idx % 2 === 0
                                        ? "bg-muted/10"
                                        : "bg-muted/10"
                                    }`}
                                  >
                                    <div className="flex items-center flex-wrap gap-2">
                                      <span className="text-lg md:text-xl font-extrabold tracking-tight">
                                        Order {idx + 1}
                                      </span>
                                      <div className="font-semibold tracking-wide">
                                        {o.order_slug}
                                      </div>
                                      <span
                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getStatusColor(
                                          o.status
                                        )}`}
                                      >
                                        {o.status}
                                      </span>
                                      {o?.couponCode ? (
                                        <Badge variant="secondary">
                                          Coupon used
                                          {typeof o.couponCode === "string" &&
                                          o.couponCode.trim()
                                            ? `: ${o.couponCode}`
                                            : ""}
                                        </Badge>
                                      ) : null}
                                      {o?.delivery?.method ? (
                                        <Badge variant="outline">
                                          {o.delivery.method}
                                          {o?.delivery?.division
                                            ? ` • ${o.delivery.division}`
                                            : ""}
                                        </Badge>
                                      ) : null}
                                      <Badge variant="outline">
                                        Items:{" "}
                                        {Array.isArray(o.items)
                                          ? o.items.length
                                          : 0}
                                      </Badge>
                                    </div>
                                    {o.createdAt && (
                                      <div className="text-xs text-muted-foreground">
                                        {new Date(o.createdAt).toLocaleString()}
                                      </div>
                                    )}
                                  </div>

                                  {/* Body */}
                                  <div className="grid grid-cols-12 gap-6 px-4 py-4 text-sm">
                                    <div className="col-span-12 md:col-span-4 space-y-1.5">
                                      <div className="text-xs text-muted-foreground">
                                        Customer
                                      </div>
                                      <div className="font-medium">
                                        {o?.customer?.fullName ||
                                          o?.userId?.name ||
                                          "-"}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {o?.customer?.email ||
                                          o?.userId?.email ||
                                          "-"}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {o?.userId?.phone ||
                                          o?.customer?.phone ||
                                          "-"}
                                      </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                      <div className="text-xs text-muted-foreground">
                                        Totals
                                      </div>
                                      {o?.humanTotals ? (
                                        <div className="divide-y rounded-md border bg-background">
                                          <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-muted-foreground">
                                              Regular
                                            </span>
                                            <span className="font-medium">
                                              {o.humanTotals["regular price"]}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-muted-foreground">
                                              Product discount
                                            </span>
                                            <span>
                                              {
                                                o.humanTotals[
                                                  "total product discount"
                                                ]
                                              }
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-muted-foreground">
                                              After discount
                                            </span>
                                            <span className="font-medium">
                                              {
                                                o.humanTotals[
                                                  "after discount price"
                                                ]
                                              }
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-muted-foreground">
                                              Coupon
                                            </span>
                                            <span>
                                              {o.humanTotals["coupon discount"]}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-muted-foreground">
                                              After coupon
                                            </span>
                                            <span className="font-medium">
                                              {
                                                o.humanTotals[
                                                  "after coupon discount"
                                                ]
                                              }
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-muted-foreground">
                                              Shipping
                                            </span>
                                            <span>
                                              {o.humanTotals["shipping"]}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                                            <span className="font-medium">
                                              Grand total
                                            </span>
                                            <span className="font-semibold">
                                              {o.humanTotals["grand total"]}
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="divide-y rounded-md border bg-background">
                                          <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-muted-foreground">
                                              Subtotal
                                            </span>
                                            <span>
                                              ৳ {o?.totals?.subtotal ?? 0}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-muted-foreground">
                                              Discount
                                            </span>
                                            <span>
                                              ৳ {o?.totals?.discountTotal ?? 0}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-muted-foreground">
                                              Shipping
                                            </span>
                                            <span>
                                              ৳ {o?.totals?.shippingTotal ?? 0}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                                            <span className="font-medium">
                                              Grand total
                                            </span>
                                            <span className="font-semibold">
                                              ৳ {o?.totals?.grandTotal ?? 0}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="col-span-12 md:col-span-4 space-y-1.5">
                                      <div className="text-xs text-muted-foreground">
                                        Delivery
                                      </div>
                                      <div>
                                        Method:{" "}
                                        <span className="font-medium">
                                          {o?.delivery?.method || "-"}
                                        </span>
                                      </div>
                                      <div>
                                        Division:{" "}
                                        <span className="font-medium">
                                          {o?.delivery?.division || "-"}
                                        </span>
                                      </div>
                                      <div>
                                        Charge:{" "}
                                        <span className="font-medium">
                                          ৳ {o?.delivery?.charge ?? 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Items */}
                                  <div className="px-4 pb-4">
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                                      Items
                                    </div>
                                    {Array.isArray(o.items) &&
                                    o.items.length > 0 ? (
                                      <div className="space-y-3">
                                        {o.items.map(
                                          (it: OrderItem, itemIdx: number) => (
                                            <div
                                              key={itemIdx}
                                              className="rounded-md border bg-background p-3"
                                            >
                                              <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-12 md:col-span-5 flex gap-3 items-start">
                                                  {it.images?.[0] ||
                                                  it.productDetails
                                                    ?.images?.[0] ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                      src={
                                                        it.images?.[0] ||
                                                        it.productDetails
                                                          ?.images?.[0]
                                                      }
                                                      alt={
                                                        (typeof it.productName ===
                                                        "string"
                                                          ? it.productName
                                                          : "") ||
                                                        (typeof it
                                                          .productDetails
                                                          ?.name === "string"
                                                          ? it.productDetails
                                                              .name
                                                          : "") ||
                                                        "product"
                                                      }
                                                      className="h-12 w-12 rounded object-cover border"
                                                    />
                                                  ) : (
                                                    <div className="h-12 w-12 rounded bg-muted" />
                                                  )}
                                                  <div className="space-y-0.5">
                                                    <div className="font-medium">
                                                      {(typeof it.productName ===
                                                      "string"
                                                        ? it.productName
                                                        : "") ||
                                                        it.productDetails
                                                          ?.name ||
                                                        "Product"}
                                                    </div>
                                                    {(() => {
                                                      const skuValue = it.sku;
                                                      if (
                                                        skuValue &&
                                                        (typeof skuValue ===
                                                          "string" ||
                                                          typeof skuValue ===
                                                            "number")
                                                      ) {
                                                        return (
                                                          <div className="text-muted-foreground text-xs">
                                                            SKU:{" "}
                                                            {String(skuValue)}
                                                          </div>
                                                        );
                                                      }
                                                      return null;
                                                    })()}
                                                    <div className="text-muted-foreground text-xs">
                                                      Slug:{" "}
                                                      {(typeof it.productSlug ===
                                                      "string"
                                                        ? it.productSlug
                                                        : "") ||
                                                        (typeof it
                                                          .productDetails
                                                          ?.slug === "string"
                                                          ? it.productDetails
                                                              .slug
                                                          : "") ||
                                                        "N/A"}
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Pricing block */}
                                                <div className="col-span-12 md:col-span-4">
                                                  <div className="divide-y rounded-md border">
                                                    {it.humanPricing ? (
                                                      <>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Qty
                                                          </span>
                                                          <span className="font-medium">
                                                            {it.humanPricing[
                                                              "quantity"
                                                            ] ?? it.quantity}
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Product price
                                                          </span>
                                                          <span>
                                                            {
                                                              it.humanPricing[
                                                                "product real price"
                                                              ]
                                                            }
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Discount
                                                          </span>
                                                          <span>
                                                            {
                                                              it.humanPricing[
                                                                "discount x %"
                                                              ]
                                                            }
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            After discount unit
                                                          </span>
                                                          <span className="font-medium">
                                                            {
                                                              it.humanPricing[
                                                                "after discount product price"
                                                              ]
                                                            }
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Qty × unit = total
                                                          </span>
                                                          <span>
                                                            {
                                                              it.humanPricing[
                                                                "quantity x final unit = line total"
                                                              ]
                                                            }
                                                          </span>
                                                        </div>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Qty
                                                          </span>
                                                          <span className="font-medium">
                                                            {it.quantity}
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Unit original
                                                          </span>
                                                          <span>
                                                            ৳{" "}
                                                            {typeof it.unitPriceOriginal ===
                                                              "number" ||
                                                            typeof it.unitPriceOriginal ===
                                                              "string"
                                                              ? it.unitPriceOriginal
                                                              : it.price || 0}
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Unit final
                                                          </span>
                                                          <span className="font-medium">
                                                            ৳{" "}
                                                            {typeof it.unitPriceFinal ===
                                                              "number" ||
                                                            typeof it.unitPriceFinal ===
                                                              "string"
                                                              ? it.unitPriceFinal
                                                              : it.price || 0}
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Discount %
                                                          </span>
                                                          <span>
                                                            {typeof it.unitDiscountPct ===
                                                              "number" ||
                                                            typeof it.unitDiscountPct ===
                                                              "string"
                                                              ? it.unitDiscountPct
                                                              : 0}
                                                            %
                                                          </span>
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Line totals */}
                                                <div className="col-span-12 md:col-span-3">
                                                  <div className="divide-y rounded-md border">
                                                    {it.humanPricing ? (
                                                      <>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Regular
                                                          </span>
                                                          <span>
                                                            {
                                                              it.humanPricing[
                                                                "regular price"
                                                              ]
                                                            }
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Product discount
                                                          </span>
                                                          <span>
                                                            {
                                                              it.humanPricing[
                                                                "total product discount"
                                                              ]
                                                            }
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                                                          <span className="font-medium">
                                                            After discount
                                                          </span>
                                                          <span className="font-semibold">
                                                            {
                                                              it.humanPricing[
                                                                "after discount price"
                                                              ]
                                                            }
                                                          </span>
                                                        </div>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Line subtotal
                                                          </span>
                                                          <span>
                                                            ৳{" "}
                                                            {typeof it.lineSubtotal ===
                                                              "number" ||
                                                            typeof it.lineSubtotal ===
                                                              "string"
                                                              ? it.lineSubtotal
                                                              : 0}
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                          <span className="text-muted-foreground">
                                                            Line discount
                                                          </span>
                                                          <span>
                                                            ৳{" "}
                                                            {typeof it.lineDiscount ===
                                                              "number" ||
                                                            typeof it.lineDiscount ===
                                                              "string"
                                                              ? it.lineDiscount
                                                              : 0}
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                                                          <span className="font-medium">
                                                            Line total
                                                          </span>
                                                          <span className="font-semibold">
                                                            ৳{" "}
                                                            {typeof it.lineTotal ===
                                                              "number" ||
                                                            typeof it.lineTotal ===
                                                              "string"
                                                              ? it.lineTotal
                                                              : 0}
                                                          </span>
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Attributes */}
                                                <div className="col-span-12">
                                                  <div className="flex flex-wrap gap-1">
                                                    {Array.isArray(
                                                      it.attributes
                                                    ) &&
                                                    it.attributes.length > 0 ? (
                                                      it.attributes.map(
                                                        (
                                                          a: OrderItemAttribute,
                                                          ai: number
                                                        ) => (
                                                          <span
                                                            key={ai}
                                                            className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs"
                                                          >
                                                            {a.attributeName ||
                                                              a.attributeLabel}
                                                            :{" "}
                                                            {a.attributeLabel ||
                                                              a.attributeValue}
                                                          </span>
                                                        )
                                                      )
                                                    ) : (
                                                      <span className="text-muted-foreground text-xs">
                                                        No attributes
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-sm text-muted-foreground">
                                        No items for this order.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
        </div>
      </Card>
    </div>
  );
}

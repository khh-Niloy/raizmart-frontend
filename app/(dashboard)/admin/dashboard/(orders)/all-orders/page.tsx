"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useGetAllOrdersAdminQuery,
  useSearchOrdersByUserAdminQuery,
} from "@/app/redux/features/order/order.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const formatDateInput = (d?: Date | string) => {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function AdminAllOrdersPage() {
  const [sort, setSort] = useState<string>("-createdAt");
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

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
  console.log("allOrders", allOrders);
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
    refetch: refetchSearch,
  } = useSearchOrdersByUserAdminQuery(
    { searchTerm, sort },
    { skip: !isSearching || !searchTerm.trim() }
  );

  useEffect(() => {
    // When filters/search change, refetch current mode
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
        </div>
      </div>

      <Card className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="col-span-2 md:col-span-2">
            <label className="text-sm text-muted-foreground">Status</label>
            <select
              className="w-full border rounded-md h-9 px-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="REQUESTED">REQUESTED</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Start date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={formatDateInput(new Date())}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">End date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={formatDateInput(new Date())}
            />
          </div>
          <div>
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
      </Card>

      <Card className="p-0 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-12 px-4 py-2 text-sm font-medium bg-muted/40">
            <div className="col-span-2">Order</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Totals</div>
            <div className="col-span-2 text-right">Date</div>
          </div>
          {(isLoadingAll ||
            isFetchingAll ||
            isLoadingSearch ||
            isFetchingSearch) && (
            <div className="px-4 py-3 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
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
          {orders?.map((o: any) => (
            <div key={o._id} className="border-t">
              <div className="grid grid-cols-12 px-4 py-3 text-sm">
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{o.order_slug}</div>
                    {o?.couponCode ? (
                      <Badge variant="secondary">
                        Coupon used
                        {typeof o.couponCode === "string" && o.couponCode.trim()
                          ? `: ${o.couponCode}`
                          : ""}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="font-medium">
                    {o?.customer?.fullName || o?.userId?.name || "-"}
                  </div>
                  <div className="text-muted-foreground">
                    {o?.customer?.email || o?.userId?.email || "-"}
                  </div>
                  <div className="text-muted-foreground">
                    {o?.userId?.phone || o?.customer?.phone || "-"}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {o.status}
                  </span>
                </div>
                <div className="col-span-3">
                  <div className="font-medium">
                    ৳ {o?.totals?.grandTotal ?? 0}
                  </div>
                  <div className="text-muted-foreground">
                    Subtotal: ৳ {o?.totals?.subtotal ?? 0}
                  </div>
                  <div className="text-muted-foreground">
                    Discount: ৳ {o?.totals?.discountTotal ?? 0}
                  </div>
                  <div className="text-muted-foreground">
                    Shipping: ৳ {o?.totals?.shippingTotal ?? 0}
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground">
                    Delivery: {o?.delivery?.method || "-"}
                    {o?.delivery?.division ? ` • ${o.delivery.division}` : ""}
                    {o?.delivery?.charge != null
                      ? ` • ৳ ${o.delivery.charge}`
                      : ""}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>

              {Array.isArray(o.items) && o.items.length > 0 && (
                <div className="bg-muted/20">
                  <div className="px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Items
                  </div>
                  <div className="px-4 pb-4 space-y-3">
                    {o.items.map((it: any, idx: number) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-3 rounded-md border bg-background p-3"
                      >
                        <div className="col-span-12 md:col-span-5 flex gap-3 items-start">
                          {it.images?.[0] || it.productDetails?.images?.[0] ? (
                            <img
                              src={
                                it.images?.[0] || it.productDetails?.images?.[0]
                              }
                              alt={
                                it.productName ||
                                it.productDetails?.name ||
                                "product"
                              }
                              className="h-12 w-12 rounded object-cover border"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-muted" />
                          )}
                          <div>
                            <div className="font-medium">
                              {it.productName || it.productDetails?.name}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              SKU: {it.sku}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Slug: {it.productSlug || it.productDetails?.slug}
                            </div>
                          </div>
                        </div>

                        {/* Pricing block: prefers humanPricing if present */}
                        <div className="col-span-12 md:col-span-3 text-sm">
                          {it.humanPricing ? (
                            <div className="space-y-0.5">
                              <div>Qty: <span className="font-medium">{it.humanPricing["quantity"] ?? it.quantity}</span></div>
                              <div>Product Real Price: {it.humanPricing["product real price"]}</div>
                              <div>Discount: {it.humanPricing["discount x %"]}</div>
                              <div>After Discount Unit: <span className="font-medium">{it.humanPricing["after discount product price"]}</span></div>
                              <div>{it.humanPricing["quantity x final unit = line total"]}</div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <div>Qty: <span className="font-medium">{it.quantity}</span></div>
                              <div>Unit Original: ৳ {it.unitPriceOriginal}</div>
                              <div>Unit Final: <span className="font-medium">৳ {it.unitPriceFinal}</span></div>
                              <div>Unit Discount %: {it.unitDiscountPct ?? 0}%</div>
                            </div>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-2 text-sm">
                          {it.humanPricing ? (
                            <div className="space-y-0.5">
                              <div>Line Subtotal: {it.humanPricing["line subtotal"]}</div>
                              <div>Line Discount: {it.humanPricing["line discount"]}</div>
                              <div>Line Total: <span className="font-medium">{it.humanPricing["line total"]}</span></div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <div>Line Subtotal: ৳ {it.lineSubtotal}</div>
                              <div>Line Discount: ৳ {it.lineDiscount}</div>
                              <div>Line Total: <span className="font-medium">৳ {it.lineTotal}</span></div>
                            </div>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-2 text-xs">
                          <div className="font-medium mb-1">Attributes</div>
                          {Array.isArray(it.attributes) &&
                          it.attributes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {it.attributes.map((a: any, ai: number) => (
                                <span
                                  key={ai}
                                  className="inline-flex items-center rounded bg-muted px-2 py-0.5"
                                >
                                  {a.attributeName || a.attributeLabel}:{" "}
                                  {a.attributeLabel || a.attributeValue}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-muted-foreground">-</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useGetAllOrdersAdminQuery,
  useSearchOrdersByUserAdminQuery,
} from "@/app/redux/features/order/order.api";

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="col-span-2 md:col-span-2 space-y-1">
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
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Start date</label>
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
          {orders?.map((o: any, idx: number) => (
            <div
              key={o._id}
              className={`rounded-md border mb-4 overflow-hidden ${
                idx % 2 === 0 ? "bg-background" : "bg-muted/10"
              }`}
            >
              {/* Colored separator without extra padding */}
              {/* <div className="h-10 rounded-b-sm  w-full bg-[#02C1BE]" /> */}

              {/* Header */}
              <div 
              className={`flex items-center justify-between px-4 py-3  ${
                idx % 2 === 0 ? "bg-muted/10" : "bg-muted/10"
              }`}>
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-lg md:text-xl font-extrabold tracking-tight">
                    Order {idx + 1}
                  </span>
                  <div className="font-semibold tracking-wide">
                    {o.order_slug}
                  </div>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {o.status}
                  </span>
                  {o?.couponCode ? (
                    <Badge variant="secondary">
                      Coupon used
                      {typeof o.couponCode === "string" && o.couponCode.trim()
                        ? `: ${o.couponCode}`
                        : ""}
                    </Badge>
                  ) : null}
                  {o?.delivery?.method ? (
                    <Badge variant="outline">
                      {o.delivery.method}
                      {o?.delivery?.division ? ` • ${o.delivery.division}` : ""}
                    </Badge>
                  ) : null}
                  <Badge variant="outline">
                    Items: {Array.isArray(o.items) ? o.items.length : 0}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Body */}
              <div className="grid grid-cols-12 gap-6 px-4 py-4 text-sm">
                <div className="col-span-12 md:col-span-4 space-y-1.5">
                  <div className="text-xs text-muted-foreground">Customer</div>
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
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <div className="text-xs text-muted-foreground">Totals</div>
                  {(o as any)?.humanTotals ? (
                    <div className="divide-y rounded-md border bg-background">
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-muted-foreground">Regular</span>
                        <span className="font-medium">
                          {o.humanTotals["regular price"]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-muted-foreground">
                          Product discount
                        </span>
                        <span>{o.humanTotals["total product discount"]}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-muted-foreground">
                          After discount
                        </span>
                        <span className="font-medium">
                          {o.humanTotals["after discount price"]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-muted-foreground">Coupon</span>
                        <span>{o.humanTotals["coupon discount"]}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-muted-foreground">
                          After coupon
                        </span>
                        <span className="font-medium">
                          {o.humanTotals["after coupon discount"]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{o.humanTotals["shipping"]}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                        <span className="font-medium">Grand total</span>
                        <span className="font-semibold">
                          {o.humanTotals["grand total"]}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y rounded-md border bg-background">
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>৳ {o?.totals?.subtotal ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-muted-foreground">Discount</span>
                        <span>৳ {o?.totals?.discountTotal ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>৳ {o?.totals?.shippingTotal ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                        <span className="font-medium">Grand total</span>
                        <span className="font-semibold">
                          ৳ {o?.totals?.grandTotal ?? 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-span-12 md:col-span-4 space-y-1.5">
                  <div className="text-xs text-muted-foreground">Delivery</div>
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
                {Array.isArray(o.items) && o.items.length > 0 ? (
                  <div className="space-y-3">
                    {o.items.map((it: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-md border bg-background p-3"
                      >
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-12 md:col-span-5 flex gap-3 items-start">
                            {it.images?.[0] ||
                            it.productDetails?.images?.[0] ? (
                              <img
                                src={
                                  it.images?.[0] ||
                                  it.productDetails?.images?.[0]
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
                            <div className="space-y-0.5">
                              <div className="font-medium">
                                {it.productName || it.productDetails?.name}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                SKU: {it.sku}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Slug:{" "}
                                {it.productSlug || it.productDetails?.slug}
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
                                      {it.humanPricing["quantity"] ??
                                        it.quantity}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-muted-foreground">
                                      Product price
                                    </span>
                                    <span>
                                      {it.humanPricing["product real price"]}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-muted-foreground">
                                      Discount
                                    </span>
                                    <span>
                                      {it.humanPricing["discount x %"]}
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
                                    <span>৳ {it.unitPriceOriginal}</span>
                                  </div>
                                  <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-muted-foreground">
                                      Unit final
                                    </span>
                                    <span className="font-medium">
                                      ৳ {it.unitPriceFinal}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-muted-foreground">
                                      Discount %
                                    </span>
                                    <span>{it.unitDiscountPct ?? 0}%</span>
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
                                      {it.humanPricing["regular price"]}
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
                                      {it.humanPricing["after discount price"]}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-muted-foreground">
                                      Line subtotal
                                    </span>
                                    <span>৳ {it.lineSubtotal}</span>
                                  </div>
                                  <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-muted-foreground">
                                      Line discount
                                    </span>
                                    <span>৳ {it.lineDiscount}</span>
                                  </div>
                                  <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                                    <span className="font-medium">
                                      Line total
                                    </span>
                                    <span className="font-semibold">
                                      ৳ {it.lineTotal}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Attributes */}
                          <div className="col-span-12">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(it.attributes) &&
                              it.attributes.length > 0 ? (
                                it.attributes.map((a: any, ai: number) => (
                                  <span
                                    key={ai}
                                    className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs"
                                  >
                                    {a.attributeName || a.attributeLabel}:{" "}
                                    {a.attributeLabel || a.attributeValue}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  No attributes
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No items for this order.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

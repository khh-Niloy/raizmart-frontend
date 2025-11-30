"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetUsersOrderSummaryQuery } from "@/app/redux/features/order/order.api";

const formatCurrency = (amount?: number) => {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "৳ 0";
  return `৳ ${Math.round(amount).toLocaleString("en-US")}`;
};

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return "U";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function AdminUserOrderSummaryPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<"" | "day" | "week" | "month">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data, isLoading, isFetching, refetch } = useGetUsersOrderSummaryQuery(
    period || startDate || endDate
      ? {
          ...(period ? { period } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        }
      : undefined
  );

  const filteredUsers = useMemo(() => {
    if (!data || !search.trim()) return data ?? [];
    const term = search.trim().toLowerCase();
    return data.filter((user) => {
      const fullText = [
        user.user?.name,
        user.user?.email,
        user.user?.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fullText.includes(term);
    });
  }, [data, search]);

  const aggregateStats = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const totalSpent = filteredUsers.reduce(
      (sum, user) => sum + (user.totalSpent || 0),
      0
    );
    const totalProducts = filteredUsers.reduce(
      (sum, user) => sum + (user.orderedProducts?.length || 0),
      0
    );
    const totalOrders = filteredUsers.reduce(
      (sum, user) => sum + (user.orderHistory?.length || 0),
      0
    );
    return { totalUsers, totalSpent, totalProducts, totalOrders };
  }, [filteredUsers]);

  const isBusy = isLoading || isFetching;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">User Order Summary</h1>
          <p className="text-sm text-muted-foreground">
            View total spend per user with deduplicated product lines.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search by name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 w-40"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 w-40"
          />
          <select
            value={period}
            onChange={(e) =>
              setPeriod(
                e.target.value === ""
                  ? ""
                  : (e.target.value as "day" | "week" | "month")
              )
            }
            className="h-10 rounded-md border px-3 text-sm"
          >
            <option value="">All time</option>
            <option value="day">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Users</div>
          <div className="text-2xl font-semibold">{aggregateStats.totalUsers}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Spent</div>
          <div className="text-2xl font-semibold">
            {formatCurrency(aggregateStats.totalSpent)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Unique Products</div>
          <div className="text-2xl font-semibold">{aggregateStats.totalProducts}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Orders</div>
          <div className="text-2xl font-semibold">
            {aggregateStats.totalOrders}
          </div>
        </Card>
      </div>

      {isBusy ? (
        <Card className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full" />
          ))}
        </Card>
      ) : !filteredUsers.length ? (
        <Card className="p-6 text-sm text-muted-foreground">
          No user order data found.
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((entry) => (
            <Card key={entry.user?._id || entry.user?.email} className="p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {entry.user?.picture ? (
                      <AvatarImage src={entry.user.picture} alt={entry.user?.name || "user"} />
                    ) : null}
                    <AvatarFallback>{getInitials(entry.user?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg font-semibold">
                      {entry.user?.name || "Unnamed user"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.user?.email || "No email"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.user?.phone || "No phone"}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs text-muted-foreground">Total spent</div>
                  <div className="text-2xl font-semibold">
                    {formatCurrency(entry.totalSpent)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Unique products: {entry.orderedProducts?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Orders: {entry.orderHistory?.length || 0}
                  </div>
                </div>
              </div>

              {entry.orderHistory?.length ? (
                (() => {
                  const sortedHistory = [...entry.orderHistory].sort(
                    (a, b) =>
                      new Date(b.createdAt || "").getTime() -
                      new Date(a.createdAt || "").getTime()
                  );
                  return (
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Orders timeline
                      </div>
                      <div className="border rounded-md divide-y">
                        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/40">
                          <div className="col-span-4">Order slug</div>
                          <div className="col-span-4">Date</div>
                          <div className="col-span-4 text-right">Grand total</div>
                        </div>
                        {sortedHistory.map((order, idx) => (
                          <div
                            key={`${order.orderId}-${idx}`}
                            className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-muted-foreground/90"
                          >
                            <div className="col-span-4 font-medium text-foreground">
                              {order.orderSlug || "—"}
                            </div>
                            <div className="col-span-4">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString()
                                : "—"}
                            </div>
                            <div className="col-span-4 text-right font-semibold text-foreground">
                              {formatCurrency(order.grandTotal)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-sm text-muted-foreground">
                  No completed orders for this user yet.
                </div>
              )}

              {entry.orderedProducts?.length ? (
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Ordered products (deduplicated)
                  </div>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/40">
                      <div className="col-span-4">Product</div>
                      <div className="col-span-2">SKU</div>
                      <div className="col-span-2">Quantity</div>
                      <div className="col-span-2">Amount</div>
                      <div className="col-span-2 text-right">Per unit</div>
                    </div>
                    {entry.orderedProducts.map((product, idx) => (
                      <div
                        key={`${product.productId}-${product.sku}-${idx}`}
                        className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-t text-muted-foreground/90"
                      >
                        <div className="col-span-4 space-y-1">
                          <div className="font-medium text-foreground">
                            {product.productName || "Unnamed product"}
                          </div>
                          {product.productSlug && (
                            <div className="text-xs text-muted-foreground">
                              Slug: {product.productSlug}
                            </div>
                          )}
                          {Array.isArray(product.attributes) && product.attributes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {product.attributes.map((attr, attrIdx) => (
                                <Badge key={attrIdx} variant="secondary">
                                  {attr.attributeName || attr.attributeLabel}{" "}
                                  {attr.attributeLabel ? `: ${attr.attributeLabel}` : ""}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-span-2 text-xs break-all">
                          {product.sku || "—"}
                        </div>
                        <div className="col-span-2 font-medium">
                          × {product.totalQuantity}
                        </div>
                        <div className="col-span-2 font-semibold text-foreground">
                          {formatCurrency(product.totalAmount)}
                        </div>
                        <div className="col-span-2 text-right text-sm">
                          {product.totalQuantity
                            ? formatCurrency(product.totalAmount / product.totalQuantity)
                            : "৳ 0"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


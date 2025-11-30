"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function AdminTopCustomersPage() {
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersOrderSummaryQuery({ top: 10 });

  const customers = data ?? [];
  const isBusy = isLoading || isFetching;

  const totals = useMemo(() => {
    const totalSpent = customers.reduce((sum, user) => sum + (user.totalSpent || 0), 0);
    const totalOrders = customers.reduce(
      (sum, user) => sum + (user.orderHistory?.length || 0),
      0
    );
    return { totalSpent, totalOrders };
  }, [customers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Top 10 Customers</h1>
          <p className="text-sm text-muted-foreground">
            Based on lifetime spend across all completed orders.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Combined spend</div>
          <div className="text-2xl font-semibold">{formatCurrency(totals.totalSpent)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total orders</div>
          <div className="text-2xl font-semibold">{totals.totalOrders}</div>
        </Card>
      </div>

      {isBusy ? (
        <Card className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full" />
          ))}
        </Card>
      ) : !customers.length ? (
        <Card className="p-6 text-sm text-muted-foreground">
          No customer data available yet.
        </Card>
      ) : (
        <div className="space-y-3">
          {customers.map((entry, index) => {
            const sortedHistory = (entry.orderHistory
              ? [...entry.orderHistory]
              : []
            ).sort(
              (a, b) =>
                new Date(b.createdAt || "").getTime() -
                new Date(a.createdAt || "").getTime()
            );
            const latestOrder = sortedHistory[0];
            const earliestOrder = sortedHistory[sortedHistory.length - 1];
            const orderCount = sortedHistory.length;
            const averageSpend = orderCount
              ? entry.totalSpent / orderCount
              : 0;

            return (
              <Card key={entry.user?._id || entry.user?.email || index} className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="text-base px-3 py-1">
                    #{index + 1}
                  </Badge>
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

                <div className="grid grid-cols-2 gap-4 text-right md:text-left md:grid-cols-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Total spend</div>
                    <div className="text-xl font-semibold text-foreground">
                      {formatCurrency(entry.totalSpent)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Orders</div>
                    <div className="text-lg font-semibold text-foreground">
                      {orderCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Unique products</div>
                    <div className="text-lg font-semibold text-foreground">
                      {entry.orderedProducts?.length || 0}
                    </div>
                  </div>
                </div>
              </div>

              {orderCount ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="p-3 bg-muted/40 border-dashed">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Latest order
                    </div>
                    <div className="text-sm font-medium">
                      {latestOrder?.createdAt
                        ? new Date(latestOrder.createdAt).toLocaleString()
                        : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {latestOrder?.orderSlug || "—"}
                    </div>
                  </Card>
                  <Card className="p-3 bg-muted/40 border-dashed">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      First order
                    </div>
                    <div className="text-sm font-medium">
                      {earliestOrder?.createdAt
                        ? new Date(earliestOrder.createdAt).toLocaleString()
                        : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {earliestOrder?.orderSlug || "—"}
                    </div>
                  </Card>
                  <Card className="p-3 bg-muted/40 border-dashed">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Avg. spend / order
                    </div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(averageSpend)}
                    </div>
                  </Card>
                </div>
              ) : null}
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


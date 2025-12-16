"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ProductOrderSummary,
  useGetProductOrderSummaryQuery,
} from "@/app/redux/features/product/product.api";

const formatNumber = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return value.toLocaleString();
};

export default function ProductOrderSummaryPage() {
  const [search, setSearch] = useState("");
  // const [limit, setLimit] = useState<string>("20"); // Commented out - limit selector is disabled
  const [period, setPeriod] = useState<"" | "day" | "week" | "month">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // const numericLimit = Number(limit);
  // const queryLimit =
  //   !Number.isNaN(numericLimit) && numericLimit > 0 ? numericLimit : undefined;
  const queryLimit = undefined; // Limit selector is disabled

  const { data, isLoading, isFetching, refetch } = useGetProductOrderSummaryQuery(
    queryLimit || period || startDate || endDate || status
      ? {
          ...(queryLimit ? { limit: queryLimit } : {}),
          ...(period ? { period } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          ...(status ? { status } : {}),
        }
      : undefined
  );

  const products = useMemo(() => data ?? [], [data]);
  const isBusy = isLoading || isFetching;

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const haystack = [
        product.productName,
        product.productSlug,
        ...(product.variants || []).map((variant) => variant.sku),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [products, search]);

  const aggregates = useMemo(() => {
    const totalProducts = filteredProducts.length;
    const totalVariants = filteredProducts.reduce(
      (sum, product) => sum + (product.variants?.length || 0),
      0
    );
    const totalUnits = filteredProducts.reduce(
      (sum, product) => sum + (product.totalQuantity || 0),
      0
    );
    const uniqueCustomers = new Set<string>();
    filteredProducts.forEach((product) => {
      product.customers?.forEach((customer) => {
        const key = `${customer.email ?? ""}-${customer.phone ?? ""}-${customer.name ?? ""}`;
        uniqueCustomers.add(key);
      });
    });
    return {
      totalProducts,
      totalVariants,
      totalUnits,
      totalCustomers: uniqueCustomers.size,
    };
  }, [filteredProducts]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Product Order Summary</h1>
          <p className="text-sm text-muted-foreground">
            Track per-product demand, variant performance, and who purchased what.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search by product, slug, or SKU"
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
          {/* <select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="h-10 rounded-md border px-3 text-sm"
          >
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="50">Top 50</option>
            <option value="">All</option>
          </select> */}
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Tabs (order status filter) */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "hold", label: "Hold" },
          { value: "cancel", label: "Cancel" },
          { value: "sent_with_pathao", label: "Sent with Pathao" },
          { value: "dispatch", label: "Dispatch" },
          { value: "delivered", label: "Delivered" },
          { value: "returned", label: "Returned" },
        ].map((tab) => (
          <Button
            key={tab.value || "all"}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Products</div>
          <div className="text-2xl font-semibold">{formatNumber(aggregates.totalProducts)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pieces ordered</div>
          <div className="text-2xl font-semibold">{formatNumber(aggregates.totalUnits)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Unique customers</div>
          <div className="text-2xl font-semibold">{formatNumber(aggregates.totalCustomers)}</div>
        </Card>
      </div>

      {isBusy ? (
        <Card className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full" />
          ))}
        </Card>
      ) : !filteredProducts.length ? (
        <Card className="p-6 text-sm text-muted-foreground">
          No product order data found.
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductOrderCard key={product._id || product.productSlug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductOrderCardProps {
  product: ProductOrderSummary;
}

const ProductOrderCard = ({ product }: ProductOrderCardProps) => {
  const primaryImage = product.images?.[0];
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={product.productName || "product"}
              className="h-16 w-16 rounded-md object-cover border"
            />
          ) : (
            <div className="h-16 w-16 rounded-md bg-muted" />
          )}
          <div>
            <div className="text-lg font-semibold">{product.productName}</div>
            <div className="text-sm text-muted-foreground">
              {product.productSlug || "No slug"}
            </div>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-xs text-muted-foreground">Pieces ordered</div>
          <div className="text-2xl font-semibold">{formatNumber(product.totalQuantity)}</div>
          <div className="text-xs text-muted-foreground">
            Variants: {product.variants?.length || 0}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Ordered customers
        </div>
        {hasVariants ? (
          <div className="text-sm text-muted-foreground">
            Customers are shown under each variant below.
          </div>
        ) : product.customers?.length ? (
          <div className="flex flex-wrap gap-2">
            {product.customers.map((customer, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                <span className="font-medium">{customer.name || "Unnamed"}</span>
                {customer.email ? ` • ${customer.email}` : ""}
                {customer.phone ? ` • ${customer.phone}` : ""}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No customer data</div>
        )}
      </div>

      {product.variants?.length ? (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Variant breakdown
          </div>
          <div className="border rounded-md divide-y">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/40">
              <div className="col-span-3">SKU</div>
              <div className="col-span-3">Attributes</div>
              <div className="col-span-2 text-center">Pieces ordered</div>
              <div className="col-span-4">Customers</div>
            </div>
            {product.variants.map((variant, idx) => (
              <div
                key={`${variant.sku}-${idx}`}
                className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-muted-foreground/90"
              >
                <div className="col-span-3 font-medium text-foreground break-words">
                  {variant.sku || "—"}
                </div>
                <div className="col-span-3">
                  {variant.attributes?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {variant.attributes.map((attr, attrIdx) => {
                        const label =
                          attr.attributeName && attr.attributeLabel
                            ? `${attr.attributeName}: ${attr.attributeLabel}`
                            : attr.attributeLabel || attr.attributeName || "N/A";
                        return (
                          <Badge key={attrIdx} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No attributes</span>
                  )}
                </div>
                <div className="col-span-2 text-center font-semibold">
                  {formatNumber(variant.totalQuantity)}
                </div>
                <div className="col-span-4">
                  {variant.customers?.length ? (
                    <div className="flex flex-col gap-1">
                      {variant.customers.map((customer, cIdx) => (
                        <div
                          key={cIdx}
                          className="rounded-md border px-2 py-1 text-xs text-foreground bg-muted/40"
                        >
                          <div className="font-medium">
                            {customer.name || "Unnamed customer"}
                          </div>
                          <div className="text-[11px] text-muted-foreground space-x-2">
                            {customer.email ? (
                              <span>Email: {customer.email}</span>
                            ) : null}
                            {customer.phone ? (
                              <span>Phone: {customer.phone}</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No customers</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No variant data available.</div>
      )}
    </Card>
  );
};


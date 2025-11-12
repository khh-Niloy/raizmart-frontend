"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetCouponsQuery, useUpdateCouponMutation } from "@/app/redux/features/coupon/coupon.api";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import CountdownTimer from "@/components/ui/countdown-timer";

interface Coupon {
  id?: string;
  _id?: string;
  code?: string;
  isActive?: boolean;
  status?: string;
  discountType?: string;
  discountValue?: number;
  [key: string]: unknown;
}

export default function AllCouponsPage() {
  const { data, isFetching } = useGetCouponsQuery(undefined);
  const allCoupons: Coupon[] = React.useMemo(() => {
    if (Array.isArray(data)) return data as Coupon[];
    if (data && typeof data === 'object' && 'data' in data) {
      const dataObj = data as { data?: Coupon[] };
      return dataObj.data || [];
    }
    return [];
  }, [data]);
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  const processedExpiredCouponsRef = React.useRef<Set<string>>(new Set());

  // Check if a coupon is expired
  const isCouponExpired = React.useCallback((coupon: Coupon): boolean => {
    if (!coupon.endDate) return false;
    try {
      const endDateValue = coupon.endDate;
      // Check if endDate is a valid string or number
      if (typeof endDateValue !== 'string' && typeof endDateValue !== 'number' && !(endDateValue instanceof Date)) {
        return false;
      }
      const endDate = new Date(endDateValue);
      const now = new Date();
      return endDate < now;
    } catch {
      return false;
    }
  }, []);

  // Automatically deactivate expired coupons
  React.useEffect(() => {
    if (isFetching || allCoupons.length === 0) return;

    const deactivateExpiredCoupons = async () => {
      const expiredCoupons = allCoupons.filter((coupon: Coupon) => {
        const id = coupon.id ?? coupon._id;
        if (!id) return false;
        
        // Skip if already processed
        if (processedExpiredCouponsRef.current.has(id)) return false;
        
        // Check if coupon is expired and currently active
        const isExpired = isCouponExpired(coupon);
        const isActive = coupon.isActive !== undefined ? coupon.isActive : (coupon.status === "active");
        
        return isExpired && isActive;
      });

      // Deactivate all expired coupons
      for (const coupon of expiredCoupons) {
        const id = coupon.id ?? coupon._id;
        if (!id) continue;

        try {
          await updateCoupon({
            id,
            data: { isActive: false }
          }).unwrap();
          
          // Mark as processed to avoid duplicate calls
          processedExpiredCouponsRef.current.add(id);
        } catch (error) {
          console.error(`Failed to deactivate expired coupon ${id}:`, error);
        }
      }
    };

    // Check immediately when coupons are loaded
    deactivateExpiredCoupons();

    // Set up interval to check every 30 seconds
    const interval = setInterval(deactivateExpiredCoupons, 30000);

    return () => clearInterval(interval);
  }, [allCoupons, isFetching, isCouponExpired, updateCoupon]);

  // Reset processed coupons when data changes
  React.useEffect(() => {
    if (data) {
      processedExpiredCouponsRef.current.clear();
    }
  }, [data]);

  // Filter coupons based on selected status
  const coupons = React.useMemo(() => {
    if (statusFilter === "all") return allCoupons;
    return allCoupons.filter((coupon: Coupon) => {
      const isActive = coupon.isActive !== undefined ? coupon.isActive : (coupon.status === "active");
      return statusFilter === "active" ? isActive : !isActive;
    });
  }, [allCoupons, statusFilter]);

  const handleToggle = async (c: Coupon) => {
    try {
      const id = c.id ?? c._id;
      if (!id) {
        toast.error("Invalid coupon ID");
        return;
      }
      const currentStatus = c.isActive !== undefined ? c.isActive : (c.status === "active");
      const newStatus = !currentStatus;
      await updateCoupon({ 
        id, 
        data: { isActive: newStatus } 
      }).unwrap();
      toast.success(`Coupon ${newStatus ? "activated" : "deactivated"}`);
    } catch (e) {
      toast.error("Failed to update status");
      console.error(e);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">All Coupons</h1>
              <p className="text-gray-600 mt-1">Manage promotion codes</p>
            </div>
            <Link href="/admin/dashboard/create-coupons">
              <Button className="px-6">Create Coupon</Button>
            </Link>
          </div>

          <div className="px-6 pb-6">
            {/* Status Filter Buttons */}
            <div className="mb-6 flex items-center gap-3">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-black text-white hover:bg-black/90" : ""}
              >
                All Status
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("active")}
                className={statusFilter === "active" ? "bg-black text-white hover:bg-black/90" : ""}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("inactive")}
                className={statusFilter === "inactive" ? "bg-black text-white hover:bg-black/90" : ""}
              >
                Inactive
              </Button>
            </div>

            {isFetching ? (
              <div className="text-gray-600">Loading coupons...</div>
            ) : coupons.length === 0 ? (
              <div className="text-gray-600">No coupons found.</div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Value</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Valid</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ends In</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {coupons.map((c: Coupon) => {
                      const id = c.id ?? c._id;
                      const type = (c.discountType ?? c.type ?? "").toString().toUpperCase();
                      const isPercent = type === "PERCENT";
                      const isFreeDelivery = type === "FREE_DELIVERY";
                      const valueText = isFreeDelivery 
                        ? "Free Delivery" 
                        : isPercent 
                          ? `${c.discountValue}%` 
                          : `৳${c.discountValue}`;
                      const typeText = isFreeDelivery 
                        ? "Free Delivery" 
                        : isPercent 
                          ? "Percent" 
                          : "Fixed";
                      return (
                        <tr key={id}>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{c.code}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{typeText}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{valueText}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <div className="flex flex-col">
                              <span className="text-xs">From: {formatDate(c.startDate as string | undefined)}</span>
                              <span className="text-xs">To: {formatDate(c.endDate as string | undefined)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {c.endDate ? (
                              <div className="inline-flex">
                                <CountdownTimer endAt={c.endDate as string | Date} darkLabels />
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {(() => {
                              const isActive = c.isActive !== undefined ? c.isActive : (c.status === "active");
                              return (
                                <span className={`inline-flex px-2 py-1 rounded text-xs ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                                  {isActive ? "Active" : "Inactive"}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex justify-end items-center gap-3">
                              {/* Toggle Status Switch */}
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={c.isActive !== undefined ? c.isActive : (c.status === "active")}
                                  onCheckedChange={() => handleToggle(c)}
                                  disabled={isUpdating}
                                />
                                <Label className="text-sm text-gray-600 cursor-pointer" onClick={() => handleToggle(c)}>
                                  {c.isActive !== undefined ? (c.isActive ? "Active" : "Inactive") : (c.status === "active" ? "Active" : "Inactive")}
                                </Label>
                              </div>
                              <Link href={`/admin/dashboard/edit-coupon/${id}`} className="cursor-pointer">
                                <Button type="button" variant="outline" size="sm" className="px-3">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



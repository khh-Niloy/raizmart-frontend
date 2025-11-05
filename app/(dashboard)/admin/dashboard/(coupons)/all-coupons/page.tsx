"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDeleteCouponMutation, useGetCouponsQuery, useToggleCouponStatusMutation } from "@/app/redux/features/coupon/coupon.api";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import CountdownTimer from "@/components/ui/countdown-timer";

export default function AllCouponsPage() {
  const { data, isFetching } = useGetCouponsQuery(undefined);
  const coupons: any[] = (data?.data ?? data ?? []) as any[];
  const [toggleStatus] = useToggleCouponStatusMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const handleToggle = async (c: any) => {
    try {
      const id = c.id ?? c._id;
      await toggleStatus({ id, isActive: !c.isActive }).unwrap();
      toast.success(`Coupon ${!c.isActive ? "activated" : "deactivated"}`);
    } catch (e) {
      toast.error("Failed to update status");
      console.error(e);
    }
  };

  const handleDelete = async (c: any) => {
    try {
      const id = c.id ?? c._id;
      await deleteCoupon(id).unwrap();
      toast.success("Coupon deleted");
    } catch (e) {
      toast.error("Failed to delete coupon");
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Min Order</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {coupons.map((c: any) => {
                      const id = c.id ?? c._id;
                      const type = (c.discountType ?? c.type ?? "").toString();
                      const isPercent = type.toUpperCase() === "PERCENT";
                      const valueText = isPercent ? `${c.discountValue}%` : `৳${c.discountValue}`;
                      return (
                        <tr key={id}>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{c.code}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{isPercent ? "Percent" : "Fixed"}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{valueText}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <div className="flex flex-col">
                              <span className="text-xs">From: {formatDate(c.startDate)}</span>
                              <span className="text-xs">To: {formatDate(c.endDate)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {c.endDate ? (
                              <div className="inline-flex">
                                <CountdownTimer endAt={c.endDate} darkLabels />
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{c.minOrderAmount ?? 0}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 rounded text-xs ${c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                              {c.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggle(c)}
                              >
                                {c.isActive ? "Disable" : "Enable"}
                              </Button>
                              <Link href={`/admin/dashboard/edit-coupon/${id}`} className="cursor-pointer">
                                <Button type="button" variant="outline" size="sm" className="px-3">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(c)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
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



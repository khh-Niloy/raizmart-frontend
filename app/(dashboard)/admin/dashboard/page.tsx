"use client";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: userInfo } = useUserInfoQuery(undefined);
  const router = useRouter();
  useEffect(() => {
    if (userInfo && userInfo.role === "ADMIN") {
      router.push("/admin/dashboard/all-product");
    }
  }, [userInfo, router]);

  return <div>Dashboard</div>;
}

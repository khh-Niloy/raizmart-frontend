"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: userInfo, isLoading } = useUserInfoQuery(undefined);
  const router = useRouter();

  useEffect(() => {
    // Wait for user info to load
    if (isLoading) return;

    // If user is not authenticated or not an ADMIN, redirect to home
    if (!userInfo || userInfo.role !== "ADMIN") {
      router.push("/");
    }
  }, [userInfo, isLoading, router]);

  // Show nothing while loading or if not admin
  if (isLoading || !userInfo || userInfo.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ReduxProvider from "@/components/ReduxProvider";
import { Toaster } from "sonner";

// Split provider so hooks always see the Redux context
function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: userInfo, isLoading } = useUserInfoQuery(undefined);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!userInfo || (userInfo.role !== "ADMIN" && userInfo.role !== "MASTER_ADMIN")) {
      router.push("/");
    }
  }, [userInfo, isLoading, router]);

  if (isLoading || !userInfo || (userInfo.role !== "ADMIN" && userInfo.role !== "MASTER_ADMIN")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </ReduxProvider>
  );
}

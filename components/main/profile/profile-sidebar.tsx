"use client";

import * as React from "react";
import { User, Package, LogOut, Home, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sidebar } from "@/components/ui/sidebar";
import {
  authApi,
  useUseLogoutMutation,
} from "@/app/redux/features/auth/auth.api";
import { useAppDispatch } from "@/app/redux/hooks";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";

// Profile navigation data
const profileNavItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Account",
    url: "/profile/account",
    icon: User,
  },
  {
    title: "Orders",
    url: "/profile/orders",
    icon: Package,
  },

  {
    title: "Log Out",
    url: "#",
    icon: LogOut,
  },
];

export function ProfileSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const [logout, { isLoading }] = useUseLogoutMutation();
  const dispatch = useAppDispatch();
  const { data: userInfo } = useUserInfoQuery(undefined);
  // console.log(data?.data?.email)

  const handleLogout = async () => {
    const res = await logout(undefined);
    if (res.data.success) {
      toast.success("Logged out successfully");
      router.push("/");
      dispatch(authApi.util.resetApiState());
    } else {
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="flex flex-col gap-4" {...props}>
      <div className="rounded-3xl border border-[#02C1BE]/10 bg-[#f4fffd] p-5 shadow-[0_20px_60px_-50px_rgba(5,150,145,0.5)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE]">Profile</p>
            <p className="mt-1 text-sm font-medium text-slate-600">Manage everything about your account</p>
          </div>
          <button
            onClick={() => router.back()}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#02C1BE]/20 text-[#02C1BE] transition hover:bg-[#02C1BE]/10 lg:flex"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {profileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;

          if (item.title === "Log Out") {
            if (!userInfo) return null;
            return (
              <button
                key={item.title}
                onClick={handleLogout}
                disabled={isLoading}
                className={`group flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-500 shadow-[0_18px_40px_-30px_rgba(5,150,145,0.35)] transition hover:-translate-y-0.5 hover:text-[#d33] ${
                  isLoading ? "opacity-50" : ""
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {isLoading ? "Logging out..." : item.title}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.url}
              className={`group flex items-center justify-between gap-3 rounded-2xl border border-white/60 px-4 py-3 text-sm font-semibold shadow-[0_18px_40px_-30px_rgba(5,150,145,0.35)] transition hover:-translate-y-0.5 ${
                isActive
                  ? "bg-gradient-to-r from-[#02c1be]/15 to-white text-[#02C1BE]"
                  : "bg-white text-slate-600 hover:text-[#02C1BE]"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-[#02C1BE]" : "text-slate-400"}`} />
                {item.title}
              </span>
              <span className={`h-2 w-2 rounded-full transition ${isActive ? "bg-[#02C1BE]" : "bg-slate-200 group-hover:bg-[#02C1BE]/50"}`} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

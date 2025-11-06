"use client";

import * as React from "react";
import { User, Package, MapPin, LogOut, Home } from "lucide-react";
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
    <div className="border border-gray-200 rounded-xl">
      {/* Navigation Items */}
      <div className="p-4 space-y-1">
        {profileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;

          // Handle logout separately
          if (item.title === "Log Out") {
            if (!userInfo) return null;
            return (
              <button
                key={item.title}
                onClick={handleLogout}
                disabled={isLoading}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 w-full text-left cursor-pointer ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">
                  {isLoading ? "Logging out..." : item.title}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.url}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 ${
                isActive
                  ? "bg-custom/10 text-custom"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? "text-custom" : "text-gray-400"
                }`}
              />
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

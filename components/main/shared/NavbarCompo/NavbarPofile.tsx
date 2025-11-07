import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import { User } from "lucide-react";
import React from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function NavbarPofile() {
  const { data: userInfo } = useUserInfoQuery(undefined);
  // console.log(userInfo);

  if (!userInfo) {
    return (
      <AuthModal>
        <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200 font-medium cursor-pointer lg:flex-row lg:gap-2">
          <User className="h-5 w-5" />
          <span className="text-xs lg:text-sm">Sign In</span>
        </button>
      </AuthModal>
    );
  }

  return (
    <Link href="/profile" className="cursor-pointer">
      <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200 font-medium cursor-pointer lg:flex-row lg:gap-2">
        <User className="h-5 w-5" />
        <span className="text-xs lg:text-sm">Profile</span>
      </button>
    </Link>
  );
}

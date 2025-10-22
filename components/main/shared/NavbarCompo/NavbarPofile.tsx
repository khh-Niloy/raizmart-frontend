import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import { User } from "lucide-react";
import React from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function NavbarPofile() {
  const { data: userInfo } = useUserInfoQuery(undefined);
  console.log(userInfo);

  if (!userInfo) {
    return (
      <AuthModal>
        <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200 font-medium">
          <User className="h-4 w-4" />
          <span className="text-sm">Sign In</span>
        </button>
      </AuthModal>
    );
  }

  return (
    <Link href="/profile">
      <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200 font-medium">
        <User className="h-4 w-4" />
        <span className="text-sm">Profile</span>
      </button>
    </Link>
  );
}

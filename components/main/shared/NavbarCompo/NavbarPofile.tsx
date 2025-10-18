import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import { User } from "lucide-react";
import React from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function NavbarPofile() {
  const { data: userInfo } = useUserInfoQuery(undefined);

  if (!userInfo) {
    return (
      <AuthModal>
        <button className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center border border-slate-500/50 hover:border-custom/50 hover:bg-white/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group smooth-hover">
          <User className="w-4 h-4 text-white group-hover:text-custom transition-all duration-200 group-hover:scale-110" />
        </button>
      </AuthModal>
    );
  }

  return (
    <Link href="/profile">
      <button className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center border border-slate-500/50 hover:border-custom/50 hover:bg-white/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group smooth-hover">
        <User className="w-4 h-4 text-white group-hover:text-custom transition-all duration-200 group-hover:scale-110" />
      </button>
    </Link>
  );
}

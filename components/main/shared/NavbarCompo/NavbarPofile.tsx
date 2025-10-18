import { User } from "lucide-react";
import React from "react";

export default function NavbarPofile() {
  return (
    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center border border-slate-500/50 group-hover:border-orange-500/50 transition-all duration-200">
      <User className="w-4 h-4 text-white" />
    </div>
  );
}

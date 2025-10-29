import { Heart } from "lucide-react";
import React from "react";

export default function WishList() {
  return (
    <div className="flex items-center space-x-2 p-2.5 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200 cursor-pointer">
      <Heart className="h-5 w-5" />
      <span className="hidden lg:block text-sm font-medium">Wishlist</span>
    </div>
  );
}

import { ShoppingCart } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Cart() {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-center space-x-2 p-2.5 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200 relative cursor-pointer">
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden lg:block text-sm font-medium">Cart</span>
            {/* {cartItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#02C1BE] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
          {cartItems}
        </span>
      )} */}
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

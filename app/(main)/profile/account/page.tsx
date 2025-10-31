"use client";

import React, { useState } from "react";
import { Edit } from "lucide-react";
import { useUserInfoQuery, useChangePasswordMutation } from "@/app/redux/features/auth/auth.api";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AccountPage() {
  const { data: userInfo } = useUserInfoQuery(undefined);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentPassword || !newPassword) {
        toast.error("Please fill in both fields");
        return;
      }
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setOpen(false);
    } catch (error: any) {
      const message = error?.data?.message || "Failed to update password";
      toast.error(message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Account Details
      </h1>

      <div className="space-y-6">
        {/* Name */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 mb-1 block">
              Name
            </label>
            <p className="text-gray-900 font-medium">
              {userInfo?.name || "Hasib Hossain Niloy"}
            </p>
          </div>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2 cursor-pointer">
            <Edit className="w-4 h-4" />
            <span className="text-sm font-medium">Change</span>
          </button>
        </div>

        {/* Email Address */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 mb-1 block">
              Email Address
            </label>
            <p className="text-gray-900 font-medium">
              {userInfo?.email || "khhniloy0@gmail.com"}
            </p>
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 mb-1 block">
              Phone Number
            </label>
            <p className="text-gray-900 font-medium">
              {userInfo?.phone || "Not provided"}
            </p>
          </div>
        </div>

        {/* Current Password */}
        <div className="flex items-center justify-between py-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 mb-1 block">
              Current Password
            </label>
            <p className="text-gray-900 font-medium">••••••••</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2 cursor-pointer">
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Change</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Submit"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

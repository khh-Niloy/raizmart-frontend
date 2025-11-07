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
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE]">Profile</p>
        <h1 className="text-3xl font-bold text-slate-900">Account Details</h1>
        <p className="text-sm text-slate-500">
          Update your personal information and keep your security preferences up to date.
        </p>
      </header>

      <div className="grid gap-6">
        <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Name</p>
              <p className="text-lg font-semibold text-slate-900">{userInfo?.name || "Hasib Hossain Niloy"}</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#02C1BE]/30 hover:text-[#02C1BE]">
              <Edit className="h-4 w-4" />
              Edit
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE]">Email</p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {userInfo?.email || "khhniloy0@gmail.com"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Phone</p>
              <p className="mt-2 text-sm font-medium text-slate-600">
                {userInfo?.phone || "Not provided"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Password</p>
              <p className="text-sm font-medium text-slate-700">••••••••</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-full border border-[#02C1BE]/20 bg-[#02C1BE]/10 px-5 py-2 text-sm font-semibold text-[#02C1BE] transition hover:bg-[#01b1ae]/10">
                  <Edit className="h-4 w-4" />
                  Update Password
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
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
                      {isLoading ? "Updating..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
}

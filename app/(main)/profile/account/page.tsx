"use client";

import React, { useState } from "react";
import { Edit, Plus, Mail, Phone } from "lucide-react";
import {
  useUserInfoQuery,
  useChangePasswordMutation,
  useUpdateUserMutation,
} from "@/app/redux/features/auth/auth.api";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
  
  // Edit name state
  const [nameOpen, setNameOpen] = useState(false);
  const [name, setName] = useState("");
  
  // Edit email state
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  
  // Edit phone state
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phone, setPhone] = useState("");
  
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

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
    } catch (error: unknown) {
      const errorData = error as {
        data?: { message?: string };
        message?: string;
      };
      const message =
        errorData?.data?.message ||
        errorData?.message ||
        "Failed to update password";
      toast.error(message);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!name.trim()) {
        toast.error("Please enter a name");
        return;
      }
      await updateUser({ name: name.trim() }).unwrap();
      toast.success("Name updated successfully");
      setName("");
      setNameOpen(false);
    } catch (error: unknown) {
      const errorData = error as {
        data?: { message?: string };
        message?: string;
      };
      const message =
        errorData?.data?.message ||
        errorData?.message ||
        "Failed to update name";
      toast.error(message);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email.trim()) {
        toast.error("Please enter an email");
        return;
      }
      await updateUser({ email: email.trim() }).unwrap();
      toast.success("Email updated successfully");
      setEmail("");
      setEmailOpen(false);
    } catch (error: unknown) {
      const errorData = error as {
        data?: { message?: string };
        message?: string;
      };
      const message =
        errorData?.data?.message ||
        errorData?.message ||
        "Failed to update email";
      toast.error(message);
    }
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!phone.trim()) {
        toast.error("Please enter a phone number");
        return;
      }
      await updateUser({ phone: phone.trim() }).unwrap();
      toast.success("Phone updated successfully");
      setPhone("");
      setPhoneOpen(false);
    } catch (error: unknown) {
      const errorData = error as {
        data?: { message?: string };
        message?: string;
      };
      const message =
        errorData?.data?.message ||
        errorData?.message ||
        "Failed to update phone";
      toast.error(message);
    }
  };

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE]">
          Profile
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Account Details</h1>
        <p className="text-sm text-slate-500">
          Update your personal information and keep your security preferences up
          to date.
        </p>
      </header>

      <div className="grid gap-6">
        <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Name</p>
              <p className="text-lg font-semibold text-slate-900">
                {userInfo?.name || "update your name"}
              </p>
            </div>
            <Dialog open={nameOpen} onOpenChange={setNameOpen}>
              <DialogTrigger asChild>
                <button 
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#02C1BE]/30 hover:text-[#02C1BE]"
                  onClick={() => setName(userInfo?.name || "")}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    Update Name
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500">
                    Enter your new name
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateName} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="rounded-xl border-slate-200 focus:border-[#02C1BE] focus:ring-[#02C1BE]/20"
                      required
                    />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNameOpen(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-xl bg-[#02C1BE] text-white hover:bg-[#01b1ae]"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Email Section */}
            {userInfo?.email ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE]">
                      Email
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {userInfo?.email}
                    </p>
                  </div>
                  <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="ml-2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#02C1BE]"
                        onClick={() => setEmail(userInfo?.email || "")}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                          Update Email
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                          Enter your new email address
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateEmail} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="rounded-xl border-slate-200 focus:border-[#02C1BE] focus:ring-[#02C1BE]/20"
                            required
                          />
                        </div>
                        <DialogFooter className="gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEmailOpen(false)}
                            className="rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="rounded-xl bg-[#02C1BE] text-white hover:bg-[#01b1ae]"
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Updating..." : "Save Changes"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#02C1BE]/10 p-2">
                      <Mail className="h-4 w-4 text-[#02C1BE]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                        Email
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        Not added yet
                      </p>
                    </div>
                  </div>
                  <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#02C1BE]/20 bg-[#02C1BE]/10 px-3 py-1.5 text-xs font-semibold text-[#02C1BE] transition hover:bg-[#01b1ae]/10"
                        onClick={() => setEmail("")}
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                          Add Email Address
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                          Add your email address to your account
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateEmail} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="rounded-xl border-slate-200 focus:border-[#02C1BE] focus:ring-[#02C1BE]/20"
                            required
                          />
                        </div>
                        <DialogFooter className="gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEmailOpen(false)}
                            className="rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="rounded-xl bg-[#02C1BE] text-white hover:bg-[#01b1ae]"
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Adding..." : "Add Email"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}

            {/* Phone Section */}
            {userInfo?.phone ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#02C1BE]">
                      Phone
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {userInfo?.phone}
                    </p>
                  </div>
                  <Dialog open={phoneOpen} onOpenChange={setPhoneOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="ml-2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#02C1BE]"
                        onClick={() => setPhone(userInfo?.phone || "")}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                          Update Phone Number
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                          Enter your new phone number
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdatePhone} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            className="rounded-xl border-slate-200 focus:border-[#02C1BE] focus:ring-[#02C1BE]/20"
                            required
                          />
                        </div>
                        <DialogFooter className="gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPhoneOpen(false)}
                            className="rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="rounded-xl bg-[#02C1BE] text-white hover:bg-[#01b1ae]"
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Updating..." : "Save Changes"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#02C1BE]/10 p-2">
                      <Phone className="h-4 w-4 text-[#02C1BE]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                        Phone
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        Not added yet
                      </p>
                    </div>
                  </div>
                  <Dialog open={phoneOpen} onOpenChange={setPhoneOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#02C1BE]/20 bg-[#02C1BE]/10 px-3 py-1.5 text-xs font-semibold text-[#02C1BE] transition hover:bg-[#01b1ae]/10"
                        onClick={() => setPhone("")}
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                          Add Phone Number
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                          Add your phone number to your account
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdatePhone} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            className="rounded-xl border-slate-200 focus:border-[#02C1BE] focus:ring-[#02C1BE]/20"
                            required
                          />
                        </div>
                        <DialogFooter className="gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPhoneOpen(false)}
                            className="rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="rounded-xl bg-[#02C1BE] text-white hover:bg-[#01b1ae]"
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Adding..." : "Add Phone"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
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
              <DialogContent className="max-w-md rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    Change Password
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500">
                    Enter your current password and choose a new one
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-semibold text-slate-700">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="rounded-xl border-slate-200 focus:border-[#02C1BE] focus:ring-[#02C1BE]/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="rounded-xl border-slate-200 focus:border-[#02C1BE] focus:ring-[#02C1BE]/20"
                      required
                    />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-xl bg-[#02C1BE] text-white hover:bg-[#01b1ae]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Updating..." : "Save Changes"}
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

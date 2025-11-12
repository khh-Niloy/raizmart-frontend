"use client";

import React, { useState } from "react";
import {
  useGetAllAdminsQuery,
  useCreateAdminMutation,
  useUpdateRoleMutation,
} from "@/app/redux/features/auth/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, User, Mail, Phone, Shield, UserX } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateAdminFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export default function AllAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [adminToUpdate, setAdminToUpdate] = useState<AdminUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAdminFormData>();

  const {
    data: adminsData,
    isLoading,
    refetch,
  } = useGetAllAdminsQuery(undefined);
  console.log("adminsData", adminsData);

  // Ensure admins is always an array
  const admins: AdminUser[] = Array.isArray(adminsData) ? adminsData : [];

  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  // Filter admins based on search
  const filteredAdmins = admins.filter((admin: AdminUser) => {
    if (!admin) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.name?.toLowerCase().includes(searchLower) ||
      admin.email?.toLowerCase().includes(searchLower) ||
      (admin.phone && admin.phone.toLowerCase().includes(searchLower))
    );
  });

  const handleOpenConfirm = (admin: AdminUser) => {
    setAdminToUpdate(admin);
    setIsConfirmOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!adminToUpdate) return;
    
    try {
      await updateRole({
        email: adminToUpdate.email,
        role: "USER",
      }).unwrap();
      toast.success("User role updated to USER successfully");
      setIsConfirmOpen(false);
      setAdminToUpdate(null);
      refetch();
    } catch (error: unknown) {
      console.log("error", error);
      const errorMessage = 
        (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data && typeof error.data.message === 'string')
          ? error.data.message
          : (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string')
          ? error.message
          : "Failed to update role";
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (data: CreateAdminFormData) => {
    try {
      // Check if user already exists in the admin list by email
      const existingAdmin = admins.find(
        (admin: AdminUser) => admin.email.toLowerCase() === data.email.toLowerCase()
      );

      if (existingAdmin) {
        // User exists, update their role to ADMIN
        await updateRole({
          email: data.email,
          role: "ADMIN",
        }).unwrap();
        toast.success("User role updated to ADMIN successfully");
      } else {
        // User doesn't exist, create new admin
        await createAdmin({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone || undefined,
        }).unwrap();
        toast.success("Admin created successfully");
      }

      // Reset form and close modal
      reset();
      setIsModalOpen(false);
      // Refetch admins list
      refetch();
    } catch (error: unknown) {
      const errorMessage = 
        (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data && typeof error.data.message === 'string')
          ? error.data.message
          : (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string')
          ? error.message
          : "Failed to create/update admin";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading admins...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Admins</h1>
              <p className="text-gray-600 mt-1">
                Manage admin users ({filteredAdmins.length} admins)
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Admin
            </Button>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search admins by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Admins Table */}
          {filteredAdmins.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Admins Found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? "No admins match your search criteria."
                    : "Get started by adding your first admin."}
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Admin Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Phone
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Created At
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins.map((admin: AdminUser, index: number) => (
                        <tr
                          key={admin._id}
                          className={`border-b border-gray-100 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-gray-100 transition-colors`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {admin.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700">{admin.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700">
                                {admin.phone || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                              <Shield className="h-3 w-3 mr-1" />
                              {admin.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {admin.createdAt
                              ? new Date(admin.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenConfirm(admin)}
                              disabled={isUpdating}
                              className="flex items-center gap-2"
                            >
                              <UserX className="h-4 w-4" />
                              Remove Admin
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Admin Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Admin</DialogTitle>
                <DialogDescription>
                  Create a new admin user or update an existing user&apos;s role to
                  ADMIN.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Name *
                  </label>
                  <Input
                    {...register("name", { required: "Name is required" })}
                    placeholder="Enter full name"
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Email *
                  </label>
                  <Input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    placeholder="Enter email address"
                    className="w-full"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Password *
                  </label>
                  <div className="relative">
                    <Input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Phone Number
                  </label>
                  <Input
                    {...register("phone")}
                    type="tel"
                    placeholder="Enter phone number (optional)"
                    className="w-full"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isCreating || isUpdating
                      ? "Processing..."
                      : "Add Admin"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Confirmation Modal for Remove Admin */}
          <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Remove Admin</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove admin privileges from this user?
                </DialogDescription>
              </DialogHeader>
              {adminToUpdate && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Name:</span> {adminToUpdate.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Email:</span> {adminToUpdate.email}
                    </p>
                    <p className="text-sm text-red-600 font-medium">
                      This will change their role from ADMIN to USER.
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsConfirmOpen(false);
                    setAdminToUpdate(null);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleUpdateRole}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Remove Admin"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}


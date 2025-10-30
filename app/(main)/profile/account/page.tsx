"use client";

import React from "react";
import { Edit } from "lucide-react";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";

export default function AccountPage() {
  const { data: userInfo } = useUserInfoQuery(undefined);

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
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2 cursor-pointer">
            <Edit className="w-4 h-4" />
            <span className="text-sm font-medium">Change</span>
          </button>
        </div>
      </div>
    </div>
  );
}

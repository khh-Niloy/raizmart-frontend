import React from "react";
import { ProfileSidebar } from "@/components/main/profile/profile-sidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white py-8 px-16">
      <div className="mx-auto">
        <div className="">
          <div className="flex gap-8 pt-10">
            {/* Left Sidebar */}
            <div className="">
              <ProfileSidebar />
            </div>
            
            {/* Right Content Area */}
            <div className="flex-1 p-8 bg-gray-50/80 rounded-xl">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

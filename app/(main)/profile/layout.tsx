import React from "react";
import { ProfileSidebar } from "@/components/main/profile/profile-sidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3fffe] via-white to-white">
      <div className="mx-auto flex mt-10 flex-col gap-6 pt-20 sm:pt-0 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:py-10 xl:gap-12">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-6 z-10 h-full shrink-0 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_30px_90px_-70px_rgba(5,150,145,0.45)] backdrop-blur">
          <ProfileSidebar />
        </aside>

        {/* Content */}
        <main className="flex-1 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_35px_110px_-80px_rgba(5,150,145,0.4)] backdrop-blur sm:p-7 lg:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}

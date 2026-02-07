"use client";

import { DashboardSidebar } from "@/modules/dashboard/components/DashboardSidebar";
import { MobileHeader } from "@/modules/dashboard/components/MobileHeader";
import { MobileSidebar } from "@/modules/dashboard/components/MobileSidebar";
import { AuthGuard } from "@/components/auth";
import { useState } from "react";

export default function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f8fafc] flex font-sans text-[#1e293b]">
        <MobileHeader
          isMenuOpen={isMobileMenuOpen}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <DashboardSidebar />

        <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

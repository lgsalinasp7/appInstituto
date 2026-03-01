"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, MessageSquare, BarChart3, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBranding } from "@/components/providers/BrandingContext";
import { getAcademyRoutesForRole } from "../config/academy-routes.config";
import type { PlatformRole } from "@prisma/client";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  "/academia/student": LayoutDashboard,
  "/academia/student/courses": BookOpen,
  "/academia/student/progress": BarChart3,
  "/academia/teacher": LayoutDashboard,
  "/academia/teacher/students": Users,
  "/academia/teacher/courses": BookOpen,
  "/academia/teacher/messages": MessageSquare,
  "/academia/admin": LayoutDashboard,
  "/academia/admin/courses": BookOpen,
  "/academia/admin/cohorts": Users,
  "/academia/admin/users": Users,
  "/academia/admin/analytics": BarChart3,
};

export function AcademiaSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const branding = useBranding();
  const platformRole = (user?.platformRole as PlatformRole) ?? null;
  const routes = getAcademyRoutesForRole(platformRole);

  return (
    <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col fixed h-full z-10 shadow-instituto-lg">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 p-1.5 bg-white rounded-xl shadow-md border border-gray-50 flex items-center justify-center">
            <Image src={branding.logoUrl || "/logo-instituto.png"} alt={branding.tenantName} width={32} height={32} className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg leading-none tracking-tighter" style={{ color: branding.primaryColor }}>
              {branding.tenantName}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Academia</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Menú</p>
        {routes.map((item) => {
          const Icon = iconMap[item.path] || LayoutDashboard;
          const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:bg-gray-50 hover:text-primary"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600">
          ← Volver al dashboard
        </Link>
      </div>
    </aside>
  );
}

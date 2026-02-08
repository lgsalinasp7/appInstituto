"use client";

/**
 * DashboardHeader Component
 * Responsive header with breadcrumbs, notifications, and user dropdown
 */

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  onFilterChange?: (advisorId?: string, programId?: string) => void;
  children?: React.ReactNode;
}

// Map routes to readable names
const routeNames: Record<string, string> = {
  "/dashboard": "Panel de Control",
  "/matriculas": "Matrículas",
  "/recaudos": "Gestión de Recaudos",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
  "/profile": "Mi Perfil",
  "/admin": "Administración",
  "/admin/users": "Usuarios",
  "/admin/config/roles": "Roles",
};

export function DashboardHeader({ title, titleHighlight, subtitle, onFilterChange, children }: DashboardHeaderProps) {
  const branding = useBranding();
  const isDark = branding.darkMode !== false;
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("all");

  const pathname = usePathname();
  const { user } = useAuthStore();

  const isVentas = user?.role?.name === "VENTAS";
  const isAdmin = user?.role?.name === "ADMINISTRADOR" || user?.role?.name === "SUPERADMIN";

  // Sync selected advisor when user is loaded (for VENTAS)
  useEffect(() => {
    if (isVentas && user?.id && selectedAdvisor === "all") {
      setSelectedAdvisor(user.id);
    }
  }, [isVentas, user?.id, selectedAdvisor]);

  useEffect(() => {
    if (onFilterChange) {
      const fetchData = async () => {
        try {
          const [advRes, progRes] = await Promise.all([
            fetch("/api/users?role=asesor"),
            fetch("/api/programs")
          ]);
          const [advData, progData] = await Promise.all([advRes.json(), progRes.json()]);
          if (advData.success) setAdvisors(advData.data.users);
          if (progData.success) setPrograms(progData.data.programs);
        } catch (error) {
          console.error("Error fetching header data:", error);
        }
      };
      fetchData();
    }
  }, [!!onFilterChange]); // Only run once on mount if onFilterChange is present

  const handleAdvisorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAdvisor(val);
    onFilterChange?.(val, selectedProgram);
  };

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProgram(val);
    onFilterChange?.(selectedAdvisor, val);
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);

    // If we're on dashboard, just show "Inicio"
    if (pathname === "/dashboard") {
      return [{ label: "Inicio", href: "/dashboard" }];
    }

    const breadcrumbs = [{ label: "Inicio", href: "/dashboard" }];

    let currentPath = "";
    paths.forEach((path) => {
      currentPath += `/${path}`;
      // Skip adding dashboard again since we already have "Inicio"
      if (currentPath === "/dashboard") return;

      const label = routeNames[currentPath] || path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();



  return (
    <header className={cn(
      "flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8 pt-4 sm:pt-6 pb-3 sm:pb-4 lg:pb-6 border-b transition-colors duration-500",
      isDark ? "border-slate-800/50" : "border-slate-200"
    )}>
      {/* Breadcrumbs and Actions Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Breadcrumbs - simplified on mobile */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
          {breadcrumbs.map((crumb, index) => (
            <div key={`breadcrumb-${index}`} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} className={isDark ? "text-slate-600" : "text-slate-400"} />}
              {index === breadcrumbs.length - 1 ? (
                <span className={cn(
                  "font-bold flex items-center gap-1 font-display tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  {index === 0 && <Home size={14} className={isDark ? "text-cyan-500" : "text-blue-600"} />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className={cn(
                    "transition-colors flex items-center gap-1 font-medium",
                    isDark ? "text-slate-500 hover:text-cyan-400" : "text-slate-400 hover:text-blue-600"
                  )}
                >
                  {index === 0 && <Home size={14} />}
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Actions - Avatar and Notifications */}
        <div className="hidden lg:flex items-center gap-2 lg:gap-4">
          {onFilterChange && isAdmin && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <select
                value={selectedAdvisor}
                onChange={handleAdvisorChange}
                disabled={isVentas}
                className={cn(
                  "text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 transition-all",
                  isDark
                    ? "border-slate-800 bg-slate-900/40 text-slate-300 focus:ring-cyan-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-600 focus:ring-blue-500/20",
                  isVentas ? 'opacity-70' : ''
                )}
              >
                <option value="all">Cualquier Asesor</option>
                {advisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select
                value={selectedProgram}
                onChange={handleProgramChange}
                className={cn(
                  "text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 transition-all",
                  isDark
                    ? "border-slate-800 bg-slate-900/40 text-slate-300 focus:ring-cyan-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-600 focus:ring-blue-500/20"
                )}
              >
                <option value="all">Cualquier Programa</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}


        </div>
      </div>

      {/* Title Section */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <h2 className={cn(
              "text-xl sm:text-2xl lg:text-4xl font-bold font-display tracking-tighter",
              isDark ? "text-white" : "text-slate-900"
            )}>
              {title} {titleHighlight && <span className="text-gradient">{titleHighlight}</span>}
            </h2>
            {subtitle && (
              <>
                <div className={cn("hidden sm:block h-8 w-px", isDark ? "bg-slate-800" : "bg-slate-200")} />
                <p className={cn(
                  "text-sm font-bold uppercase tracking-widest font-display",
                  isDark ? "text-slate-500" : "text-slate-400"
                )}>{subtitle}</p>
              </>
            )}
          </div>
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

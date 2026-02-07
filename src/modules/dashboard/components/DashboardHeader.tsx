"use client";

/**
 * DashboardHeader Component
 * Responsive header with breadcrumbs, notifications, and user dropdown
 */

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, ChevronRight, Home, User, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title?: string;
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

export function DashboardHeader({ title, subtitle, onFilterChange, children }: DashboardHeaderProps) {
  const branding = useBranding();
  const isDark = branding.darkMode !== false;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("all");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isVentas = user?.role?.name === "VENTAS";
  const isCartera = user?.role?.name === "CARTERA";
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

          {/* Notification Bell */}
          <button className={cn(
            "relative p-3 rounded-xl transition-all group active:scale-95",
            isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
          )}>
            <Bell size={20} className={cn(
              "transition-colors",
              isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-blue-600"
            )} strokeWidth={2.5} />
            <span className={cn(
              "absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-white text-[10px] font-bold shadow-lg",
              isDark ? "bg-cyan-600 border-slate-950 shadow-cyan-500/20" : "bg-blue-600 border-white shadow-blue-500/20"
            )}>
              2
            </span>
          </button>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                "flex items-center gap-3 border rounded-xl px-4 py-2.5 transition-all cursor-pointer group active:scale-95",
                isDark
                  ? "bg-slate-900/40 border-slate-800/50 hover:border-cyan-500/30"
                  : "bg-white border-slate-200 hover:border-blue-500/30"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300",
                isDark ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-gradient-to-br from-blue-500 to-blue-700"
              )}>
                <span className="text-sm font-bold font-display">{user?.name ? getInitials(user.name) : "U"}</span>
              </div>
              <div className="text-left">
                <p className={cn(
                  "text-sm font-bold transition-colors font-display tracking-tight",
                  isDark ? "text-white group-hover:text-cyan-400" : "text-slate-900 group-hover:text-blue-600"
                )}>{user?.name || "Usuario"}</p>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest font-display",
                  isDark ? "text-cyan-500/80" : "text-blue-600/80"
                )}>
                  {user?.role?.name === "SUPERADMIN" ? "Super Admin" : user?.role?.name || "Usuario"}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "text-slate-500 transition-transform duration-300",
                  isDropdownOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className={cn(
                "absolute right-0 top-full mt-2 w-56 rounded-2xl border py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl",
                isDark ? "glass-card border-white/[0.05]" : "bg-white border-slate-100 shadow-slate-200/50"
              )}>
                {/* User Info */}
                <div className={cn(
                  "px-4 py-3 border-b",
                  isDark ? "border-slate-800/50" : "border-slate-100"
                )}>
                  <p className={cn("text-sm font-bold font-display", isDark ? "text-white" : "text-slate-900")}>{user?.name || "Usuario"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || "email@example.com"}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all font-medium font-display group",
                      isDark ? "text-slate-300 hover:text-cyan-400 hover:bg-white/5" : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    )}
                  >
                    <User size={18} className="text-slate-400 group-hover:text-blue-600" />
                    <span>Mi Perfil</span>
                  </Link>
                  {(user?.role?.name === "SUPERADMIN" || user?.role?.name === "ADMINISTRADOR") && (
                    <Link
                      href="/configuracion"
                      onClick={() => setIsDropdownOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all font-medium font-display group",
                        isDark ? "text-slate-300 hover:text-cyan-400 hover:bg-white/5" : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      )}
                    >
                      <Settings size={18} className="text-slate-400" />
                      <span>Configuración</span>
                    </Link>
                  )}
                </div>

                {/* Logout */}
                <div className={cn("border-t pt-1", isDark ? "border-slate-800/50" : "border-slate-100")}>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                      window.location.href = "/auth/login";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-all font-bold font-display"
                  >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title Section */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <h2 className={cn(
              "text-xl sm:text-2xl lg:text-4xl font-bold font-display tracking-tighter",
              isDark ? "text-white" : "text-slate-900"
            )}>{title}</h2>
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

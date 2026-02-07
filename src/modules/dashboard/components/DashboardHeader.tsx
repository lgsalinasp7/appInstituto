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
    <header className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8 pt-4 sm:pt-6 pb-3 sm:pb-4 lg:pb-6 border-b border-slate-800/50">
      {/* Breadcrumbs and Actions Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Breadcrumbs - simplified on mobile */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
          {breadcrumbs.map((crumb, index) => (
            <div key={`breadcrumb-${index}`} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} className="text-slate-600" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-bold text-white flex items-center gap-1 font-display tracking-tight">
                  {index === 0 && <Home size={14} className="text-cyan-500" />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium"
                >
                  {index === 0 && <Home size={14} />}
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Actions - Avatar and Notifications - Hidden on mobile (MobileHeader handles this) */}
        <div className="hidden lg:flex items-center gap-2 lg:gap-4">
          {onFilterChange && isAdmin && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <select
                value={selectedAdvisor}
                onChange={handleAdvisorChange}
                disabled={isVentas}
                className={`text-xs border border-slate-800 bg-slate-900/40 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all ${isVentas ? 'opacity-70' : ''}`}
              >
                <option value="all">Cualquier Asesor</option>
                {advisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select
                value={selectedProgram}
                onChange={handleProgramChange}
                className="text-xs border border-slate-800 bg-slate-900/40 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
              >
                <option value="all">Cualquier Programa</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {/* Notification Bell */}
          <button className="relative p-3 hover:bg-white/5 rounded-xl transition-all group active:scale-95">
            <Bell size={20} className="text-slate-400 group-hover:text-cyan-400 transition-colors" strokeWidth={2.5} />
            <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-cyan-600 rounded-full border-2 border-slate-950 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-cyan-500/20">
              2
            </span>
          </button>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-slate-900/40 border border-slate-800/50 rounded-xl px-4 py-2.5 hover:border-cyan-500/30 transition-all cursor-pointer group active:scale-95"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-sm font-bold font-display">{user?.name ? getInitials(user.name) : "U"}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors font-display tracking-tight">{user?.name || "Usuario"}</p>
                <p className="text-[10px] text-cyan-500/80 font-bold uppercase tracking-widest font-display">
                  {user?.role?.name === "SUPERADMIN" ? "Super Admin" : user?.role?.name || "Usuario"}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-2xl border border-white/[0.05] py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-800/50">
                  <p className="text-sm font-bold text-white font-display">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || "email@example.com"}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all font-medium font-display"
                  >
                    <User size={18} className="text-slate-500 group-hover:text-cyan-400" />
                    <span>Mi Perfil</span>
                  </Link>
                  {(user?.role?.name === "SUPERADMIN" || user?.role?.name === "ADMINISTRADOR") && (
                    <Link
                      href="/configuracion"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all font-medium font-display"
                    >
                      <Settings size={18} className="text-slate-500" />
                      <span>Configuración</span>
                    </Link>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t border-slate-800/50 pt-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                      window.location.href = "/auth/login";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all font-bold font-display"
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

      {/* Title Section - Only show if title is provided */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white font-display tracking-tighter">{title}</h2>
            {subtitle && (
              <>
                <div className="hidden sm:block h-8 w-px bg-slate-800" />
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest font-display">{subtitle}</p>
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

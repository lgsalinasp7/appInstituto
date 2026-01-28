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
    <header className="flex flex-col gap-4 mb-6 lg:mb-8 pb-4 lg:pb-6 border-b border-gray-200">
      {/* Breadcrumbs and Actions Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={`breadcrumb-${index}`} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-primary flex items-center gap-1">
                  {index === 0 && <Home size={14} />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home size={14} />}
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Actions - Avatar and Notifications */}
        <div className="flex items-center gap-2 lg:gap-4">
          {onFilterChange && isAdmin && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <select
                value={selectedAdvisor}
                onChange={handleAdvisorChange}
                disabled={isVentas}
                className={`text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30 ${isVentas ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
              >
                <option value="all">Cualquier Asesor</option>
                {advisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select
                value={selectedProgram}
                onChange={handleProgramChange}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="all">Cualquier Programa</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {/* Notification Bell */}
          <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-all">
            <Bell size={20} className="text-gray-500" strokeWidth={2.5} />
            <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
              2
            </span>
          </button>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-md">
                <span className="text-sm font-bold">{user?.name ? getInitials(user.name) : "U"}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-primary">{user?.name || "Usuario"}</p>
                <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">
                  {user?.role?.name === "SUPERADMIN" ? "Superadministrador" : user?.role?.name || "Usuario"}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg shadow-black/10 py-2 z-50 animate-fade-in-up">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-primary">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "email@example.com"}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <User size={18} className="text-gray-500" />
                    <span>Mi Perfil</span>
                  </Link>
                  {(user?.role?.name === "SUPERADMIN" || user?.role?.name === "ADMINISTRADOR") && (
                    <Link
                      href="/configuracion"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Settings size={18} className="text-gray-500" />
                      <span>Configuración</span>
                    </Link>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                      window.location.href = "/auth/login";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">{title}</h2>
            {subtitle && (
              <>
                <div className="hidden sm:block h-8 w-px bg-gray-300" />
                <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
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

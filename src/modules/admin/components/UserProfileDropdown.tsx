"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

export function UserProfileDropdown() {
    const branding = useBranding();
    const isDark = branding.darkMode !== false;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuthStore();

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
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
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
                <div className="flex flex-col items-end mr-1 text-right">
                    <span className={cn(
                        "text-sm font-bold transition-colors font-display tracking-tight",
                        isDark ? "text-white group-hover:text-cyan-400" : "text-slate-900 group-hover:text-blue-600"
                    )}>
                        {user?.name || "Usuario"}
                    </span>
                    <span className={cn(
                        "text-[10px] uppercase font-bold tracking-wider font-display",
                        isDark ? "text-slate-500" : "text-slate-400"
                    )}>
                        {user?.role?.name === "SUPERADMIN" ? "Super Admin" : user?.role?.name || "Usuario"}
                    </span>
                </div>

                <div
                    className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300",
                        isDark
                            ? "bg-gradient-to-br from-cyan-500 to-blue-600"
                            : "bg-gradient-to-br from-blue-500 to-blue-700"
                    )}
                >
                    <span className="text-sm font-bold font-display">
                        {user?.name ? getInitials(user.name) : "U"}
                    </span>
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
                <div
                    className={cn(
                        "absolute right-0 top-full mt-2 w-56 rounded-2xl border py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl",
                        isDark
                            ? "glass-card border-white/[0.05] bg-slate-950/90 backdrop-blur-xl"
                            : "bg-white border-slate-100 shadow-slate-200/50"
                    )}
                >
                    {/* User Info Header */}
                    <div
                        className={cn(
                            "px-4 py-3 border-b",
                            isDark ? "border-slate-800/50" : "border-slate-100"
                        )}
                    >
                        <p
                            className={cn(
                                "text-sm font-bold font-display",
                                isDark ? "text-white" : "text-slate-900"
                            )}
                        >
                            {user?.name || "Usuario"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {user?.email || "email@example.com"}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <Link
                            href="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all font-medium font-display group",
                                isDark
                                    ? "text-slate-300 hover:text-cyan-400 hover:bg-white/5"
                                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                            )}
                        >
                            <User size={18} className="text-slate-400 group-hover:text-blue-600" />
                            <span>Mi Perfil</span>
                        </Link>

                        {/* Always show configuracion as requested, or conditional based on Logic */}
                        {(user?.role?.name === "SUPERADMIN" || user?.role?.name === "ADMINISTRADOR") && (
                            <Link
                                href="/admin/configuracion"
                                onClick={() => setIsDropdownOpen(false)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all font-medium font-display group",
                                    isDark
                                        ? "text-slate-300 hover:text-cyan-400 hover:bg-white/5"
                                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                                )}
                            >
                                <Settings size={18} className="text-slate-400" />
                                <span>Configuración</span>
                            </Link>
                        )}
                    </div>

                    {/* Logout */}
                    <div
                        className={cn(
                            "border-t pt-1",
                            isDark ? "border-slate-800/50" : "border-slate-100"
                        )}
                    >
                        <button
                            onClick={() => {
                                setIsDropdownOpen(false);
                                logout();
                                // Force reload or redirect
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
    );
}

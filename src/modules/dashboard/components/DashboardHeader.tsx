"use client";

/**
 * DashboardHeader Component
 * Responsive header with title, notifications, and user dropdown
 */

import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8 pb-4 lg:pb-6 border-b border-gray-200">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">{title}</h2>
        {subtitle && (
          <>
            <div className="hidden sm:block h-8 w-px bg-gray-300" />
            <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
          </>
        )}
      </div>

      {/* Actions - Hidden on mobile (shown in MobileHeader) */}
      <div className="hidden lg:flex items-center gap-4">
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
            <div className="w-9 h-9 rounded-full bg-gradient-instituto flex items-center justify-center text-white shadow-md">
              <span className="text-sm font-bold">J</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-primary">Jhontan Gonzales</p>
              <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">
                Administrador
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
                <p className="text-sm font-bold text-primary">Jhontan Gonzales</p>
                <p className="text-xs text-gray-500">jhontan.gonzales@email.com</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // TODO: Navigate to profile
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <User size={18} className="text-gray-500" />
                  <span>Mi Perfil</span>
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // TODO: Navigate to settings
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <Settings size={18} className="text-gray-500" />
                  <span>Configuración</span>
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // TODO: Handle logout
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
    </header>
  );
}

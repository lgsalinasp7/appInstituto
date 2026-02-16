"use client";

/**
 * MobileHeader Component
 * Header responsive para dispositivos móviles y tablets
 */

import Image from "next/image";
import { Menu, Bell, X } from "lucide-react";
import { useBranding } from "@/components/providers/BrandingContext";
import { UserProfileDropdown } from "@/modules/admin/components/UserProfileDropdown";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export function MobileHeader({ isMenuOpen, onMenuToggle }: MobileHeaderProps) {
  const branding = useBranding();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src={branding.logoUrl || "/logo-instituto.png"}
              alt={branding.tenantName}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base leading-none tracking-tighter" style={{ color: branding.primaryColor }}>
              {branding.tenantName}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Gestion
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Avatar */}
          <div className="hidden sm:block">
            <UserProfileDropdown configHref="/configuracion" />
          </div>

          {/* Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? (
              <X size={24} className="text-primary" />
            ) : (
              <Menu size={24} className="text-primary" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

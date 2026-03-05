"use client";

/**
 * MobileHeader Component
 * Header responsive para dispositivos móviles y tablets.
 * En rutas /academia usa el sistema de diseño oscuro.
 */

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Bell, X } from "lucide-react";
import { useBranding } from "@/components/providers/BrandingContext";
import { UserProfileDropdown } from "@/modules/admin/components/UserProfileDropdown";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export function MobileHeader({ isMenuOpen, onMenuToggle }: MobileHeaderProps) {
  const branding = useBranding();
  const pathname = usePathname();
  const isAcademia = pathname?.startsWith("/academia");

  return (
    <header
      className={cn(
        "lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-lg shadow-sm",
        isAcademia
          ? "bg-slate-900/90 border-b border-white/[0.08]"
          : "bg-white/95 border-b border-gray-200"
      )}
    >
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border",
              isAcademia ? "bg-slate-800/80 border-white/10" : "bg-white border-gray-100"
            )}
          >
            <Image
              src={branding.logoUrl || "/logo-instituto.png"}
              alt={branding.tenantName}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span
              className={cn(
                "font-black text-base leading-none tracking-tighter",
                isAcademia ? "text-white" : ""
              )}
              style={!isAcademia ? { color: branding.primaryColor } : undefined}
            >
              {branding.tenantName}
            </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                isAcademia ? "text-slate-400" : "text-gray-400"
              )}
            >
              {isAcademia ? "Academia" : "Gestion"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={cn(
              "relative p-2.5 rounded-xl transition-colors",
              isAcademia
                ? "text-slate-400 hover:text-white hover:bg-white/5"
                : "hover:bg-gray-100 text-gray-500"
            )}
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="hidden sm:block">
            <UserProfileDropdown
              configHref="/configuracion"
              forceDark={isAcademia}
              forceLight={!isAcademia}
            />
          </div>

          <button
            onClick={onMenuToggle}
            className={cn(
              "p-2.5 rounded-xl transition-colors",
              isAcademia
                ? "text-slate-400 hover:text-white hover:bg-white/5"
                : "hover:bg-gray-100"
            )}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? (
              <X size={24} className={isAcademia ? "text-cyan-400" : "text-primary"} />
            ) : (
              <Menu size={24} className={isAcademia ? "text-cyan-400" : "text-primary"} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

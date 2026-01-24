"use client";

/**
 * MobileHeader Component
 * Header responsive para dispositivos móviles y tablets
 */

import Image from "next/image";
import { Menu, Bell, X } from "lucide-react";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export function MobileHeader({ isMenuOpen, onMenuToggle }: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src="/logo-instituto.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-[#1e3a5f] text-sm leading-tight">
              Educamos con Valores
            </span>
            <span className="text-xs text-[#64748b]">Panel de Gestión</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell size={20} className="text-[#64748b]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? (
              <X size={24} className="text-[#1e3a5f]" />
            ) : (
              <Menu size={24} className="text-[#1e3a5f]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

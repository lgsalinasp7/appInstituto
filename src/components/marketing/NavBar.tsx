"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14">
            <Image
              src="/kaledsoft-logo-transparent.png"
              alt="KaledSoft Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            KaledSoft
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="#services" className="hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg transition-colors">
            Servicios
          </Link>
          <Link href="#features" className="hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg transition-colors">
            Funcionalidades
          </Link>
          <Link href="#pricing" className="hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg transition-colors">
            Precios
          </Link>
          <Link href="#contact" className="hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg transition-colors">
            Contacto
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-white/10 transition-[background-color,color]"
          >
            <a href="https://admin.kaledsoft.tech">
              Portal Cliente
            </a>
          </Button>
          <Button
            asChild
            className="bg-cyan-600 hover:bg-cyan-500 text-white border-0 shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-[background-color,transform,shadow]"
          >
            <Link href="#contact">
              Cotizar Proyecto
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-slate-950 border-b border-white/10 py-6 px-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <Link href="#services" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-gray-300 hover:text-cyan-400">
            Servicios
          </Link>
          <Link href="#features" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-gray-300 hover:text-cyan-400">
            Funcionalidades
          </Link>
          <Link href="#pricing" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-gray-300 hover:text-cyan-400">
            Precios
          </Link>
          <Link href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-gray-300 hover:text-cyan-400">
            Contacto
          </Link>
          <div className="pt-4 border-t border-white/10 space-y-4">
            <a href="https://admin.kaledsoft.tech" className="block text-center py-3 rounded-xl bg-white/5 text-white font-medium">
              Portal Cliente
            </a>
            <Link href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-center py-3 rounded-xl bg-cyan-600 text-white font-bold">
              Cotizar Proyecto
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

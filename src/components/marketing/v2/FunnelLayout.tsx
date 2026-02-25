"use client";

import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";

interface FunnelLayoutProps {
    children: ReactNode;
}

export function FunnelLayout({ children }: FunnelLayoutProps) {
    return (
        <div className="relative min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30">
            {/* Minimal Header */}
            <header className="absolute top-0 left-0 w-full p-8 z-50 flex justify-between items-center pointer-events-none">
                <Link href="/" className="pointer-events-auto group">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 overflow-hidden">
                            <Image
                                src="/kaledsoft-logo-transparent.webp"
                                alt="KaledSoft - Academia de Inteligencia Artificial en Montería, Colombia"
                                width={40}
                                height={40}
                                priority
                                className="object-contain transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                        <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            KALED<span className="text-cyan-500">SOFT</span>
                        </span>
                    </div>
                </Link>
            </header>

            <main>
                {children}
            </main>

            {/* Minimal Footer */}
            <footer className="py-12 border-t border-white/5 bg-slate-950/50">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} KaledSoft Technologies • Todos los derechos reservados
                    </p>
                </div>
            </footer>
        </div>
    );
}

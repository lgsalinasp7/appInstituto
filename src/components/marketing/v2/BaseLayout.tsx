"use client";

import { ReactNode } from "react";
import { NavbarV2 } from "./Navbar";
import { FooterV2 } from "./Footer";

interface BaseLayoutProps {
    children: ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
    return (
        <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-cyan-500/30 overflow-x-hidden">
            {/* Background patterns and noise */}
            <div className="grain-overlay" />
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
            </div>

            <NavbarV2 />
            <main className="relative z-10">
                {children}
            </main>
            <FooterV2 />
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "La Academia", href: "/formacion" },
    { name: "Desarrollo", href: "/desarrollo" },
    { name: "Visión", href: "/vision" },
    { name: "Blog", href: "/blog" },
];

export function NavbarV2() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
                isScrolled
                    ? "py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5"
                    : "py-6 bg-transparent"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
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
                    <span className="text-xl font-bold tracking-tighter text-white">
                        Kaled<span className="text-cyan-500">Soft</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
                        >
                            {link.name}
                            <motion.span
                                className="absolute -bottom-1 left-0 w-0 h-[1px] bg-cyan-500 group-hover:w-full transition-all duration-300"
                            />
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/aplicar"
                        className="group relative px-6 py-2.5 rounded-full bg-white text-slate-950 text-sm font-bold overflow-hidden transition-all hover:pr-10"
                    >
                        <span className="relative z-10 font-sora">Aplicar a la Cohorte</span>
                        <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-0 transition-all group-hover:opacity-100" />
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-slate-950 border-b border-white/5 p-6 flex flex-col gap-6 md:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg font-medium text-slate-400"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/aplicar"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full py-4 rounded-xl bg-cyan-600 text-white text-center font-bold"
                        >
                            Aplicar a la Cohorte
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

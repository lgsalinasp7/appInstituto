"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

export function FooterV2() {
    return (
        <footer className="bg-slate-950 border-t border-white/5 pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2 space-y-6">
                        <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
                            Kaled<span className="text-cyan-500">Soft</span>
                        </Link>
                        <p className="text-slate-400 max-w-sm leading-relaxed">
                            Academia de Inteligencia Artificial y Laboratorio de Software.
                            Formamos los arquitectos del mañana y construimos los sistemas inteligentes de hoy.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                <Facebook className="w-5 h-5 text-slate-400" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                <Instagram className="w-5 h-5 text-slate-400" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                <Linkedin className="w-5 h-5 text-slate-400" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Compañía</h4>
                        <ul className="space-y-4 text-sm text-slate-400 font-medium">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="/vision" className="hover:text-white transition-colors">Nuestra Visión</Link></li>
                            <li><Link href="/desarrollo" className="hover:text-white transition-colors">Servicios B2B</Link></li>
                            <li><Link href="/aplicar" className="hover:text-white transition-colors">Aplicar</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Contacto</h4>
                        <ul className="space-y-4 text-sm text-slate-400 font-medium">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>contacto@kaledsoft.tech</span>
                            </li>
                            <li>Montería, Córdoba</li>
                            <li>Colombia, Latam</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-xs">
                        © {new Date().getFullYear()} KaledSoft Technologies. Ingeniería de Élite.
                    </p>
                    <div className="flex gap-6 text-xs text-slate-500">
                        <Link href="/privacidad" className="hover:text-slate-300">Privacidad</Link>
                        <Link href="/terminos" className="hover:text-slate-300">Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

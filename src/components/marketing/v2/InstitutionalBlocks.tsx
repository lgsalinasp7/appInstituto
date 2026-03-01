"use client";

import { motion } from "framer-motion";
import { GraduationCap, Code, ArrowRight } from "lucide-react";
import Link from "next/link";

export function InstitutionalBlocksV2() {
    return (
        <section className="py-32 bg-white/5 border-y border-white/5 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Academia Block */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="group p-12 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-cyan-500/20 transition-all duration-500 space-y-8 h-full flex flex-col justify-between"
                    >
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 flex items-center justify-center">
                                <GraduationCap className="w-8 h-8 text-cyan-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-white font-display">🎓 Academia de IA y SaaS</h3>
                                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                    Formación de élite para la nueva generación de ingenieros. Aprendizaje basado en proyectos reales, desarrollo de SaaS con agentes y arquitectura moderna.
                                </p>
                            </div>
                        </div>
                        <Link href="/formacion" className="inline-flex items-center gap-2 text-cyan-500 font-bold group-hover:gap-4 transition-all pt-8">
                            Conocer Programas <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Software Factory Block */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="group p-12 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-purple-500/20 transition-all duration-500 space-y-8 h-full flex flex-col justify-between"
                    >
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center">
                                <Code className="w-8 h-8 text-purple-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-white font-display">🧩 Desarrollo de Software</h3>
                                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                    Construimos soluciones SaaS y sistemas inteligentes a medida. Integramos agentes de IA para automatizar procesos complejos en empresas de vanguardia.
                                </p>
                            </div>
                        </div>
                        <Link href="/desarrollo" className="inline-flex items-center gap-2 text-purple-500 font-bold group-hover:gap-4 transition-all pt-8">
                            Ver Soluciones B2B <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { HeroRobot } from "./HeroRobot";

export function HeroV2() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold uppercase tracking-[0.2em]"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>La IA no es opcional. Es el estándar.</span>
                        </motion.div>

                        <div className="space-y-6">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                className="text-5xl md:text-8xl font-black tracking-tight text-white leading-[1] font-display"
                            >
                                KaledSoft<br />
                                <span className="text-slate-500">Academia & Lab</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed"
                            >
                                Formamos desarrolladores capaces de crear SaaS y sistemas inteligentes usando agentes de IA.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
                        >
                            <Link
                                href="/formacion"
                                className="px-10 py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all hover:scale-105 shadow-[0_0_40px_rgba(8,145,178,0.3)]"
                            >
                                Ver la Academia
                            </Link>
                            <Link
                                href="/desarrollo"
                                className="px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all"
                            >
                                Desarrollo de Software
                            </Link>
                        </motion.div>
                    </div>

                    {/* Robot Animation Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="flex justify-center items-center"
                    >
                        <HeroRobot />
                    </motion.div>
                </div>
            </div>

            {/* Decorative center light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />
        </section>
    );
}

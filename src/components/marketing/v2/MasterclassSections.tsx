"use client";

import { motion } from "framer-motion";
import { HeroRobot } from "./HeroRobot";
import { Zap, AlertTriangle, Bot, Layers, Wrench, ArrowRightLeft, GraduationCap } from "lucide-react";

export function MasterclassHero() {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest"
                        >
                            <Zap className="w-3 h-3 fill-current" /> Masterclass Privada
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter"
                        >
                            La Universidad <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">No Te Preparó</span> Para Esto.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            Masterclass privada para estudiantes y recien graduados que quieren construir su primer <span className="text-white font-bold">SaaS con IA en 4 meses</span>.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap gap-4 justify-center lg:justify-start"
                        >
                            <a href="#aplicar" className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                Aplicar ahora
                            </a>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="relative flex justify-center items-center">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[360px] h-[360px] rounded-full bg-cyan-500/10 blur-3xl" />
                        </div>
                        <div className="relative w-full max-w-[520px]">
                            <HeroRobot />
                            <div className="absolute -bottom-4 -left-4 glass-card rounded-2xl px-4 py-3 border border-cyan-500/20">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Resultado en 4 meses</p>
                                <p className="text-sm font-bold text-white">Primer SaaS en produccion</p>
                            </div>
                            <div className="absolute -top-2 -right-2 glass-card rounded-2xl px-4 py-3 border border-blue-500/20">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Metodo</p>
                                <p className="text-sm font-bold text-white">IA + Stack moderno + ejecucion</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />
        </section>
    );
}

export function MasterclassProblem() {
    const painPoints = [
        "5 anos estudiando teoria.",
        "No sabes desplegar un producto.",
        "No sabes como monetizar.",
        "No sabes usar IA estrategicamente.",
    ];

    return (
        <section className="py-24 relative bg-slate-950">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-4xl md:text-5xl font-black text-white"
                    >
                        El problema no es tu talento. Es el sistema.
                    </motion.h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {painPoints.map((point, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 text-left hover:border-red-500/30 transition-all cursor-default group"
                            >
                                <AlertTriangle className="w-8 h-8 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                                <p className="text-slate-300 font-medium leading-relaxed">{point}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function MasterclassPromise() {
    const benefits = [
        {
            icon: Layers,
            title: "Que es un SaaS real",
            desc: "Entenderas como se construye un producto con usuarios, problema claro y modelo de negocio."
        },
        {
            icon: Bot,
            title: "Como usar IA para desarrollarlo mas rapido",
            desc: "Aprenderas a usar IA como copiloto estrategico para avanzar en menos tiempo."
        },
        {
            icon: Wrench,
            title: "Que stack usar",
            desc: "Tendras claridad de herramientas para pasar de idea a producto sin perderte."
        },
        {
            icon: ArrowRightLeft,
            title: "Como pasar de estudiante a constructor",
            desc: "Cambiaras tu enfoque de solo estudiar a construir soluciones que se puedan lanzar."
        },
        {
            icon: GraduationCap,
            title: "Como funciona el Programa Constructor de SaaS con IA",
            desc: "Veras la ruta completa para seguir despues de la masterclass con un plan accionable."
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-white">La promesa de esta masterclass</h2>
                        <p className="text-slate-400 text-lg">Saldras con claridad para construir, lanzar y pensar como creador de producto.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {benefits.map((b, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="flex gap-6 items-start p-6 rounded-3xl hover:bg-white/5 transition-all"
                            >
                                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                                    <b.icon className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white tracking-tight">{b.title}</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm font-medium">{b.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { Server, Bot, ShieldCheck, Zap, Layers, Globe } from "lucide-react";
import Link from "next/link";

const services = [
    {
        title: "Desarrollo de SaaS a medida",
        description: "Construimos plataformas escalables desde la arquitectura hasta el despliegue final.",
        icon: Server
    },
    {
        title: "Integración de Agentes IA",
        description: "Sistemas autónomos que resuelven tareas complejas y optimizan la operación.",
        icon: Bot
    },
    {
        title: "Automatización Empresarial",
        description: "Reducción de costos y tiempos mediante flujos de trabajo inteligentes.",
        icon: Zap
    },
    {
        title: "Sistemas Internos Inteligentes",
        description: "Dashboards y herramientas de gestión con IA para toma de decisiones.",
        icon: ShieldCheck
    }
];

export function DesarrolloContent() {
    return (
        <div className="pt-32 pb-20">
            <div className="container mx-auto px-6">

                {/* Hero Section */}
                <section className="max-w-4xl space-y-8 mb-32">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black text-white leading-tight font-display"
                    >
                        Desarrollo de Software en Montería <br />
                        <span className="text-purple-500">Laboratorio de IA - Colombia</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed"
                    >
                        Materializamos ideas complejas en productos digitales de élite. Ingeniería de software con visión de largo plazo y ejecución de alto nivel.
                    </motion.p>
                </section>

                {/* Services Grid */}
                <section className="mb-40">
                    <div className="grid md:grid-cols-2 gap-8">
                        {services.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-12 rounded-[2.5rem] bg-slate-900/60 border border-white/5 hover:border-purple-500/30 transition-all group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-purple-600/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <s.icon className="w-8 h-8 text-purple-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{s.title}</h3>
                                <p className="text-slate-400 text-lg leading-relaxed">{s.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Capabilities / Why Us */}
                <section className="grid lg:grid-cols-2 gap-20 items-center py-24 border-y border-white/5">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-[3rem] bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 flex items-center justify-center relative overflow-hidden border border-white/10 text-slate-200">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                            <Layers className="w-32 h-32 text-purple-500 relative z-10" />
                        </div>
                        {/* Floating tags */}
                        <div className="absolute -top-6 -right-6 px-6 py-3 rounded-xl bg-slate-800 border border-white/10 font-mono text-xs text-purple-400">Next.js 15</div>
                        <div className="absolute top-20 -left-6 px-6 py-3 rounded-xl bg-slate-800 border border-white/10 font-mono text-xs text-cyan-400">TS + AI SDK</div>
                        <div className="absolute -bottom-6 left-20 px-6 py-3 rounded-xl bg-slate-800 border border-white/10 font-mono text-xs text-white">Scale-on-Demand</div>
                    </motion.div>

                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">Autoridad Técnica &<br /> Ejecución de Élite.</h2>
                            <p className="text-xl text-slate-400 leading-relaxed font-medium">
                                No somos solo desarrolladores. Somos arquitectos que entienden el negocio. Lo que enseñamos en nuestra academia, lo aplicamos en productos reales de escala global.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <h4 className="text-white font-bold text-3xl font-display">99.9%</h4>
                                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Uptime Garantizado</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-white font-bold text-3xl font-display">100 / 100</h4>
                                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Performance Score</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="mt-40 text-center space-y-12 pb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest">
                        <Globe className="w-4 h-4" />
                        <span>Impulsando el ecosistema tech en Latam</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white font-display">Construyamos el Futuro.</h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">Disponibles para proyectos de alto impacto que busquen escalar mediante integración de inteligencia artificial.</p>
                    <div className="flex justify-center">
                        <Link
                            href="mailto:ventas@kaledsoft.tech"
                            className="px-12 py-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-lg transition-all hover:scale-105 shadow-[0_0_60px_rgba(147,51,234,0.3)]"
                        >
                            Iniciar una Consulta
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}

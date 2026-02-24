"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Users, Rocket, Target, Cpu } from "lucide-react";
import Link from "next/link";

const features = [
    {
        title: "Aprendizaje basado en proyectos",
        description: "No hay clases teóricas interminables. Construyes desde el día 1.",
        icon: Rocket
    },
    {
        title: "Agentes IA personalizados",
        description: "Aprendes a crear tus propios agentes para automatizar el desarrollo.",
        icon: Cpu
    },
    {
        title: "Arquitectura moderna",
        description: "Stack de última generación: Next.js, AI SDK, Prisma, Neon.",
        icon: Target
    },
    {
        title: "Mentalidad de Fundador",
        description: "No solo programas; aprendes a pensar como el dueño de un producto.",
        icon: Users
    }
];

export function AcademiaContent() {
    return (
        <div className="pt-32 pb-20">
            <div className="container mx-auto px-6">

                {/* Header Section */}
                <section className="max-w-4xl space-y-8 mb-24">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black text-white leading-tight font-display"
                    >
                        Academia de Inteligencia Artificial en Montería <br />
                        <span className="text-cyan-500">Desarrollo de SaaS con IA</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed"
                    >
                        No es un curso. Es un laboratorio de transformación técnica y mental para crear el software que el futuro exige.
                    </motion.p>
                </section>

                {/* The Program Section */}
                <section className="grid lg:grid-cols-2 gap-20 mb-32 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-10"
                    >
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-white">Programa: Desarrollo de SaaS con Agentes de IA</h2>
                            <div className="h-1 w-20 bg-cyan-600 rounded-full" />
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                                <CheckCircle2 className="w-6 h-6 text-cyan-500 shrink-0" />
                                <div className="space-y-1">
                                    <h4 className="text-white font-bold text-lg">Jóvenes sin experiencia</h4>
                                    <p className="text-slate-400">Ruta desde cero diseñada para dominar la ingeniería en tiempo récord.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                                <CheckCircle2 className="w-6 h-6 text-cyan-500 shrink-0" />
                                <div className="space-y-1">
                                    <h4 className="text-white font-bold text-lg">Desarrolladores intermedios</h4>
                                    <p className="text-slate-400">Especialización profunda en integración de agentes y sistemas autónomos.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                                <CheckCircle2 className="w-6 h-6 text-cyan-500 shrink-0" />
                                <div className="space-y-1">
                                    <h4 className="text-white font-bold text-lg">Emprendedores tecnológicos</h4>
                                    <p className="text-slate-400">Capacidad para prototipar y lanzar productos escalables sin fricción.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-10 rounded-[3rem] bg-slate-900 border border-white/10 shadow-2xl relative"
                    >
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl" />
                        <h3 className="text-2xl font-bold text-white mb-6">Resultado Esperado</h3>
                        <p className="text-slate-300 text-lg leading-relaxed mb-8 italic">
                            "Saldrás con tu propio SaaS funcional y la capacidad técnica para diseñar cualquier sistema inteligente que el mercado demande."
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                Portfolio de alto impacto
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                Dominio de LLMs y Agentes
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                Acceso a red global de fundadores
                            </li>
                        </ul>
                    </motion.div>
                </section>

                {/* Methodology Grid */}
                <section className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold text-white">Metodología de Alto Rendimiento</h2>
                        <p className="text-slate-400 text-lg">Sin clases grabadas. Sin relleno. Solo ejecución.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all"
                            >
                                <f.icon className="w-10 h-10 text-cyan-500 mb-6" />
                                <h4 className="text-white font-bold mb-3">{f.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="mt-40 text-center py-20 rounded-[4rem] bg-cyan-950/20 border border-cyan-500/10 backdrop-blur-sm">
                    <h2 className="text-3xl font-bold text-white mb-6">¿Estás listo para el reto?</h2>
                    <p className="text-slate-400 mb-10 max-w-xl mx-auto">Seleccionamos a un grupo limitado por cohorte para asegurar la calidad y el impacto del aprendizaje.</p>
                    <Link
                        href="/aplicar"
                        className="px-12 py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold inline-flex items-center gap-3 transition-all"
                    >
                        Aplicar a la próxima cohorte <ArrowRight className="w-5 h-5" />
                    </Link>
                </section>

            </div>
        </div>
    );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}

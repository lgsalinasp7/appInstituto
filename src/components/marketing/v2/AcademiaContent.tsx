"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Rocket,
    Target,
    Cpu,
    Code2,
    Layers,
    CreditCard,
    ArrowRight,
    Database,
    Zap,
    Trophy
} from "lucide-react";
import {
    SiClaude,
    SiNextdotjs,
    SiOpenai,
    SiPostgresql,
    SiPrisma,
    SiSupabase,
    SiTailwindcss,
    SiVercel,
} from "react-icons/si";
import Link from "next/link";
import Image from "next/image";

type TechIcon = ComponentType<{ className?: string }>;

type TechStackItem = {
    name: string;
    color: string;
    icon?: TechIcon;
    imageSrc?: string;
    imageAlt?: string;
};

const techStack: TechStackItem[] = [
    { name: "Next.js (App Router)", icon: SiNextdotjs, color: "text-white" },
    { name: "TailwindCSS", icon: SiTailwindcss, color: "text-cyan-300" },
    { name: "Shadcn/UI", imageSrc: "/shadcn.png", imageAlt: "Shadcn UI", color: "text-slate-200" },
    { name: "Prisma ORM", icon: SiPrisma, color: "text-emerald-500" },
    { name: "PostgreSQL", icon: SiPostgresql, color: "text-blue-400" },
    { name: "Supabase (Backend/Auth)", icon: SiSupabase, color: "text-emerald-400" },
    { name: "API OpenAI", icon: SiOpenai, color: "text-emerald-400" },
    { name: "Cursor", imageSrc: "/cursor.png", imageAlt: "Cursor", color: "text-slate-100" },
    { name: "Claude Code", icon: SiClaude, color: "text-orange-400" },
    { name: "Antigravity", imageSrc: "/antigravityIcon.jpg", imageAlt: "Antigravity", color: "text-fuchsia-400" },
    { name: "Mercado Pago / Wompi", imageSrc: "/mercadopago.webp", imageAlt: "Mercado Pago", color: "text-blue-600" },
    { name: "Vercel Deploy", icon: SiVercel, color: "text-white" },
];

const modules = [
    {
        number: "1",
        title: "Mentalidad de Arquitecto Digital",
        subtitle: "Aprende a pensar antes de programar",
        description: "Aquí entiendes cómo funciona realmente un sistema. Diseñas antes de escribir código. Aprendes a usar la IA sin depender de ella. Porque el problema no es que la IA programe, el problema es no entender lo que construyes.",
        icon: Target
    },
    {
        number: "2",
        title: "Frontend Profesional con Next.js",
        subtitle: "Interfaces modernas que escalan",
        description: "Construyes una base sólida en React + Next.js. No haces 'páginas', construyes componentes reutilizables y arquitectura escalable enfocada en producto.",
        icon: Code2
    },
    {
        number: "3",
        title: "Backend y Base de Datos Real",
        subtitle: "Aquí nace el verdadero SaaS",
        description: "Modelado de datos profesional, CRUD completo, autenticación multiusuario y control de acceso. Tu proyecto deja de ser un ejercicio y se convierte en un producto real.",
        icon: Database
    },
    {
        number: "4",
        title: "AI SaaS Engineering",
        subtitle: "Integra IA dentro de tu producto",
        description: "Prompt Engineering estratégico, integración con API OpenAI, arquitectura IA backend y control de uso. Pasas de un SaaS común a uno listo para competir.",
        icon: Cpu
    },
    {
        number: "5",
        title: "Monetización Real para LATAM",
        subtitle: "Si no puedes cobrar, no es un SaaS",
        description: "Integración de Mercado Pago y Wompi. Flujos de pago, webhooks, control por suscripción y restricción por plan. Tu proyecto factura desde el día uno.",
        icon: CreditCard
    },
    {
        number: "6",
        title: "Deploy y Escalabilidad",
        subtitle: "Lanza como producto real",
        description: "Producción real con Vercel, base de datos en la nube y variables de entorno. No es un proyecto local, es un activo digital en internet.",
        icon: Rocket
    }
];

export function AcademiaContent() {
    return (
        <div className="pt-32 pb-20 bg-slate-950 min-h-screen selection:bg-cyan-500/30">
            <div className="container mx-auto px-6">

                {/* Hero Section Premium */}
                <section className="max-w-5xl space-y-10 mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-sm tracking-widest uppercase mb-4"
                    >
                        <Zap className="w-4 h-4" /> Lanzamiento 2024
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-black text-white leading-[1.1] font-display"
                    >
                        AI SaaS Engineering <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                            Bootcamp
                        </span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6 max-w-3xl"
                    >
                        <p className="text-2xl md:text-3xl text-slate-300 font-bold leading-tight">
                            Construye, Lanza y Monetiza tu propio SaaS usando IA como asistente estratégico.
                        </p>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed">
                            ⚡ <span className="text-white font-bold">No es un curso de programación.</span> Es una fábrica de fundadores tecnológicos.
                        </p>
                    </motion.div>
                </section>

                {/* Manifesto Section */}
                <section className="grid lg:grid-cols-2 gap-16 mb-40 bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-sm">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-white leading-tight">
                            Hoy cualquiera puede pedirle código a la IA. <br />
                            <span className="text-cyan-500">Pero casi nadie sabe:</span>
                        </h2>
                        <ul className="grid gap-4">
                            {[
                                "Diseñar sistemas escalables",
                                "Integrar IA correctamente",
                                "Convertir código en producto",
                                "Implementar pagos reales en LATAM",
                                "Lanzar algo que pueda facturar"
                            ].map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 text-slate-300 text-lg font-medium"
                                >
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col justify-center space-y-6 lg:border-l lg:border-white/10 lg:pl-16">
                        <p className="text-xl text-slate-300 leading-relaxed italic">
                            "Aquí no vienes a aprender React. Vienes a construir un SaaS real desde cero."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-1 w-20 bg-cyan-600 rounded-full" />
                            <p className="text-cyan-500 font-black tracking-widest uppercase text-sm">El Método KaledSoft</p>
                        </div>
                    </div>
                </section>

                {/* Transformation Grid */}
                <section className="mb-40">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-bold text-white">Lo que realmente aprenderás</h2>
                        <p className="text-slate-400 text-lg">Aprenderás a pensar y ejecutar como un profesional de élite.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Arquitecto de Software", icon: Layers, desc: "Diseña sistemas robustos y escalables." },
                            { title: "AI Engineer", icon: Cpu, desc: "Domina el futuro de la ingeniería." },
                            { title: "Fundador Digital", icon: Rocket, desc: "Crea productos que el mercado quiere." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-3xl bg-slate-900 border border-white/5 hover:border-cyan-500/20 transition-all text-center space-y-4"
                            >
                                <item.icon className="w-12 h-12 text-cyan-500 mx-auto" />
                                <h4 className="text-white font-bold text-xl">{item.title}</h4>
                                <p className="text-slate-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Tech Stack Horizontal Scroll/Grid */}
                <section className="mb-40 space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold text-white tracking-tight">Stack Tecnológico Profesional</h2>
                        <p className="text-slate-400">Sin tecnologías obsoletas. Solo lo que se usa en producción real.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
                        {techStack.map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
                            >
                                {tech.imageSrc ? (
                                    <span className={tech.name === "Shadcn/UI" ? "w-6 h-6 rounded-sm bg-white p-0.5 flex items-center justify-center" : ""}>
                                        <Image
                                            src={tech.imageSrc}
                                            alt={tech.imageAlt || tech.name}
                                            width={24}
                                            height={24}
                                            className="w-6 h-6 rounded-sm object-contain"
                                        />
                                    </span>
                                ) : tech.icon ? (
                                    <tech.icon className={`w-6 h-6 ${tech.color}`} />
                                ) : null}
                                <span className="text-slate-200 font-bold">{tech.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Modular Curriculum - Timeline Style */}
                <section className="mb-40 space-y-24">
                    <div className="text-center space-y-4">
                        <h2 className="text-5xl font-black text-white">Estructura del Programa</h2>
                        <div className="h-1.5 w-32 bg-cyan-600 mx-auto rounded-full" />
                    </div>

                    <div className="space-y-12">
                        {modules.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="group relative grid md:grid-cols-[100px_1fr] items-start gap-8"
                            >
                                <div className="hidden md:flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-cyan-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-900/40">
                                        {m.number}
                                    </div>
                                    {i !== modules.length - 1 && (
                                        <div className="w-1 h-32 bg-gradient-to-b from-cyan-600 to-transparent my-4 opacity-30" />
                                    )}
                                </div>
                                <div className="p-10 rounded-[2.5rem] bg-slate-900 border border-white/5 hover:border-cyan-500/30 transition-all backdrop-blur-xl">
                                    <div className="flex gap-4 items-center mb-6">
                                        <m.icon className="w-8 h-8 text-cyan-500" />
                                        <div>
                                            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                MÓDULO {m.number} — {m.title}
                                            </h3>
                                            <p className="text-cyan-500/80 font-bold text-sm tracking-widest uppercase">{m.subtitle}</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
                                        {m.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Outcome Section */}
                <section className="mb-40 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-16 rounded-[4rem] bg-gradient-to-br from-slate-900 to-cyan-950 border border-cyan-500/20 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] -rotate-45" />
                        <Trophy className="w-16 h-16 text-cyan-500 mx-auto mb-8" />
                        <h2 className="text-4xl font-bold text-white mb-12">Resultado Final</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                            {[
                                "Un SaaS completo construido por ti",
                                "IA integrada estratégicamente",
                                "Pagos configurados para LATAM",
                                "Deploy real en producción",
                                "Arquitectura técnica explicable",
                                "Mentalidad de fundador real"
                            ].map((res, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                                    <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
                                    <span className="text-slate-100 font-medium">{res}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* Final CTA */}
                <section className="text-center pb-20">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8">¿Estás listo para el reto?</h2>
                    <p className="text-slate-400 mb-12 max-w-2xl mx-auto text-xl font-medium italic">
                        "No dependerás de la IA. La usarás estratégicamente."
                    </p>
                    <Link
                        href="/aplicar"
                        className="group relative px-12 py-6 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xl inline-flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-cyan-900/40"
                    >
                        Inscribirme ahora <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </section>

            </div>
        </div>
    );
}

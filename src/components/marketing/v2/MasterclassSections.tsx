"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { HeroRobot } from "./HeroRobot";
import { SiClaude, SiNextdotjs, SiOpenai, SiPostgresql, SiPrisma, SiSupabase, SiTailwindcss, SiVercel } from "react-icons/si";
import { Zap, AlertTriangle, Bot, Layers, Wrench, ArrowRightLeft, GraduationCap, CheckCircle2, Cpu, Rocket, Target, CreditCard, Database, MessageCircle, Clock3, ShieldCheck } from "lucide-react";

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
        "5 años estudiando teoria.",
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

type TechIcon = ComponentType<{ className?: string }>;
type TechStackItem = {
    name: string;
    color: string;
    icon?: TechIcon;
    imageSrc?: string;
    imageAlt?: string;
};

const masterclassStack: TechStackItem[] = [
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

const masterclassModules = [
    {
        number: "1",
        title: "Mentalidad de Constructor",
        subtitle: "De estudiante a ejecutor",
        description: "Entiendes por que la mayoria se queda en tutoriales y como romper ese ciclo. Sales con un mapa claro para construir con foco y criterio.",
        icon: Target,
    },
    {
        number: "2",
        title: "Arquitectura Frontend que Vende",
        subtitle: "No paginas sueltas, producto real",
        description: "Aprendes como estructurar interfaces modernas con Next.js para que se vean pro, carguen rapido y conviertan mejor.",
        icon: Layers,
    },
    {
        number: "3",
        title: "Backend + Datos sin humo",
        subtitle: "Lo que sostiene un SaaS real",
        description: "Modelado de datos, autenticacion y flujo completo de un producto funcional. Entiendes como conectar todo de forma limpia.",
        icon: Database,
    },
    {
        number: "4",
        title: "IA aplicada al producto",
        subtitle: "De moda a ventaja competitiva",
        description: "Ves como usar IA de forma estrategica para acelerar desarrollo, mejorar experiencia y crear diferenciacion real.",
        icon: Cpu,
    },
    {
        number: "5",
        title: "Monetizacion para LATAM",
        subtitle: "Si no cobras, no hay negocio",
        description: "Conoces la logica detras de pasarelas, suscripciones y restriccion por plan para que tu SaaS pueda facturar desde el inicio.",
        icon: CreditCard,
    },
    {
        number: "6",
        title: "Deploy y lanzamiento",
        subtitle: "Publica como profesional",
        description: "Como salir de local y llevar tu SaaS a internet con buenas practicas de despliegue, entorno y estabilidad.",
        icon: Rocket,
    },
];

export function MasterclassCurriculum() {
    return (
        <section className="py-24 bg-slate-950 border-y border-white/5">
            <div className="container mx-auto px-6 space-y-20">
                <div className="max-w-4xl mx-auto text-center space-y-5">
                    <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest">
                        <Zap className="w-3 h-3 fill-current" /> Temario de Alto Impacto
                    </p>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        Lo que vas a ver en la masterclass
                    </h2>
                    <p className="text-slate-400 text-lg max-w-3xl mx-auto">
                        Esta no es una charla motivacional. Es una sesion estrategica para que sepas exactamente que construir, con que stack y como convertirlo en una oportunidad real.
                    </p>
                </div>

                <div className="space-y-16">
                    <div className="text-center space-y-3">
                        <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">Stack Tecnologico Profesional</h3>
                        <p className="text-slate-400">Herramientas reales, usadas por equipos que lanzan producto.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
                        {masterclassStack.map((tech, i) => (
                            <motion.div
                                key={tech.name}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
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
                                <span className="text-slate-200 font-bold text-sm md:text-base">{tech.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="text-center space-y-3">
                        <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">Temario estrategico en 6 bloques</h3>
                        <p className="text-slate-400">Cada bloque responde a una pregunta clave para construir y monetizar.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {masterclassModules.map((module, i) => (
                            <motion.article
                                key={module.number}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="p-8 rounded-3xl bg-slate-900 border border-white/5 hover:border-cyan-500/30 transition-all"
                            >
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-900/30">
                                        {module.number}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-white font-black text-xl leading-tight">{module.title}</h4>
                                        <p className="text-cyan-400 text-xs font-black uppercase tracking-widest">{module.subtitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <module.icon className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />
                                    <p className="text-slate-400 text-sm leading-relaxed font-medium">{module.description}</p>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-10 md:p-14 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-cyan-950 border border-cyan-500/20"
                >
                    <div className="max-w-4xl mx-auto space-y-8 text-center">
                        <h3 className="text-3xl md:text-4xl font-black text-white">Resultado de esta sesion</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-left">
                            {[
                                "Un mapa claro para construir tu primer SaaS",
                                "Criterio para elegir stack sin perder tiempo",
                                "Ruta para usar IA como ventaja y no como muleta",
                                "Vision real para lanzar y monetizar en LATAM",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                                    <p className="text-slate-100 font-medium">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export function MasterclassUrgencyStrip() {
    return (
        <section className="py-10 bg-slate-950">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto rounded-[2rem] border border-cyan-500/30 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 p-8 md:p-10 shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                >
                    <div className="space-y-6 text-center">
                        <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-black uppercase tracking-widest">
                            <Clock3 className="w-3.5 h-3.5" /> Cupos limitados por cohorte
                        </p>
                        <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
                            La informacion completa se entrega por WhatsApp privado
                        </h3>
                        <p className="text-slate-300 text-base md:text-lg max-w-3xl mx-auto">
                            Si quieres fecha, hora, acceso y bono de la masterclass, debes completar tu aplicacion.
                            Al finalizar, te enviaremos al canal de WhatsApp donde recibes todos los detalles paso a paso.
                        </p>
                    </div>

                    <div className="mt-8 grid md:grid-cols-3 gap-4 text-left">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Paso 1: Aplica",
                                desc: "Completa el formulario y reserva tu cupo.",
                            },
                            {
                                icon: MessageCircle,
                                title: "Paso 2: Entra a WhatsApp",
                                desc: "Recibes el enlace privado al terminar.",
                            },
                            {
                                icon: Rocket,
                                title: "Paso 3: Asiste y ejecuta",
                                desc: "Llega con claridad para construir tu SaaS.",
                            },
                        ].map((step) => (
                            <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <step.icon className="w-5 h-5 text-cyan-400 mb-3" />
                                <p className="text-white font-bold mb-1">{step.title}</p>
                                <p className="text-slate-400 text-sm">{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <a
                            href="#aplicar"
                            className="px-8 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black transition-all shadow-[0_0_24px_rgba(6,182,212,0.35)]"
                        >
                            Quiero mi acceso por WhatsApp
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

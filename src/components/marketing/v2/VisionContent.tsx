"use client";

import { motion } from "framer-motion";
import { Compass, Globe2, Lightbulb, ShieldCheck } from "lucide-react";

const pillars = [
    {
        title: "Soberanía Tecnológica",
        description: "Creemos en la capacidad de Latinoamérica para construir su propia infraestructura inteligente.",
        icon: ShieldCheck
    },
    {
        title: "Impacto Regional",
        description: "Desde Montería para el mundo. Descentralizamos el talento de élite.",
        icon: Globe2
    },
    {
        title: "Educación de Vanguardia",
        description: "Formamos arquitectos, no solo codificadores. Visión de sistemas y agentes.",
        icon: Lightbulb
    },
    {
        title: "Visión de Largo Plazo",
        description: "No buscamos el hype. Construimos bases sólidas para la próxima década de ingeniería.",
        icon: Compass
    }
];

export function VisionContent() {
    return (
        <div className="pt-32 pb-20">
            <div className="container mx-auto px-6">

                {/* Story Section */}
                <section className="max-w-4xl space-y-12 mb-32">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black text-white leading-tight font-display"
                    >
                        Más que una Academia.<br />
                        <span className="text-slate-500">Un Movimiento.</span>
                    </motion.h1>

                    <div className="space-y-6 text-xl md:text-2xl text-slate-400 font-medium leading-relaxed">
                        <p>
                            Nuestra misión es formar la nueva generación de arquitectos de software en la era de la inteligencia artificial.
                        </p>
                        <p className="border-l-4 border-cyan-500 pl-8 py-2 text-white">
                            No estamos aquí para enseñar a programar. Estamos aquí para enseñar a construir el futuro.
                        </p>
                        <p>
                            KaledSoft nace con la convicción de que el talento en Montería y Latinoamérica tiene la capacidad de liderar la revolución de agentes inteligentes a nivel global.
                        </p>
                    </div>
                </section>

                {/* Pillars Grid */}
                <section className="grid md:grid-cols-2 gap-12 mb-40">
                    {pillars.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-12 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all"
                        >
                            <p.icon className="w-10 h-10 text-cyan-500 mb-8" />
                            <h3 className="text-2xl font-bold text-white mb-4">{p.title}</h3>
                            <p className="text-slate-400 text-lg leading-relaxed">{p.description}</p>
                        </motion.div>
                    ))}
                </section>

                {/* Vision Quote Section */}
                <section className="py-24 rounded-[4rem] bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border border-white/5 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20" />
                    <div className="relative z-10 max-w-3xl mx-auto space-y-8 px-6">
                        <h2 className="text-3xl md:text-5xl font-black text-white font-display">Soberanía Técnica para Latam.</h2>
                        <p className="text-xl text-slate-300 italic leading-relaxed">
                            "El control de la tecnología es el control del destino. KaledSoft busca que Latinoamérica no solo consuma IA, sino que la diseñe, la implemente y la posea."
                        </p>
                        <div className="pt-8">
                            <div className="text-white font-bold text-lg">KaledSoft Lab</div>
                            <div className="text-cyan-500 text-sm font-bold uppercase tracking-widest">Engineering Authority</div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/components/analytics/GoogleAnalytics";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";

export default function AplicarPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Track form submission events
        trackEvent("form_submit", {
            form_name: "academia_application",
            page_path: "/aplicar"
        });

        trackMetaEvent("Lead", {
            content_name: "Academia Application",
            content_category: "Application"
        });

        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 p-12 rounded-[3rem] bg-white/5 border border-white/10 max-w-lg mx-6"
                >
                    <div className="w-20 h-20 rounded-full bg-cyan-600/20 flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-10 h-10 text-cyan-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Solicitud Recibida</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Tu perfil está siendo analizado por nuestro equipo técnico. Nos pondremos en contacto contigo en las próximas 48 horas si cumples con el criterio de selección.
                    </p>
                    <div className="pt-6">
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-cyan-500 font-bold hover:text-cyan-400 transition-colors"
                        >
                            Volver
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-2xl">

                <header className="text-center space-y-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-widest"
                    >
                        Admisiones Abiertas
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white font-display"
                    >
                        Aplicar a la Cohorte
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg font-medium"
                    >
                        Buscamos mentes hambrientas, ingenieros con visión y futuros fundadores de SaaS.
                    </motion.p>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-8 md:p-12 rounded-[3rem] bg-slate-900 border border-white/5 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej: Elon Musk"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Edad</label>
                                <input
                                    required
                                    type="number"
                                    placeholder="24"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nivel Técnico Actual</label>
                            <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium appearance-none">
                                <option value="zero" className="bg-slate-950">Jóven sin experiencia (ruta desde cero)</option>
                                <option value="intermediate" className="bg-slate-950">Desarrollador Intermedio (especialización)</option>
                                <option value="entrepreneur" className="bg-slate-950">Emprendedor Tecnológico</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">¿Por qué quieres aprender IA?</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Cuéntanos tu motivación técnica..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium resize-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">¿Tienes intención de crear un SaaS propio?</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="radio" name="saas" className="w-5 h-5 accent-cyan-500" />
                                    <span className="text-slate-300 group-hover:text-white transition-colors">Sí, tengo una idea</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="radio" name="saas" className="w-5 h-5 accent-cyan-500" />
                                    <span className="text-slate-300 group-hover:text-white transition-colors">Tal vez en el futuro</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-lg transition-all flex items-center justify-center gap-3 group"
                        >
                            Enviar Solicitud <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>

                        <p className="text-center text-slate-500 text-xs mt-4">
                            Al aplicar, aceptas que tu perfil sea evaluado bajo criterios de alto rendimiento.
                        </p>

                    </form>
                </motion.div>
            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { captureAttributionFromCurrentUrl, getAttribution } from "@/lib/attribution";
import { trackLeadSubmit } from "@/lib/funnel-events";

export default function AplicarPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        captureAttributionFromCurrentUrl();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Capturar UTM/clid de la URL actual y fallback a atribución persistida
        const urlParams = new URLSearchParams(window.location.search);
        const attribution = getAttribution();

        const data = {
            name: formData.get('name') as string,
            age: parseInt(formData.get('age') as string),
            email: formData.get('email') as string || undefined,
            phone: formData.get('phone') as string || undefined,
            technicalLevel: formData.get('technicalLevel') as string,
            motivation: formData.get('motivation') as string,
            hasSaasIdea: formData.get('saas') as string,
            utmSource: urlParams.get('utm_source') || attribution.utmSource || undefined,
            utmMedium: urlParams.get('utm_medium') || attribution.utmMedium || undefined,
            utmCampaign: urlParams.get('utm_campaign') || attribution.utmCampaign || undefined,
            utmContent: urlParams.get('utm_content') || attribution.utmContent || undefined,
            fbclid: urlParams.get('fbclid') || attribution.fbclid || undefined,
            gclid: urlParams.get('gclid') || attribution.gclid || undefined,
            ttclid: urlParams.get('ttclid') || attribution.ttclid || undefined,
        };

        try {
            const response = await fetch('/api/public/aplicar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                trackLeadSubmit({
                    funnel: "aplicar_cohorte",
                    page_path: "/aplicar",
                    lead_id: result.data.leadId,
                    utm_source: data.utmSource,
                    utm_medium: data.utmMedium,
                    utm_campaign: data.utmCampaign,
                    fbclid: data.fbclid,
                    gclid: data.gclid,
                    ttclid: data.ttclid,
                });

                setIsSubmitted(true);
            } else {
                setError(result.error || 'Error al enviar la solicitud');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            setError('Error al enviar la solicitud. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
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

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo *</label>
                                <input
                                    required
                                    name="name"
                                    type="text"
                                    placeholder="Ej: Elon Musk"
                                    disabled={isLoading}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Edad *</label>
                                <input
                                    required
                                    name="age"
                                    type="number"
                                    min="15"
                                    max="100"
                                    placeholder="24"
                                    disabled={isLoading}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email (Opcional)</label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    disabled={isLoading}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Teléfono (Opcional)</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder="+57 300 123 4567"
                                    disabled={isLoading}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nivel Técnico Actual *</label>
                            <select
                                name="technicalLevel"
                                required
                                disabled={isLoading}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium appearance-none disabled:opacity-50"
                            >
                                <option value="zero" className="bg-slate-950">Jóven sin experiencia (ruta desde cero)</option>
                                <option value="intermediate" className="bg-slate-950">Desarrollador Intermedio (especialización)</option>
                                <option value="entrepreneur" className="bg-slate-950">Emprendedor Tecnológico</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">¿Por qué quieres aprender IA? *</label>
                            <textarea
                                required
                                name="motivation"
                                rows={4}
                                placeholder="Cuéntanos tu motivación técnica..."
                                disabled={isLoading}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium resize-none disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">¿Tienes intención de crear un SaaS propio? *</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="saas"
                                        value="si-tengo-idea"
                                        required
                                        disabled={isLoading}
                                        className="w-5 h-5 accent-cyan-500 disabled:opacity-50"
                                    />
                                    <span className="text-slate-300 group-hover:text-white transition-colors">Sí, tengo una idea</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="saas"
                                        value="tal-vez-futuro"
                                        disabled={isLoading}
                                        className="w-5 h-5 accent-cyan-500 disabled:opacity-50"
                                    />
                                    <span className="text-slate-300 group-hover:text-white transition-colors">Tal vez en el futuro</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-lg transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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

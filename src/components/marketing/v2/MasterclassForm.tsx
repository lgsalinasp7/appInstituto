"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, GraduationCap, Code2, Rocket, Wallet, Hourglass } from "lucide-react";
import { captureMasterclassLead } from "@/app/actions/masterclass";
import { useSearchParams, useRouter } from "next/navigation";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackEvent } from "@/components/analytics/GoogleAnalytics";

export function MasterclassForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Agregar UTMs de la URL
        formData.append("utmSource", searchParams.get("utm_source") || "");
        formData.append("utmMedium", searchParams.get("utm_medium") || "");
        formData.append("utmCampaign", searchParams.get("utm_campaign") || "");
        formData.append("masterclassSlug", "masterclass-ia");

        try {
            const result = await captureMasterclassLead(formData);

            if (result.success) {
                // Track Eventos
                trackMetaEvent("Lead", {
                    content_name: "Masterclass IA Registration",
                    content_category: "Masterclass",
                    value: 0
                });

                trackEvent("masterclass_registration_success", {
                    page_path: "/masterclass-ia"
                });

                router.push("/masterclass-ia/gracias");
            } else {
                setError(result.error || "Ocurrió un error inesperado.");
                setIsSubmitting(false);
            }
        } catch {
            setError("Error de conexión. Inténtalo de nuevo.");
            setIsSubmitting(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-2xl mx-auto p-8 md:p-12 rounded-[2.5rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl relative overflow-hidden"
        >
            {/* Decorative background blur */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                        <input
                            required
                            name="name"
                            type="text"
                            placeholder="Ej: David Peniche"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium placeholder:text-slate-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">WhatsApp</label>
                        <input
                            required
                            name="phone"
                            type="tel"
                            placeholder="+57 300 000 0000"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium placeholder:text-slate-600"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
                    <input
                        required
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium placeholder:text-slate-600"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Hourglass className="w-3 h-3 text-cyan-500" /> Edad
                        </label>
                        <input
                            required
                            name="age"
                            type="number"
                            min={16}
                            max={99}
                            placeholder="Ej: 22"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium placeholder:text-slate-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <GraduationCap className="w-3 h-3 text-cyan-500" /> Estudias o ya te graduaste
                        </label>
                        <select name="studyStatus" required className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium appearance-none">
                            <option value="">Selecciona...</option>
                            <option value="estudiante">Actualmente estudio</option>
                            <option value="graduado">Ya me gradue</option>
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Code2 className="w-3 h-3 text-cyan-500" /> ¿Sabes programar?
                        </label>
                        <select name="programmingLevel" required className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium appearance-none">
                            <option value="">Selecciona...</option>
                            <option value="si">Si, ya programo</option>
                            <option value="aprendiendo">Estoy aprendiendo</option>
                            <option value="no">No todavia</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Rocket className="w-3 h-3 text-cyan-500" /> ¿Quieres crear tu propio SaaS?
                        </label>
                        <select name="saasInterest" required className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium appearance-none">
                            <option value="">Selecciona...</option>
                            <option value="si_totalmente">Si, totalmente</option>
                            <option value="si_con_ayuda">Si, con ayuda</option>
                            <option value="aun_no">Aun no estoy seguro</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Wallet className="w-3 h-3 text-cyan-500" /> ¿Estarias dispuesto a invertir en tu formacion si ves valor?
                    </label>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:border-cyan-500/50 transition-all">
                            <input type="radio" name="investmentReady" value="si" required className="w-4 h-4 accent-cyan-500" />
                            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Si</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:border-cyan-500/50 transition-all">
                            <input type="radio" name="investmentReady" value="no" className="w-4 h-4 accent-cyan-500" />
                            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">No</span>
                        </label>
                    </div>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-400 text-xs font-bold bg-red-400/10 p-3 rounded-xl text-center"
                    >
                        {error}
                    </motion.p>
                )}

                <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                >
                    {isSubmitting ? (
                        <>Procesando... <Loader2 className="w-5 h-5 animate-spin" /></>
                    ) : (
                        <>Aplicar a la Masterclass <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                    )}
                </button>

                <p className="text-center text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-4">
                    Acceso exclusivo para perfiles seleccionados • Cupos LIMITADOS
                </p>
            </form>
        </motion.div>
    );
}

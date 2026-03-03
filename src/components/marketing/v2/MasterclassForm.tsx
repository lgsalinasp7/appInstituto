"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import { captureMasterclassLead } from "@/app/actions/masterclass";
import { useSearchParams, useRouter } from "next/navigation";
import { captureAttributionFromCurrentUrl, appendAttributionToFormData, getAttribution } from "@/lib/attribution";
import { trackLeadSubmit } from "@/lib/funnel-events";

export function MasterclassForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        captureAttributionFromCurrentUrl();
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Agregar UTMs/clids desde URL y persistencia local de atribución
        formData.append("utmSource", searchParams.get("utm_source") || "");
        formData.append("utmMedium", searchParams.get("utm_medium") || "");
        formData.append("utmCampaign", searchParams.get("utm_campaign") || "");
        formData.append("utmContent", searchParams.get("utm_content") || "");
        formData.append("fbclid", searchParams.get("fbclid") || "");
        formData.append("gclid", searchParams.get("gclid") || "");
        formData.append("ttclid", searchParams.get("ttclid") || "");
        appendAttributionToFormData(formData);
        formData.append("masterclassSlug", "masterclass-ia");

        try {
            const result = await captureMasterclassLead(formData);

            if (result.success) {
                const attribution = getAttribution();
                trackLeadSubmit({
                    funnel: "masterclass_ia",
                    page_path: "/masterclass-ia",
                    lead_id: result.leadId,
                    utm_source: attribution.utmSource || undefined,
                    utm_medium: attribution.utmMedium || undefined,
                    utm_campaign: attribution.utmCampaign || undefined,
                    fbclid: attribution.fbclid || undefined,
                    gclid: attribution.gclid || undefined,
                    ttclid: attribution.ttclid || undefined,
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
        <>
            <motion.div
                ref={formRef}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full max-w-lg mx-auto p-8 md:p-12 rounded-[2.5rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-left">
                        <p className="text-cyan-300 text-xs font-black uppercase tracking-widest mb-2">Importante</p>
                        <p className="text-slate-200 text-sm font-medium">
                            Al registrarte recibirás por WhatsApp la fecha, hora y enlace oficial de la masterclass.
                        </p>
                    </div>

                    <div className="space-y-5">
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
                            <p className="text-[11px] text-cyan-300 font-semibold">Revisa que este numero sea correcto. Ahi recibiras toda la informacion.</p>
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
                            <>Reservar mi cupo gratis <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                        )}
                    </button>

                    <div className="flex items-center justify-center gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-cyan-500" /> 100% Gratis</span>
                        <span className="text-slate-700">•</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-500" /> Confirmación inmediata</span>
                        <span className="text-slate-700">•</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-cyan-500" /> Acceso directo</span>
                    </div>
                </form>
            </motion.div>

            <FloatingMobileCTA formRef={formRef} />
        </>
    );
}

function FloatingMobileCTA({ formRef }: { formRef: React.RefObject<HTMLDivElement | null> }) {
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        setIsFormVisible(entries[0]?.isIntersecting ?? false);
    }, []);

    useEffect(() => {
        const el = formRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(handleIntersection, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [formRef, handleIntersection]);

    if (isFormVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden p-3 bg-slate-950/95 backdrop-blur-lg border-t border-cyan-500/20">
            <a
                href="#reservar"
                className="block w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-center text-base shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
                Reservar mi cupo gratis
            </a>
        </div>
    );
}

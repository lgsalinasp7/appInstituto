import { FunnelLayout } from "@/components/marketing/v2/FunnelLayout";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "¡Aplicación Recibida! | KaledSoft",
    description: "Tu aplicación a la Masterclass ha sido recibida con éxito. Revisa el siguiente paso.",
};

export default function MasterclassGraciasPage() {
    return (
        <FunnelLayout>
            <div className="container mx-auto px-6 pt-40 pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="glass-card rounded-[2.5rem] p-10 md:p-14 text-center relative overflow-hidden border border-cyan-500/20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70" />

                        <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                            Tu aplicacion fue <span className="text-cyan-500">recibida</span>
                        </h1>

                        <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-10">
                            Revisa tu WhatsApp ahora para confirmar tu cupo.
                        </p>

                        <a
                            href="https://wa.me/573337226157"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-base md:text-lg transition-all shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:shadow-[0_0_35px_rgba(34,197,94,0.45)]"
                        >
                            Ir a WhatsApp
                            <MessageCircle className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </FunnelLayout>
    );
}

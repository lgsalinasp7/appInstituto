import { MasterclassHero, MasterclassProblem, MasterclassPromise, MasterclassCurriculum, MasterclassUrgencyStrip } from "@/components/marketing/v2/MasterclassSections";
import { MasterclassForm } from "@/components/marketing/v2/MasterclassForm";
import { MasterclassLandingTracker } from "@/components/marketing/v2/MasterclassLandingTracker";
import { FunnelLayout } from "@/components/marketing/v2/FunnelLayout";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Masterclass IA: Construye tu SaaS en 4 Meses | KaledSoft",
    description: "La universidad no te preparó para esto. Únete a nuestra masterclass privada y descubre cómo la IA puede acelerar tu carrera tech.",
};

export default function MasterclassPage() {
    return (
        <FunnelLayout>
            <MasterclassLandingTracker />
            <MasterclassHero />

            <MasterclassProblem />

            <MasterclassPromise />

            <MasterclassCurriculum />

            <MasterclassUrgencyStrip />

            <section id="reservar" className="py-24 bg-slate-950/20">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center space-y-16">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">Reserva tu cupo gratis</h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                                Ingresa tus datos para reservar. Al finalizar te llevamos directo al WhatsApp con toda la información de la masterclass.
                            </p>
                        </div>

                        <Suspense fallback={<div className="text-white">Cargando...</div>}>
                            <MasterclassForm />
                        </Suspense>
                    </div>
                </div>
            </section>
        </FunnelLayout>
    );
}

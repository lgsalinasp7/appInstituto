import { MasterclassHero, MasterclassProblem, MasterclassPromise, MasterclassCurriculum, MasterclassUrgencyStrip } from "@/components/marketing/v2/MasterclassSections";
import { MasterclassForm } from "@/components/marketing/v2/MasterclassForm";
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
            <MasterclassHero />

            <MasterclassProblem />

            <MasterclassPromise />

            <MasterclassCurriculum />

            <MasterclassUrgencyStrip />

            <section id="aplicar" className="py-24 bg-slate-950/20">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center space-y-16">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">Ultimo paso: Reserva y acceso a WhatsApp</h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                                Completa este formulario para confirmar tu perfil. Al finalizar tu registro te llevamos al canal privado de WhatsApp con toda la informacion de la masterclass.
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

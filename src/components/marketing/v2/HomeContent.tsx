import { HeroV2 } from "@/components/marketing/v2/Hero";
import { ThesisV2 } from "@/components/marketing/v2/Thesis";
import { InstitutionalBlocksV2 } from "@/components/marketing/v2/InstitutionalBlocks";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeContent() {
    return (
        <main className="relative overflow-hidden">
            <HeroV2 />
            <ThesisV2 />
            <InstitutionalBlocksV2 />

            {/* Dynamic CTA */}
            <section className="py-32 container mx-auto px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-12">
                    <h2 className="text-4xl md:text-6xl font-black text-white font-display">
                        ¿Listo para construir <br />
                        <span className="text-primary-light">el software del mañana?</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium">
                        Únete a la nueva generación de fundadores impulsados por IA.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            href="/aplicar"
                            className="px-10 py-5 rounded-2xl bg-primary hover:bg-primary-light text-white font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-[0_0_40px_rgba(30,58,95,0.3)]"
                        >
                            Aplicar Ahora <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

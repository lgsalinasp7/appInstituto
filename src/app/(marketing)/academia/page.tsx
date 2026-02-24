import { Metadata } from "next";
import { AcademiaContent } from "@/components/marketing/v2/AcademiaContent";

export const metadata: Metadata = {
    title: "Academia de Inteligencia Artificial en Montería",
    description: "Únete a la mejor academia de IA y SaaS en Colombia. Formación de élite en agentes de IA, Next.js y arquitectura moderna para desarrolladores y fundadores.",
    keywords: ["Academia IA Montería", "Curso inteligencia artificial Colombia", "Aprender SaaS", "Desarrollo de software Montería", "KaledSoft Academia"],
};

export default function AcademiaPage() {
    return <AcademiaContent />;
}
